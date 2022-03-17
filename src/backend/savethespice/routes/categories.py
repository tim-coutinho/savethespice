import boto3
from boto3_type_annotations.dynamodb import Client as DynamoDBClient
from botocore.exceptions import ClientError
from fastapi import APIRouter, Body, Request, Response, status

from savethespice.crud import categories_table, meta_table, recipes_table
from savethespice.lib.common import root_logger
from savethespice.models import (
    DeleteCategoriesRequest,
    DeleteCategoriesResponse,
    DeleteCategoryResponse,
    GetCategoriesResponse,
    GetCategoryResponse,
    PatchCategoriesRequest,
    PatchCategoriesResponse,
    PatchCategoryRequest,
    PostCategoryRequest,
    PostCategoryResponse,
    PutCategoryRequest,
    PutCategoryResponse,
)

logging = root_logger.getChild(__name__)
api = APIRouter(prefix="/private/categories", tags=["categories"])


@api.get("", response_model=GetCategoriesResponse)
async def get_categories(req: Request):
    """
    Get all categories in the database.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Getting all categories for user with ID {user_id}.")
    categories = categories_table.get_all(user_id)
    logging.info("Successfully got categories.")

    return {"data": {"categories": categories}}


@api.delete("", response_model=DeleteCategoriesResponse)
async def delete_categories(category_ids: DeleteCategoriesRequest, req: Request, res: Response):
    """
    Batch delete a list of category IDs from the database.
    """
    user_id: str = req.scope["USER_ID"]
    client: DynamoDBClient = boto3.client("dynamodb")
    failed_deletions: list[int] = []
    updated_recipes: list[int] = []

    for category_id in category_ids:
        try:
            categories_table.delete(user_id, category_id)
        except client.exceptions.ConditionalCheckFailedException:
            failed_deletions.append(category_id)
        except ClientError as e:
            if e.response["Error"]["Code"] == "ValidationException":
                failed_deletions.append(category_id)
            raise
        else:
            updated_recipes.append(category_id)

    if failed_deletions:
        category_ids = [
            category_id for category_id in category_ids if category_id not in failed_deletions
        ]

    updated_recipes = recipes_table.remove_categories_from_recipes(user_id, category_ids)

    logging.info(
        "Successfully deleted categories with IDs "
        f"{[category_id for category_id in category_ids if category_id not in failed_deletions]}"
    )
    if not updated_recipes and not failed_deletions:
        res.status_code = status.HTTP_204_NO_CONTENT
        return
    return {"data": {"failedDeletions": failed_deletions, "updatedRecipes": updated_recipes}}


@api.patch("", response_model=PatchCategoriesResponse)
async def patch_categories(
    req: Request,
    res: Response,
    patch_request: PatchCategoriesRequest = Body(
        ..., example={0: {"update": {"name": "NewName1"}}, 1: {"update": {"name": "NewName2"}}}
    ),
):
    """
    Batch update a list of categories in the database.
    """
    user_id: str = req.scope["USER_ID"]
    client: DynamoDBClient = boto3.client("dynamodb")
    failed_updates: list[int] = []

    for category_id, category in patch_request.items():
        try:
            categories_table.upsert(user_id, category_id, category)
        except client.exceptions.ConditionalCheckFailedException:
            failed_updates.append(category_id)

    logging.info(
        "Successfully patched categories with IDs "
        f"{[category_id for category_id in patch_request if category_id not in failed_updates]}"
    )
    if not failed_updates:
        res.status_code = status.HTTP_204_NO_CONTENT
        return

    return {"data": {"failedUpdates": failed_updates}}


@api.post("", response_model=PostCategoryResponse, status_code=status.HTTP_201_CREATED)
async def post_category(category: PostCategoryRequest, req: Request):
    """
    Post a category to the database.
    """
    user_id: str = req.scope["USER_ID"]
    category_id = meta_table.get_next_id(user_id, "category")
    logging.info(
        f"Creating category with ID {category_id} for user with ID {user_id} and body {category}."
    )
    item = categories_table.upsert(user_id, category_id, category)
    logging.info(f"Successfully posted category with name {category.name} with ID {category_id}")

    return {"data": item}


@api.get("/{category_id}", response_model=GetCategoryResponse)
async def get_category(category_id: int, req: Request, res: Response):
    """
    Get a specific category in the database.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Getting category with ID {category_id} for user with ID {user_id}.")

    try:
        item = categories_table.get(user_id, category_id)
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            res.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "message": "One of the following parameters is invalid: "
                f"{{User ID: {user_id}, Category ID: {category_id}}}"
            }
        raise
    if not item:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {user_id} does not have a category with ID {category_id}."}
    logging.info(f"Successfully got category with ID {category_id}")

    return {"data": item}


@api.delete("/{category_id}", response_model=DeleteCategoryResponse)
async def delete_category(category_id: int, req: Request, res: Response):
    """
    Delete the specified category from the database.
    """
    user_id: str = req.scope["USER_ID"]
    client: DynamoDBClient = boto3.client("dynamodb")

    logging.info(f"Deleting category with ID {category_id} for user with ID {user_id}.")
    try:
        categories_table.delete(user_id, category_id)
    except client.exceptions.ConditionalCheckFailedException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {user_id} does not have a category with ID {category_id}."}
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            res.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "message": "One of the following parameters is invalid: "
                f"{{User ID: {user_id}, Category ID: {category_id}}}"
            }
        raise

    updated_recipes = recipes_table.remove_categories_from_recipes(user_id, [category_id])
    logging.info(f"Successfully deleted category with ID {category_id}")
    if not updated_recipes:
        res.status_code = status.HTTP_204_NO_CONTENT
        return

    return {"data": {"updatedRecipes": updated_recipes}}


@api.patch("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def patch_category(
    category_id: int, patch_request: PatchCategoryRequest, req: Request, res: Response
):
    """
    Patch a category in the database, updating the specified entry.
    """
    user_id: str = req.scope["USER_ID"]
    client: DynamoDBClient = boto3.client("dynamodb")
    category = patch_request.update

    logging.info(
        f"Updating category with ID {category_id} for user with ID {user_id} and body {category}."
    )
    try:
        categories_table.upsert(user_id, category_id, category)
    except client.exceptions.ConditionalCheckFailedException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {user_id} does not have a category with ID {category_id}."}

    logging.info(f"Successfully patched category with ID {category_id}")


@api.put("/{category_id}", response_model=PutCategoryResponse)
async def put_category(category_id: int, category: PutCategoryRequest, req: Request):
    """
    Put a category to the database, replacing the specified entry.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(
        f"Updating category with ID {category_id} for user with ID {user_id} and body {category}."
    )
    item = categories_table.upsert(user_id, category_id, category)
    logging.info(f"Successfully put category with ID {category_id}")

    return {"data": item}
