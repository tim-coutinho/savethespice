import os
import re
from collections import Iterable
from typing import Optional, TypedDict, Union, cast
from uuid import uuid4

import boto3
import requests
from boto3_type_annotations.dynamodb import Client as DynamoDBClient
from boto3_type_annotations.s3 import Object
from botocore.exceptions import ClientError
from fastapi import APIRouter, Request, Response, status

# noinspection PyProtectedMember
from recipe_scrapers import NoSchemaFoundInWildMode, scrape_me
from requests.exceptions import ConnectionError, InvalidURL
from requests.utils import prepend_scheme_if_needed

from savethespice.crud import categories_table, meta_table, recipes_table
from savethespice.lib.common import pformat, root_logger
from savethespice.models import (
    Category,
    DeleteRecipeResponse,
    DeleteRecipesRequest,
    DeleteRecipesResponse,
    GetRecipeResponse,
    GetRecipesResponse,
    PostRecipeRequest,
    PostRecipeResponse,
    PutRecipeRequest,
    PutRecipeResponse,
    PutRecipesRequest,
    PutRecipesResponse,
    Recipe,
    RecipeBase,
    ScrapeRecipeResponse,
)

IMAGE_PREFIX = f"https://{os.environ.get('images_bucket_name', '')}.s3-us-west-2.amazonaws.com/"
logging = root_logger.getChild(__name__)
api = APIRouter(prefix="/private", tags=["recipes"])


@api.get("/recipes", response_model=GetRecipesResponse)
async def get_recipes(req: Request):
    """
    Get all recipes in the database.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Getting all recipes for user with ID {user_id}.")
    recipes = recipes_table.get_all(user_id)
    logging.info("Successfully got recipes.")

    return {"data": {"recipes": recipes}}


@api.delete("/recipes", response_model=DeleteRecipesResponse)
async def delete_recipes(recipe_ids: DeleteRecipesRequest, req: Request, res: Response):
    """
    Batch delete a list of recipe IDs from the database.
    """
    user_id: str = req.scope["USER_ID"]
    client: DynamoDBClient = boto3.client("dynamodb")
    failed_deletions: list[int] = []

    for recipe_id in recipe_ids:
        logging.info(f"Deleting recipe with ID {recipe_id} for user with ID {user_id}.")
        try:
            image_source = recipes_table.delete(user_id, recipe_id)
        except (client.exceptions.ConditionalCheckFailedException, ClientError):
            failed_deletions.append(recipe_id)
        else:
            if image_source and image_source.startswith(IMAGE_PREFIX):
                # Delete self-hosted image from S3
                key = image_source.removeprefix(IMAGE_PREFIX)
                logging.info(f"Deleting image with key {key} for user with ID {user_id}.")
                image: Object = boto3.resource("s3").Object(os.environ["images_bucket_name"], key)
                image.delete()

    logging.info(
        "Successfully deleted recipes with IDs "
        f"{[recipe_id for recipe_id in recipe_ids if recipe_id not in failed_deletions]}"
    )
    if not failed_deletions:
        res.status_code = status.HTTP_204_NO_CONTENT
        return

    return {"data": {"failedDeletions": failed_deletions}}


# TODO
# @api.patch("/recipes", response_model=PatchRecipesResponse)
# async def patch_recipes(
#     req: Request,
#     res: Response,
#     patch_request: PatchRecipesRequest = Body(
#         ...,
#         example={
#             0: {"update": {"name": "NewName", "desc": "NewDesc"}},
#             1: {"add": {"categories": ["NewCategory1", "NewCategory2"]}},
#         },
#     ),
# ):
#     """
#     Batch update a list of recipes in the database.
#     """
#     failed_updates: list[int] = []
#
#     for recipe_id, recipe in patch_request.items():
#         # TODO
#         _, status_code = patch_recipe(recipe_id, recipe, req, res)
#         status_code >= status.HTTP_400_BAD_REQUEST and failed_updates.append(recipe_id)
#
#     logging.info(
#         "Successfully patched recipes with IDs "
#         f"{[recipe_id for recipe_id in patch_request if recipe_id not in failed_updates]}"
#     )
#     if not failed_updates:
#         res.status_code = status.HTTP_204_NO_CONTENT
#         return
#
#     return {"data": {"failedUpdates": failed_updates}}


