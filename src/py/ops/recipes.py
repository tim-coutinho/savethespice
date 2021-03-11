from math import floor
from time import time
from typing import Iterable, List, Mapping, MutableMapping, Optional, Tuple, Union, cast

from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from lib.common import (
    format_query_fields,
    get_categories_table,
    get_meta_table,
    get_recipes_table,
    root_logger,
    verify_parameters,
)
from lib.types import CategoryEntry, RecipeEntry, Response, ResponseData
from ops.categories import post_category

logging = root_logger.getChild("recipes")


editable_recipe_fields = {
    "name": str,
    "categories": list,
    "desc": str,
    "ingredients": list,
    "instructions": list,
    "imgSrc": str,
    "cookTime": str,
    "yield": str,
}


def get_recipes(user_id: str) -> Response:
    """
    GET all recipes in the database.

    :param user_id: ID of the user
    :return: (Response specifics, status code)
    """
    logging.info(f"Getting all recipes for user with ID {user_id}.")
    kwargs = format_query_fields(
        [
            "recipeId",
            "name",
            "desc",
            "url",
            "adaptedFrom",
            "cookTime",
            "yield",
            "categories",
            "instructions",
            "ingredients",
            "imgSrc",
            "lastEditedTime",
            "originalSubmitTime",
        ],
    )

    # TODO: Paginate
    recipes_table, _ = get_recipes_table()
    items = recipes_table.query(KeyConditionExpression=Key("userId").eq(user_id), **kwargs).get(
        "Items", []
    )

    return ResponseData(data={"recipes": items}), 200


def get_recipe(user_id: str, recipe_id: int) -> Response:
    """
    GET a specific recipe in the database.

    :param user_id: ID of the user
    :param recipe_id: ID of the recipe being retrieved
    :return: (Response specifics, status code)
    """
    logging.info(f"Getting recipe with ID {recipe_id} for user with ID {user_id}.")
    kwargs = format_query_fields(
        [
            "recipeId",
            "name",
            "desc",
            "url",
            "adaptedFrom",
            "cookTime",
            "yield",
            "categories",
            "instructions",
            "ingredients",
            "imgSrc",
            "lastEditedTime",
            "originalSubmitTime",
        ],
    )

    recipes_table, _ = get_recipes_table()
    try:
        item = recipes_table.get_item(
            Key={"userId": user_id, "recipeId": recipe_id},
            **kwargs,
        ).get("Item", {})
    except ClientError as e:
        logging.exception("")
        if e.response["Error"]["Code"] == "ValidationException":
            return (
                ResponseData(
                    message=(
                        "One of the following parameters is invalid: "
                        f"{{User ID: {user_id}, Recipe ID: {recipe_id}}}"
                    ),
                    exception=True,
                ),
                400,
            )
        raise
    if not item:
        return (
            ResponseData(
                message=f"User {user_id} does not have a recipe with ID {recipe_id}.",
            ),
            404,
        )

    return ResponseData(data=item), 200


