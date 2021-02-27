import json
import os
import re
from decimal import Decimal
from math import floor
from time import time
from typing import Dict, List, Optional, Tuple, Union, Mapping

import boto3
from boto3.dynamodb.conditions import Attr, Key
from boto3_type_annotations.dynamodb import ServiceResource as DynamoDB
from botocore.exceptions import ClientError
from recipe_scrapers import NoSchemaFoundInWildMode, scrape_me
from requests.exceptions import ConnectionError, InvalidURL
from requests.utils import prepend_scheme_if_needed

from common import CategoryEntry, RecipeEntry, Response, Serializable, is_collection
from common import logger as logging
from common import pformat_ as pformat
from common import verify_parameters, wrap_exception, wrap_response

# jwks = requests.get(
#     f"https://cognito-idp.{os.environ['AWS_REGION']}.amazonaws.com"
#     f"/{USER_POOL_ID}/.well-known/jwks.json"
# ).json()
#
# try:
#     id_token = jwt.decode(
#         res["IdToken"], key=jwks, access_token=res["AccessToken"], audience=CLIENT_ID
#     )
# except ExpiredSignatureError:
#     return wrap_exception(400, message="The token's signature has expired")
# except JWTError:
#     return wrap_exception(400, message="The token's signature is invalid")

event: Serializable

editable_category_fields = ("name",)
editable_recipe_fields = (
    "name",
    "categories",
    "desc",
    "ingredients",
    "instructions",
    "imgSrc",
    "cookTime",
    "yield",
)


def get_recipe(user_id: str, recipe_id: int, **kwargs) -> Response:
    resource: DynamoDB = boto3.resource("dynamodb")
    recipes_table = resource.Table(os.environ["recipes_table_name"])

    try:
        item = recipes_table.get_item(
            Key={"userId": user_id, "recipeId": recipe_id},
            **kwargs,
        ).get("Item")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            return wrap_exception(
                400,
                message=(
                    f"One of the following parameters is invalid: "
                    f"{{User ID: {user_id}, Recipe ID: {recipe_id}}}"
                ),
            )
        raise
    if not item:
        return wrap_response(
            404,
            success=False,
            error=True,
            message=f"User {user_id} does not have a recipe with ID {recipe_id}.",
        )
    return wrap_response(200, success=True, error=False, data=item)


def post_recipe(user_id: str, body: RecipeEntry, recipe_id: Optional[int] = None) -> Response:
    # If not updating an existing recipe, name must be present
    # TODO: Verify types
    verify_parameters(
        body, "name" if not recipe_id else None, valid_parameters=editable_recipe_fields
    )

    resource: DynamoDB = boto3.resource("dynamodb")
    recipes_table = resource.Table(os.environ["recipes_table_name"])
    res_data = {"recipeId": recipe_id}
    categories_to_add = body.get("add", {}).get("categories", {})

    if categories_to_add:
        new_categories, failed_adds = _add_categories_from_recipe(user_id, categories_to_add)
        res_data["newCategories"] = new_categories
        if failed_adds:
            res_data["failedAdds"] = failed_adds

    edit_time = floor(time() * 1000)
    if recipe_id is None:
        status_code = 201
        body["originalSubmitTime"] = edit_time
        res_data["originalSubmitTime"] = edit_time
        meta_table = resource.Table(os.environ["meta_table_name"])

        recipe_id = (
            meta_table.update_item(
                Key={"userId": user_id},
                UpdateExpression="ADD #nextRecipeId :inc",
                ExpressionAttributeNames={"#nextRecipeId": "nextRecipeId"},
                ExpressionAttributeValues={":inc": 1},
                ReturnValues="UPDATED_OLD",
            )
            .get("Attributes", {})
            .get("nextRecipeId", 0)
        )

        logging.info(
            f"Creating recipe with ID {recipe_id} for user with ID {user_id} and body {body}."
        )
    else:
        status_code = 200
        logging.info(
            f"Updating recipe with ID {recipe_id} for user with ID {user_id} and body {body}."
        )

    recipes_table.put_item(
        Item={
            **body,
            "userId": user_id,
            "recipeId": recipe_id,
            "lastEditedTime": edit_time,
        }
    )

    return wrap_response(
        status_code,
        success=True,
        error=False,
        data=res_data,
    )