@api.post("/recipes", response_model=PostRecipeResponse, status_code=status.HTTP_201_CREATED)
async def post_recipe(recipe: PostRecipeRequest, req: Request):
    """
    Post a recipe to the database.
    """
    logging.info(f"Received request to post a recipe with name {recipe.name}")
    user_id: str = req.scope["USER_ID"]
    recipe_id = meta_table.get_next_id(user_id, "recipe")

    logging.info(
        f"Creating recipe with ID {recipe_id} for user with ID {user_id} and body {recipe}."
    )
    item, add_categories_from_recipe_response = _upsert_recipe(user_id, recipe_id, recipe)
    logging.info(f"Successfully posted recipe with name {recipe.name} with ID {recipe_id}")

    return {"data": {**item.dict(), **add_categories_from_recipe_response}}


@api.put("/recipes", response_model=PutRecipesResponse)
async def put_recipes(recipes: PutRecipesRequest, req: Request):
    """
    Batch put a list of recipes to the database.
    """
    user_id: str = req.scope["USER_ID"]
    res_data = {
        "recipes": [],
        "existingCategories": [],
        "newCategories": [],
        "categoryFailedAdds": [],
    }

    logging.info(f"Batch adding recipes from body {recipes}")
    for recipe in recipes:
        recipe_id = meta_table.get_next_id(user_id, "recipe")
        logging.info(
            f"Creating recipe with ID {recipe_id} for user with ID {user_id} and body {recipe}."
        )
        item, add_categories_from_recipe_response = _upsert_recipe(user_id, recipe_id, recipe)
        for k, v in add_categories_from_recipe_response.items():
            res_data[k].extend(v)
        res_data["recipes"].append(item)
    logging.info(f"Successfully put recipes with names {[recipe.name for recipe in recipes]}")

    return {"data": res_data}