def post_recipe(
    user_id: str,
    body: RecipeEntry,
    recipe_id: Optional[int] = None,
) -> Response:
    """
    POST a recipe to the database, adding a new entry. If 'recipe_id' is specified, instead replace
    an existing recipe.

    :param user_id: ID of the user
    :param body: Recipe data to replace with
    :param recipe_id: ID of the recipe being replaced
    :return: (Response specifics, status code)
    """
    # If not updating an existing recipe, name must be present
    # TODO: Verify types
    verify_parameters(
        body,
        "name" if not recipe_id else None,
        valid_parameters=editable_recipe_fields,
        parameter_types=editable_recipe_fields,
    )
    verify_parameters(body.get("ingredients", []), list_type=str)
    verify_parameters(body.get("instructions", []), list_type=str)
    body = {k: v for k, v in body.items() if v}

    res_data = {}
    categories_to_add = body.get("categories", [])

    if categories_to_add:
        existing_categories, new_categories, failed_adds = add_categories_from_recipe(
            user_id, categories_to_add
        )
        body["categories"] = {
            category["categoryId"] for category in (*existing_categories, *new_categories)
        }
        if existing_categories:
            res_data["existingCategories"] = existing_categories
        if new_categories:
            res_data["newCategories"] = new_categories
        if failed_adds:
            res_data["categoryFailedAdds"] = failed_adds

    edit_time = floor(time() * 1000)
    if recipe_id is None:  # POST
        status_code = 201
        body["originalSubmitTime"] = edit_time
        res_data["originalSubmitTime"] = edit_time
        meta_table, _ = get_meta_table()
        kwargs = format_query_fields(
            {"nextRecipeId": 1},
            projection_expression=False,
            attribute_names=True,
            attribute_values=True,
        )

        recipe_id = (
            meta_table.update_item(
                Key={"userId": user_id},
                UpdateExpression="ADD #nextRecipeId :nextRecipeId",
                ReturnValues="UPDATED_OLD",
                **kwargs,
            )
            .get("Attributes", {})
            .get("nextRecipeId", 0)
        )

        logging.info(
            f"Creating recipe with ID {recipe_id} for user with ID {user_id} and body {body}."
        )
    else:  # PUT
        status_code = 200
        logging.info(
            f"Updating recipe with ID {recipe_id} for user with ID {user_id} and body {body}."
        )

    recipes_table, _ = get_recipes_table()
    recipes_table.put_item(
        Item={
            **body,
            "userId": user_id,
            "recipeId": recipe_id,
            "lastEditedTime": edit_time,
        }
    )

    res_data["recipeId"] = recipe_id
    return ResponseData(data=res_data), status_code