def patch_recipe(
    user_id: str, body: Mapping[str, Mapping[str, Union[int, str, List[Union[int, str]]]]], recipe_id: int, *, batch: bool = False
) -> Union[Optional[Response], int]:
    kwargs = {"UpdateExpression": "", "ExpressionAttributeNames": {}, "ExpressionAttributeValues": {}}

    try:
        validation = {
            "add": dict,
            "remove": dict,
            "update": dict,
        }
        verify_parameters(body, valid_parameters=validation.keys(), parameter_types=validation)
        adds, removes, updates = [body.get(parameter) for parameter in validation]
        c = "categories"
        if adds:
            (categories_to_add,) = verify_parameters(adds, "categories", valid_parameters=[c])
            verify_parameters(categories_to_add, list_type=int)
            kwargs["UpdateExpression"] += f"ADD #{c} :{c}ToAdd"
            kwargs["ExpressionAttributeNames"][f"#{c}"] = c
            kwargs["ExpressionAttributeValues"][f":{c}ToAdd"] = set(categories_to_add)

        if removes:
            (categories_to_remove,) = verify_parameters(removes, c, valid_parameters=[c])
            verify_parameters(categories_to_remove, list_type=int)
            kwargs["UpdateExpression"] += f" DELETE #{c} :{c}ToRemove"
            kwargs["ExpressionAttributeNames"][f"#{c}"] = c
            kwargs["ExpressionAttributeValues"][f":{c}ToRemove"] = set(categories_to_remove)

        edit_time = floor(time() * 1000)
        updates["lastEditedTime"] = edit_time
        validation = {
            "name": str,
            "desc": str,
            "cookTime": str,
            "lastEditedTime": int,
            "ingredients": list,
            "instructions": list,
        }
        verify_parameters(
            updates, valid_parameters=validation.keys(), parameter_types=validation
        )
        updates.get("ingredients", verify_parameters(updates["ingredients"], list_type=str))
        updates.get("instructions", verify_parameters(updates["instructions"], list_type=str))
        kwargs["UpdateExpression"] += f" SET {', '.join(f'#{k} = :{k}' for k in updates)}"
        kwargs["ExpressionAttributeNames"].update({f"#{k}": k for k in updates})
        kwargs["ExpressionAttributeValues"].update({f":{k}": v for k, v in updates.items()})
        kwargs["UpdateExpression"].replace("  ", " ")
    except AssertionError:
        if batch:  # Continue with the rest of the batch
            return recipe_id
        raise

    logging.info(f"Updating recipe with ID {recipe_id} for user with ID {user_id} and body {body}.")
    resource: DynamoDB = boto3.resource("dynamodb")
    recipes_table = resource.Table(os.environ["recipes_table_name"])
    res_data = {"recipeId": recipe_id}
    categories_to_add = body.get("add", {}).get("categories", {})

    if categories_to_add:
        new_categories, failed_adds = _add_categories_from_recipe(user_id, categories_to_add)
        res_data["newCategories"] = new_categories
        if failed_adds:
            res_data["failedAdds"] = failed_adds

    try:
        # WHY CAN'T I ADD AND REMOVE TO/FROM A SET AT THE SAME TIME
        recipes_table.update_item(
            Key={"userId": user_id, "recipeId": recipe_id},
            ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
            **kwargs,
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return wrap_exception(
            404, message=f"User {user_id} does not have a recipe with ID {recipe_id}."
        )

    return None if batch else wrap_response(
        200,
        success=True,
        error=False,
        data=res_data,
    )


def put_recipe(user_id: str, body: RecipeEntry, recipe_id: int) -> Response:
    verify_parameters(body, valid_parameters=editable_recipe_fields)

    body["lastEditedTime"] = floor(time() * 1000)
    return post_recipe(user_id, recipe_id=recipe_id, body=body)


def delete_recipe(user_id: str, recipe_id: int) -> Response:
    logging.info(f"Deleting recipe with ID {recipe_id} for user with ID {user_id}.")
    resource: DynamoDB = boto3.resource("dynamodb")
    recipes_table = resource.Table(os.environ["recipes_table_name"])

    try:
        recipes_table.delete_item(
            Key={"userId": user_id, "recipeId": recipe_id},
            ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return wrap_exception(
            404, message=f"User {user_id} does not have a recipe with ID {recipe_id}."
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            return wrap_exception(
                400,
                message=(
                    f"One of the following parameters is invalid: "
                    f"{{User ID: {user_id}, Recipe ID: {recipe_id}}}"
                ),
            )
        raise

    return wrap_response(200, success=True, error=False)


def post_category(
    user_id: str,
    body: CategoryEntry,
    category_id: Optional[int] = None,
    *,
    internal: bool = False,
) -> Union[Response, CategoryEntry, int]:
    try:
        # If not updating an existing category, name must be present
        # TODO: Verify types
        verify_parameters(
            body, "name" if not category_id else None, valid_parameters=editable_category_fields
        )
    except AssertionError:
        if internal:  # Continue with the rest of the batch
            return category_id
        raise

    resource: DynamoDB = boto3.resource("dynamodb")
    categories_table = resource.Table(os.environ["categories_table_name"])

    edit_time = floor(time() * 1000)
    if category_id is None:
        status_code = 201
        body["originalSubmitTime"] = edit_time
        meta_table = resource.Table(os.environ["meta_table_name"])

        category_id = (
            meta_table.update_item(
                Key={"userId": user_id},
                UpdateExpression="ADD #nextCategoryId :inc",
                ExpressionAttributeNames={"#nextCategoryId": "nextCategoryId"},
                ExpressionAttributeValues={":inc": 1},
                ReturnValues="UPDATED_OLD",
            )
            .get("Attributes", {})
            .get("nextCategoryId", 0)
        )

        logging.info(
            f"Creating category with ID {category_id} for user with ID {user_id} and body {body}."
        )
    else:
        status_code = 200
        logging.info(
            f"Updating category with ID {category_id} for user with ID {user_id} and body {body}."
        )

    body.update(
        {
            "categoryId": category_id,
            "lastEditedTime": edit_time,
        }
    )
    categories_table.put_item(
        Item={
            **body,
            "userId": user_id,
        }
    )
    if internal:
        return body

    return wrap_response(status_code, success=True, error=False, data={"categoryId": category_id})


def patch_category(
    user_id: str, body: CategoryEntry, category_id: int, batch: bool = False
) -> Optional[Response]:
    try:
        validation = {
            "add": dict,
            "remove": dict,
            "update": dict,
        }
        verify_parameters(body, valid_parameters=validation.keys(), parameter_types=validation)
        adds, removes, updates = [body.get(parameter) for parameter in validation]

        # Only support adding and removing to/from categories as they're unordered
        if adds:
            (categories_to_add,) = verify_parameters(adds, "categories", valid_parameters=["categories"])
            verify_parameters(categories_to_add, list_type=int)
        if removes:
            (categories_to_remove,) = verify_parameters(removes, "categories", valid_parameters=["categories"])
            verify_parameters(categories_to_remove, list_type=int)
        if updates:
            validation = {
                "name": str,
                "desc": str,
                "cookTime": str,
                "ingredients": list,
                "instructions": list,
            }
            verify_parameters(
                updates, valid_parameters=validation.keys(), parameter_types=validation
            )
    except AssertionError:
        if batch:  # Continue with the rest of the batch
            return
        raise
    try:
        verify_parameters(body, valid_parameters=editable_category_fields)
    except AssertionError:
        if batch:  # Continue with the rest of the batch
            return
        raise

    logging.info(f"Updating category with ID {category_id} for user with ID {user_id}.")
    resource: DynamoDB = boto3.resource("dynamodb")
    categories_table = resource.Table(os.environ["categories_table_name"])

    body["lastEditedTime"] = floor(time() * 1000)

    try:
        categories_table.update_item(
            Key={"userId": user_id, "categoryId": category_id},
            ConditionExpression=Attr("userId").exists() & Attr("categoryId").exists(),
            UpdateExpression=f"SET {', '.join(f'#{k} = :{k}' for k in body)}",
            ExpressionAttributeNames={f"#{k}": k for k in body},
            ExpressionAttributeValues={f":{k}": v for k, v in body.items()},
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return wrap_exception(
            404, message=f"User {user_id} does not have a category with ID {category_id}."
        )
    return wrap_response(200, success=True, error=False, data={"categoryId": category_id})


def put_category(user_id: str, body: CategoryEntry, category_id: int) -> Response:
    verify_parameters(body, valid_parameters=editable_category_fields)

    body["lastEditedTime"] = floor(time() * 1000)
    return post_category(user_id, category_id=category_id, body=body)


def delete_category(user_id: str, category_id: int, batch: bool = False) -> Optional[Response]:
    logging.info(f"Deleting category with ID {category_id} for user with ID {user_id}.")
    resource: DynamoDB = boto3.resource("dynamodb")
    categories_table = resource.Table(os.environ["categories_table_name"])

    try:
        categories_table.delete_item(
            Key={"userId": user_id, "categoryId": category_id},
            ConditionExpression=Attr("userId").exists() & Attr("categoryId").exists(),
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return wrap_exception(
            404, message=f"User {user_id} does not have a category with ID {category_id}."
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            return wrap_exception(
                400,
                message=(
                    f"One of the following parameters is invalid: "
                    f"{{User ID: {user_id}, Category: {category_id}}}"
                ),
            )
        raise

    updated_recipes, failed_updates = _remove_category_from_recipes(user_id, category_id)
    res_data = {"updatedRecipes": updated_recipes}
    if failed_updates:
        res_data["failedUpdates"] = failed_updates

    return None if batch else wrap_response(200, success=True, error=False, data=res_data)


def recipes() -> Response:
    method = event["httpMethod"]
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    body = json.loads(event["body"] or "{}")

    if method == "GET":
        kwargs = _format_query_fields(
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
        )
        if event["path"] == "":  # Get all recipes
            # TODO: Paginate
            resource: DynamoDB = boto3.resource("dynamodb")
            recipes_table = resource.Table(os.environ["recipes_table_name"])
            items = recipes_table.query(KeyConditionExpression=Key("userId").eq(user_id), **kwargs)[
                "Items"
            ]
            return wrap_response(200, success=True, error=False, data={"recipes": items})
        else:  # Get specific recipe
            try:
                recipe_id = int(event["path"][1:])
            except ValueError:
                return wrap_exception(message=f"{event['path'][1:]} is not a valid recipe ID.")
            return get_recipe(user_id, recipe_id, **kwargs)
    elif method in ("POST", "PATCH", "PUT"):
        if method == "POST":  # Create a recipe
            if event["path"] == "":
                return post_recipe(user_id, body)
        elif method == "PATCH":
            if event["path"] != "":
                try:  # Update a specific recipe
                    recipe_id = int(event["path"][1:])
                except ValueError:
                    return wrap_exception(message=f"{event['path'][1:]} is not a valid recipe ID.")
                return patch_recipe(user_id, body, recipe_id)
            else:  # Batch update
                (recipe_list,) = verify_parameters(body, "recipes", valid_parameters=["recipes"])
                try:
                    recipe_list = recipe_list.items()
                except AttributeError:
                    return wrap_exception(message=f"Invalid recipes body: {recipe_list}")

                res_data = {}
                for recipe_id, recipe in recipe_list:
                    try:
                        recipe_id = int(recipe_id)
                    except ValueError:
                        logging.exception(f"{recipe_id} is not a valid recipe ID.")
                        res_data.setdefault("failed", []).append(recipe_id)
                        continue
                    res = patch_recipe(user_id, recipe, recipe_id).get("statusCode")
                    res != 200 and res_data.setdefault("failed", []).append(recipe_id)

                return wrap_response(200, success=True, error=False, data=res_data)
        elif method == "PUT":  # Update a specific recipe
            try:
                recipe_id = int(event["path"][1:])
            except ValueError:
                return wrap_exception(message=f"{event['path'][1:]} is not a valid recipe ID.")
            return put_recipe(user_id, body, recipe_id)
    elif method == "DELETE":
        if event["path"] != "":  # Delete a specific recipe
            try:
                recipe_id = int(event["path"][1:])
            except ValueError:
                return wrap_exception(message=f"{event['path'][1:]} is not a valid recipe ID.")
            return delete_recipe(user_id, recipe_id)
        else:  # Batch delete
            (recipe_ids,) = verify_parameters(body, "recipeIds", valid_parameters=["recipeIds"])
            if not is_collection(recipe_ids):  # Must be a collection
                return wrap_exception(message=f"Invalid recipeIds body: {recipe_ids}")

            res_data = {}
            for recipe_id in recipe_ids:
                try:
                    recipe_id = int(recipe_id)
                except ValueError:
                    logging.exception(f"{recipe_id} is not a valid recipe ID.")
                    res_data.setdefault("failed", []).append(recipe_id)
                    continue
                res = delete_recipe(user_id, recipe_id).get("statusCode")
                res != 200 and res_data.setdefault("failed", []).append(recipe_id)
            return wrap_response(200, success=True, error=False, data=res_data)

    return wrap_response(
        405, success=False, error=True, message="Unsupported HTTP method/resource combination."
    )


def categories() -> Response:
    method = event["httpMethod"]
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    body = json.loads(event["body"] or "{}")

    if method == "GET" and event["path"] == "":  # Get all categories
        # TODO: Paginate
        logging.info(f"Getting all categories for user with ID {user_id}.")
        resource: DynamoDB = boto3.resource("dynamodb")
        categories_table = resource.Table(os.environ["categories_table_name"])

        kwargs = _format_query_fields("categoryId", "name", "lastEditedTime", "originalSubmitTime")
        items = categories_table.query(KeyConditionExpression=Key("userId").eq(user_id), **kwargs)[
            "Items"
        ]
        return wrap_response(
            200,
            success=True,
            error=False,
            data={"categories": items},
        )
    elif method in ("POST", "PATCH", "PUT"):
        if method == "POST":  # Create a category
            if event["path"] == "":
                return post_category(user_id, body=body)
        elif method == "PATCH":
            if event["path"] != "":
                try:  # Update a specific category
                    category_id = int(event["path"][1:])
                except ValueError:
                    return wrap_exception(
                        message=f"{event['path'][1:]} is not a valid category ID."
                    )
                return patch_category(user_id, body, category_id)
            else:  # Batch update
                (category_list,) = verify_parameters(
                    body, "categories", valid_parameters=["categories"]
                )
                try:
                    category_list = category_list.items()
                except AttributeError:
                    return wrap_exception(message=f"Invalid categories body: {category_list}")

                res_data = {}
                for category_id, category in category_list:
                    try:
                        category_id = int(category_id)
                    except ValueError:
                        logging.exception(f"{category_id} is not a valid category ID.")
                        res_data.setdefault("failed", []).append(category_id)
                        continue
                    res = patch_category(user_id, category, category_id, batch=True).get(
                        "statusCode"
                    )
                    not res and res_data.setdefault("failed", []).append(category_id)
                return wrap_response(200, success=True, error=False, data=res_data)
        elif method == "PUT":  # Update a specific category
            try:
                category_id = int(event["path"][1:])
            except ValueError:
                return wrap_exception(message=f"{event['path'][1:]} is not a valid category ID.")
            return put_category(user_id, body, category_id)
    elif method == "DELETE":
        if event["path"] != "":  # Delete a specific category
            try:
                category_id = int(event["path"][1:])
            except ValueError:
                return wrap_exception(message=f"{event['path'][1:]} is not a valid category ID.")
            return delete_category(user_id, category_id)
        else:  # Batch delete
            category_ids = verify_parameters(body, "categoryIds", valid_parameters=["categoryIds"])
            if not is_collection(category_ids):  # Must be a collection
                return wrap_exception(message=f"Invalid categoryIds body: {category_ids}")

            res_data = {}
            for category_id in category_ids:
                try:
                    category_id = int(category_id)
                except ValueError:
                    logging.exception(f"{category_id} is not a valid category ID.")
                    res_data.setdefault("failed", []).append(category_id)
                    continue
                res = delete_category(user_id, category_id, batch=True).get("statusCode")
                not res and res_data.setdefault("failed", []).append(category_id)
            return wrap_response(200, success=True, error=False, data=res_data)

    return wrap_response(
        405, success=False, error=True, message="Unsupported HTTP method/resource combination."
    )


def scrape() -> Response:
    (url,) = verify_parameters(event.get("queryStringParameters"))
    url = prepend_scheme_if_needed(url, "https")
    logging.info(f"Scraping url: {url}")
    try:
        scraped = scrape_me(url, wild_mode=True)
    except NoSchemaFoundInWildMode:
        return wrap_response(
            200,
            success=False,
            error=True,
            message=f"No recipe schema found at {url}",
            data={"url": url},
        )
    except (ConnectionError, InvalidURL):
        return wrap_exception(message=f"{url} is not a valid url.")
    except Exception:
        return wrap_exception(message=r"¯\_(ツ)_/¯")

    data = {
        "url": url,
        "name": scraped.title(),
        "imgSrc": scraped.image(),
        "adaptedFrom": scraped.site_name() or scraped.host(),
        "yield": scraped.yields(),
        "cookTime": scraped.total_time() or "",
        "instructions": _normalize_list(scraped.instructions()),
        "ingredients": _normalize_list(scraped.ingredients()),
    }
    logging.info(f"Found data:\n{pformat(data)}")
    return wrap_response(200, success=True, error=False, data=data)


def _remove_category_from_recipes(user_id: str, category_id: int) -> Tuple[List[int], List[int]]:
    resource: DynamoDB = boto3.resource("dynamodb")
    recipes_table = resource.Table(os.environ["recipes_table_name"])
    kwargs = _format_query_fields("recipeId")
    recipes_to_update = [
        recipe["recipeId"]
        for recipe in recipes_table.query(
            KeyConditionExpression=Key("userId").eq(user_id),
            FilterExpression=Attr("categories").contains(category_id),
            **kwargs,
        ).get("Items", [])
    ]

    failed_updates = [recipe_id for recipe_id in (
        patch_recipe(
            user_id, body={"removes": {"categories": [category_id]}}, recipe_id=recipe_id, batch=True
        )
        for recipe_id in recipes_to_update
    ) if recipe_id]

    return recipes_to_update, failed_updates


def _add_categories_from_recipe(
    user_id: str, body: RecipeEntry
) -> Tuple[List[CategoryEntry], List[int]]:
    new_category_names = set(body.get("categories", []))
    if not new_category_names:
        return [], []

    resource: DynamoDB = boto3.resource("dynamodb")
    categories_table = resource.Table(os.environ["categories_table_name"])
    kwargs = _format_query_fields("categoryId", "name", "lastEditedTime", "originalSubmitTime")
    existing_categories = categories_table.query(
        KeyConditionExpression=Key("userId").eq(user_id), **kwargs
    ).get("Items", [])
    existing_category_names = (category["name"] for category in existing_categories)
    new_category_names = (
        category for category in body["categories"] if category not in existing_category_names
    )

    # Filter out any potential failed adds
    new_categories: List[CategoryEntry] = []
    failed_adds: List[int] = []
    for name in new_category_names:
        res = post_category(user_id, body={"name": name}, internal=True)
        if isinstance(res, int):
            failed_adds.append(res)
        else:
            new_categories.append(res)

    return new_categories, failed_adds


def _normalize_list(list_: Union[str, List[str]]) -> List:
    return (
        [re.sub(r"^\d+[.:]? ?", "", entry) for entry in list_.split("\n")]
        if isinstance(list_, str)
        else list_
    )


def _format_query_fields(*fields: str) -> Dict[str, Union[str, Dict[str, str]]]:
    return {
        "ProjectionExpression": ", ".join(f"#{field}" for field in fields),
        "ExpressionAttributeNames": {f"#{field}": field for field in fields},
    }


def handler(e: Serializable, _) -> Response:
    global event
    event = e

    logging.info(
        "\n".join(
            (
                "\nEvent:",
                pformat(event),
                "Environment:",
                pformat(dict(os.environ)),
            )
        )
    )

    valid_resources = {"recipes": recipes, "categories": categories, "scrape": scrape}

    path = event["path"][1:]
    resource = path[: path.find("/")] if "/" in path else path
    try:
        operation = valid_resources[resource]
    except KeyError:
        res = wrap_response(
            405, success=False, error=True, message="Unsupported HTTP method/resource combination."
        )
    else:
        event["path"] = path[len(resource) :]
        try:
            res = operation()
        except AssertionError as e:
            res = wrap_exception(message=e.args[0])

    return res