@api.get("/recipes/{recipe_id}", response_model=GetRecipeResponse)
async def get_recipe(recipe_id: int, req: Request, res: Response):
    """
    Get a specific recipe in the database.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Getting recipe with ID {recipe_id} for user with ID {user_id}.")

    try:
        item = recipes_table.get(user_id, recipe_id)
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            res.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "message": "One of the following parameters is invalid: "
                f"{{User ID: {user_id}, Recipe ID: {recipe_id}}}"
            }
        raise
    if not item:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {user_id} does not have a recipe with ID {recipe_id}."}
    logging.info(f"Successfully got recipe with ID {recipe_id}")

    return {"data": item}


@api.delete("/recipes/{recipe_id}", response_model=DeleteRecipeResponse)
async def delete_recipe(recipe_id: int, req: Request, res: Response):
    """
    Delete a recipe in the database by ID.
    """
    user_id: str = req.scope["USER_ID"]
    client: DynamoDBClient = boto3.client("dynamodb")

    logging.info(f"Deleting recipe with ID {recipe_id} for user with ID {user_id}.")
    try:
        image_source = recipes_table.delete(user_id, recipe_id)
    except client.exceptions.ConditionalCheckFailedException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {user_id} does not have a recipe with ID {recipe_id}."}
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            res.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "message": "One of the following parameters is invalid: "
                f"{{User ID: {user_id}, Recipe ID: {recipe_id}}}"
            }
        raise

    if image_source and image_source.startswith(IMAGE_PREFIX):
        # Delete self-hosted image from S3
        key = image_source.removeprefix(IMAGE_PREFIX)
        logging.info(f"Deleting image with key {key} for user with ID {user_id}.")
        image: Object = boto3.resource("s3").Object(os.environ["images_bucket_name"], key)
        image.delete()

    logging.info(f"Successfully deleted recipe with ID {recipe_id}")
    res.status_code = status.HTTP_204_NO_CONTENT


# TODO
# @api.patch("/recipes/{recipe_id}", response_model=PatchRecipeResponse)
# async def patch_recipe(
#     recipe_id: int, patch_request: PatchRecipeRequest, req: Request, res: Response
# ):
#     """
#     Patch a recipe in the database, updating the specified entry.
#     """
#     user_id: str = req.scope["USER_ID"]
#     client: DynamoDBClient = boto3.client("dynamodb")
#     kwargs = {
#         "UpdateExpression": "",
#         "ExpressionAttributeNames": {},
#         "ExpressionAttributeValues": {},
#     }
#     remove_kwargs = {
#         "UpdateExpression": "",
#         "ExpressionAttributeNames": {},
#         "ExpressionAttributeValues": {},
#     }
#     res_data = {}
#
#     adds, removes, updates = patch_request.add, patch_request.remove, patch_request.update
#     c = "categories"
#     if updates.categories and (adds.categories or removes.categories):
#         raise AssertionError("Categories cannot be updated and added/removed simultaneously.")
#
#     if adds:
#         adds.categories, add_categories_from_recipe_res = _add_categories_from_recipe(
#             user_id, updates.categories
#         )
#         res_data.update(add_categories_from_recipe_res)
#         kwargs["UpdateExpression"] += f"ADD #{c} :{c}"
#         kwargs["ExpressionAttributeNames"][f"#{c}"] = c
#         kwargs["ExpressionAttributeValues"][f":{c}"] = {
#             category.categoryId for category in add_categories_from_recipe_res["newCategories"]
#         }
#
#     if removes:
#         # Can't add to and remove from a set in the same call, need separate kwargs
#         remove_kwargs["UpdateExpression"] = f"DELETE #{c} :{c}"
#         remove_kwargs["ExpressionAttributeNames"][f"#{c}"] = c
#         remove_kwargs["ExpressionAttributeValues"][f":{c}"] = set(removes.categories)
#
#     if updates:
#         image_source = _add_image_from_recipe(updates.imgSrc)
#         if image_source:
#             res_data["imgSrc"] = image_source
#
#         updates.categories, add_categories_from_recipe_res = _add_categories_from_recipe(
#             user_id, updates.categories
#         )
#         res_data.update(add_categories_from_recipe_res)
#
#     edit_time = datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat()
#
#     kwargs[
#         "UpdateExpression"
#     ] += f" SET {", '.join(f'#{k} = :{k}' for k in {**updates.dict(), 'updateTime': edit_time})}"
#     kwargs["ExpressionAttributeNames"].update({f"#{k}": k for k in updates.dict()})
#     kwargs["ExpressionAttributeValues"].update({f":{k}": v for k, v in updates.dict().items()})
#     kwargs["UpdateExpression"] = kwargs["UpdateExpression"].replace("  ", " ")
#
#     logging.info(
#         f"Updating recipe with ID {recipe_id} for user with ID {user_id} "
#         f"and body {patch_request}."
#     )
#     try:
#         if removes:
#             recipes_table.upsert(user_id, recipe_id, removes)
#             # recipes_table.upsert(
#             #     Key={"userId": user_id, "recipeId": recipe_id},
#             #     ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
#             #     **remove_kwargs,
#             # )
#         recipes_table.upsert(user_id, recipe_id, updates)
#         # recipes_table.update_item(
#         #     Key={"userId": user_id, "recipeId": recipe_id},
#         #     ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
#         #     **kwargs,
#         # )
#     except client.exceptions.ConditionalCheckFailedException:
#         res.status_code = status.HTTP_404_NOT_FOUND
#         return {"message": f"User {user_id} does not have a recipe with ID {recipe_id}."}
#
#     logging.info(f"Successfully patched recipe with ID {recipe_id}")
#     if not res_data:
#         res.status_code = status.HTTP_204_NO_CONTENT
#         return
#
#     return {"data": res_data}