def patch_recipe(
    user_id: str,
    body: Mapping[str, MutableMapping[str, Union[str, Union[Iterable[int], Iterable[str]]]]],
    recipe_id: int,
    *,
    batch: bool = False,
) -> Response:
    """
    PATCH a recipe in the database, updating the specified entry.

    For categories: if being added or updated, specify by name. If being removed, specify by ID.

    :param user_id: ID of the user
    :param body: Mapping of PATCH operations to recipe data. Currently supports 'add', 'remove', and
                 'update'
    :param recipe_id: ID of the recipe being updated
    :param batch: Whether or not this is part of a batch operation
    :return: (Response specifics, status code)
    """
    kwargs = {
        "UpdateExpression": "",
        "ExpressionAttributeNames": {},
        "ExpressionAttributeValues": {},
    }
    remove_kwargs = {
        "UpdateExpression": "",
        "ExpressionAttributeNames": {},
        "ExpressionAttributeValues": {},
    }
    res_data = {"recipeId": recipe_id}

    try:
        validation = {
            "add": dict,
            "remove": dict,
            "update": dict,
        }
        verify_parameters(body, valid_parameters=validation.keys(), parameter_types=validation)
        adds, removes, updates = (body.get(parameter, {}) for parameter in validation)
        c = "categories"
        if c in updates and (c in adds or c in removes):
            raise AssertionError("Categories cannot be updated and added/removed simultaneously.")

        if adds:
            (categories_to_add,) = verify_parameters(adds, c, valid_parameters=[c])
            verify_parameters(categories_to_add, list_type=str)

            existing_categories, new_categories, failed_adds = add_categories_from_recipe(
                user_id, categories_to_add
            )
            if existing_categories:
                res_data["existingCategories"] = existing_categories
            if new_categories:
                res_data["newCategories"] = new_categories
                kwargs["UpdateExpression"] += f"ADD #{c} :{c}"
                kwargs["ExpressionAttributeNames"][f"#{c}"] = c
                kwargs["ExpressionAttributeValues"][f":{c}"] = {
                    category["categoryId"] for category in new_categories
                }
            if failed_adds:
                res_data["categoryFailedAdds"] = failed_adds

        if removes:
            # Can't add to and remove from a set in the same call, need separate kwargs
            (categories_to_remove,) = verify_parameters(removes, c, valid_parameters=[c])
            verify_parameters(categories_to_remove, list_type=int)
            remove_kwargs["UpdateExpression"] = f"DELETE #{c} :{c}"
            remove_kwargs["ExpressionAttributeNames"][f"#{c}"] = c
            remove_kwargs["ExpressionAttributeValues"][f":{c}"] = set(categories_to_remove)

        if updates:
            verify_parameters(
                updates,
                valid_parameters=editable_recipe_fields.keys(),
                parameter_types=editable_recipe_fields,
            )
            verify_parameters(updates.get("ingredients", []), list_type=str)
            verify_parameters(updates.get("instructions", []), list_type=str)

            categories = updates.get(c)
            if categories:
                verify_parameters(categories, list_type=str)

                existing_categories, new_categories, failed_adds = add_categories_from_recipe(
                    user_id, categories_to_add
                )
                if existing_categories:
                    res_data["existingCategories"] = existing_categories
                if new_categories:
                    res_data["newCategories"] = new_categories
                    updates[c] = {
                        category["categoryId"]
                        for category in (*existing_categories, *new_categories)
                    }
                if failed_adds:
                    res_data["categoryFailedAdds"] = failed_adds
    except AssertionError:
        if batch:  # Continue with the rest of the batch
            return {}, 400
        raise

    edit_time = floor(time() * 1000)
    updates["lastEditedTime"] = edit_time

    kwargs["UpdateExpression"] += f" SET {', '.join(f'#{k} = :{k}' for k in updates)}"
    kwargs["ExpressionAttributeNames"].update({f"#{k}": k for k in updates})
    kwargs["ExpressionAttributeValues"].update({f":{k}": v for k, v in updates.items()})
    kwargs["UpdateExpression"] = kwargs["UpdateExpression"].replace("  ", " ")

    recipes_table, resource = get_recipes_table()

    logging.info(f"Updating recipe with ID {recipe_id} for user with ID {user_id} and body {body}.")
    try:
        if removes:
            recipes_table.update_item(
                Key={"userId": user_id, "recipeId": recipe_id},
                ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
                **remove_kwargs,
            )
        recipes_table.update_item(
            Key={"userId": user_id, "recipeId": recipe_id},
            ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
            **kwargs,
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return (
            ResponseData(
                message=f"User {user_id} does not have a recipe with ID {recipe_id}.",
            ),
            404,
        )

    return ResponseData(data=res_data), 200


def patch_recipes(
    user_id: str,
    body: Mapping[str, Mapping[str, MutableMapping[str, Union[str, Union[List[int], List[str]]]]]],
) -> Response:
    """
    Batch update a set of recipe IDs.

    :param user_id: ID of the user
    :param body: Mapping of recipe IDs to PATCH operations. See patch_recipe for operation details
    :return: (Response specifics, status code)
    """
    try:
        body = body.items()
    except AttributeError:
        logging.exception("")
        return ResponseData(message=f"Invalid recipes body: {body}", exception=True), 400

    res_data = {}
    for recipe_id, operations in body:
        try:
            recipe_id = int(recipe_id)
        except ValueError:
            logging.exception(f"{recipe_id} is not a valid recipe ID.")
            res_data.setdefault("failedUpdates", []).append(recipe_id)
            continue
        _, status_code = patch_recipe(user_id, operations, recipe_id)
        status_code != 200 and res_data.setdefault("failedUpdates", []).append(recipe_id)

    return ResponseData(data=res_data), 200


def put_recipe(user_id: str, body: RecipeEntry, recipe_id: int) -> Response:
    """
    PUT a recipe to the database, replacing the specified entry.

    :param user_id: ID of the user
    :param body: Recipe data to replace with
    :param recipe_id: ID of the recipe being replaced
    :return: (Response specifics, status code)
    """
    return post_recipe(user_id, recipe_id=recipe_id, body=body)


def delete_recipe(user_id: str, recipe_id: int) -> Response:
    """
    DELETE the specified recipe from the database.

    :param user_id: ID of the user
    :param recipe_id: ID of the recipe being deleted
    :return: (Response specifics, status code)
    """
    recipes_table, resource = get_recipes_table()

    logging.info(f"Deleting recipe with ID {recipe_id} for user with ID {user_id}.")
    try:
        recipes_table.delete_item(
            Key={"userId": user_id, "recipeId": recipe_id},
            ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return (
            ResponseData(
                message=f"User {user_id} does not have a recipe with ID {recipe_id}.",
            ),
            404,
        )
    except ClientError as e:
        logging.exception("")
        if e.response["Error"]["Code"] == "ValidationException":
            return (
                ResponseData(
                    message=(
                        "One of the following parameters is invalid: "
                        f"{{User ID: {user_id}, Recipe ID: {recipe_id}}}"
                    ),
                    exception=True,
                ),
                400,
            )
        raise

    return {}, 204


def delete_recipes(user_id: str, recipe_ids: Iterable[int]):
    """
    Batch delete a list of recipe IDs.

    :param user_id: ID of the user
    :param recipe_ids: List of recipe IDs
    :return: (Response specifics, status code)
    """
    verify_parameters(recipe_ids, list_type=int)

    res_data = {}
    for recipe_id in recipe_ids:
        if not isinstance(recipe_id, int):
            res_data.setdefault("failedDeletions", []).append(recipe_id)
            continue
        _, status_code = delete_recipe(user_id, recipe_id)
        status_code != 204 and res_data.setdefault("failedDeletions", []).append(recipe_id)

    if not res_data:
        return {}, 204
    return ResponseData(data=res_data), 200


def add_categories_from_recipe(
    user_id: str, category_names: Iterable[str]
) -> Tuple[List[CategoryEntry], List[CategoryEntry], List[str]]:
    """
    Add categories from a recipe that don't already exist by name.

    :param user_id: ID of the user
    :param category_names: Names of the categories being added in the recipe request
    :return: (Existing category entries found by name, New category entries, Any failed category
              additions)
    """
    if not category_names:
        return [], [], []
    category_names = set(category_names)
    categories_table, resource = get_categories_table()
    kwargs = format_query_fields(["categoryId", "name"])
    existing_categories = categories_table.query(
        KeyConditionExpression=Key("userId").eq(user_id),
        FilterExpression=Attr("name").is_in(cast(List[str], category_names)),
        **kwargs,
    ).get("Items", [])
    categories_to_return = [
        category for category in existing_categories if category["name"] in category_names
    ]

    categories_to_add = category_names.difference(
        category["name"] for category in existing_categories
    )

    if categories_to_add:
        logging.info(f"Adding categories {categories_to_add} to user with ID {user_id}.")
    new_categories, failed_adds = [], []
    for name in categories_to_add:
        res, status_code = post_category(user_id, body={"name": name}, batch=True)
        failed_adds.append(name) if status_code != 201 else new_categories.append(
            cast(CategoryEntry, res["data"])
        )

    return categories_to_return, new_categories, failed_adds


def remove_categories_from_recipes(user_id: str, category_ids: Iterable[int]) -> Response:
    """
    Remove references to the specified category from all recipes.

    :param user_id: ID of the user
    :param category_ids: IDs of the categories to remove
    :return: (Response specifics, status code)
    """
    recipes_table, resource = get_recipes_table()
    kwargs = format_query_fields(["recipeId", "categories"])
    recipes_to_update = [
        recipe["recipeId"]
        for recipe in recipes_table.query(
            KeyConditionExpression=Key("userId").eq(user_id),
            **kwargs,
        ).get("Items", [])
        # Check if it shares any categories with category_ids. Can't be done with
        # FilterExpression due to it not supporting checking for multiple items in sets
        if not recipe.get("categories", set()).isdisjoint(category_ids)
    ]
    if not recipes_to_update:
        return {}, 204

    logging.info(
        f"Removing references to categories with IDs {category_ids} from "
        f"recipes with IDs {recipes_to_update} for user with ID {user_id}."
    )
    updated_recipes, failed_updates = [], []
    for recipe_id in recipes_to_update:
        _, status_code = patch_recipe(
            user_id,
            body={"remove": {"categories": category_ids}},
            recipe_id=recipe_id,
            batch=True,
        )
        failed_updates.append(recipe_id) if status_code != 200 else updated_recipes.append(
            recipe_id
        )

    return (
        ResponseData(
            data={"updatedRecipes": updated_recipes, "failedUpdatedRecipes": failed_updates}
        ),
        200,
    )