@api.put("/recipes/{recipe_id}", response_model=PutRecipeResponse)
async def put_recipe(recipe_id: int, recipe: PutRecipeRequest, req: Request):
    """
    Put a recipe to the database, replacing the specified entry.
    """
    logging.info(f"Received request to put a recipe with ID {recipe_id}")
    user_id: str = req.scope["USER_ID"]

    logging.info(
        f"Updating recipe with ID {recipe_id} for user with ID {user_id} and body {recipe}."
    )
    item, add_categories_from_recipe_response = _upsert_recipe(user_id, recipe_id, recipe)
    logging.info(f"Successfully put recipe with ID {recipe_id}")

    return {"data": {**item.dict(), **add_categories_from_recipe_response}}


@api.get("/scrape", response_model=ScrapeRecipeResponse, response_model_exclude_none=True)
async def scrape_recipe(url: str, res: Response):
    """
    Scrape a url for recipe info.
    """

    def _normalize_list(lizt: Union[str, list[str]]) -> list[str]:
        """
        Normalize a list or string with possible leading markers to just a list.
        """
        return (
            [re.sub(r"^\d+[.:]? ?", "", entry) for entry in lizt.split("\n")]
            if isinstance(lizt, str)
            else lizt
        )

    logging.info(f"Scraping url: {url}")
    try:
        scraped = scrape_me(prepend_scheme_if_needed(url, "http"), wild_mode=True)
    except NoSchemaFoundInWildMode:
        return {"message": f"No recipe schema found at {url}"}
    except (ConnectionError, InvalidURL):
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"{url} is not a valid url."}

    try:
        data = {
            "url": url,
            "name": scraped.title(),
            "imgSrc": scraped.image(),
            "adaptedFrom": scraped.site_name() or scraped.host(),
            "yields": scraped.yields(),
            "cookTime": scraped.total_time() or "",
            "instructions": _normalize_list(scraped.instructions()),
            "ingredients": _normalize_list(scraped.ingredients()),
        }
    except TypeError:  # Occurs upon trying to access scraped fields for failed scrape
        return {"message": f"No recipe schema found at {url}"}

    logging.info(f"Found data:\n{pformat(data)}")
    return {"data": data}


def _add_image_from_recipe(image_source: str) -> Optional[str]:
    if not image_source:
        return None

    if image_source.startswith(IMAGE_PREFIX) or image_source.startswith("data:image/"):
        # Already self-hosted or data URL
        return image_source

    key = str(uuid4())
    try:
        with requests.get(prepend_scheme_if_needed(image_source, "http"), stream=True) as res:
            content_type = res.headers["Content-Type"]
            file_type, extension = content_type.rsplit("/")
            if res.ok and file_type == "image":
                image: Object = boto3.resource("s3").Object(
                    os.environ["images_bucket_name"], f"{key}.{extension}"
                )
                image.put(Body=res.content, ContentType=content_type, ACL="public-read")
                image_source = f"{IMAGE_PREFIX}{key}.{extension}"
    except (ConnectionError, InvalidURL):
        pass

    return image_source


class AddCategoriesFromRecipeResponse(TypedDict):
    existingCategories: list[int]
    newCategories: list[Category]
    categoryFailedAdds: list[str]


def _add_categories_from_recipe(
    user_id: str, categories: Iterable[str]
) -> tuple[set, AddCategoriesFromRecipeResponse]:
    existing_categories, new_categories, failed_adds = categories_table.add_categories_by_name(
        user_id, categories
    )
    categories = {
        categoryId
        for categoryId in (
            *existing_categories,
            *(category.categoryId for category in new_categories),
        )
    }

    return categories, AddCategoriesFromRecipeResponse(
        existingCategories=existing_categories,
        newCategories=new_categories,
        categoryFailedAdds=failed_adds,
    )


def _upsert_recipe(
    user_id: str, recipe_id: int, recipe: Union[PostRecipeRequest, PutRecipeRequest]
) -> tuple[Recipe, AddCategoriesFromRecipeResponse]:
    categories, res_data = _add_categories_from_recipe(user_id, recipe.categories)
    image_source = _add_image_from_recipe(recipe.imgSrc)
    body = RecipeBase(
        **recipe.dict(exclude={"imgSrc", "categories"}),
        imgSrc=image_source,
        categories=cast(list, categories),
    )
    item = recipes_table.upsert(user_id, recipe_id, body)

    return item, res_data
