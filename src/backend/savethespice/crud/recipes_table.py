import os
from collections import Generator, Iterable
from functools import cache

import boto3
from boto3.dynamodb.conditions import Attr
from boto3_type_annotations.dynamodb import Client as DynamoDBClient, Table
from botocore.exceptions import ClientError

from savethespice.crud.common import (
    format_query_fields,
    get_item_from_table,
    query_table,
    remove_item_from_table,
    upsert_to_table,
)
from savethespice.lib.common import chunks, root_logger
from savethespice.models import Recipe, RecipeBase

logging = root_logger.getChild(__name__)


@cache
def _get_table() -> tuple[Table, DynamoDBClient]:
    client: DynamoDBClient = boto3.client("dynamodb")
    table = boto3.resource("dynamodb").Table(os.environ["recipes_table_name"])

    return table, client


def get(user_id: str, category_id: int) -> Recipe:
    table, _ = _get_table()
    kwargs = format_query_fields(
        [
            "recipeId",
            "name",
            "desc",
            "url",
            "adaptedFrom",
            "cookTime",
            "yields",
            "categories",
            "instructions",
            "ingredients",
            "imgSrc",
            "updateTime",
            "createTime",
        ],
    )

    return Recipe(
        **get_item_from_table(table, key={"userId": user_id, "categoryId": category_id}, **kwargs)
    )


def get_all(user_id: str) -> Generator[Recipe, None, None]:
    kwargs = format_query_fields(
        [
            "recipeId",
            "name",
            "desc",
            "url",
            "adaptedFrom",
            "cookTime",
            "yields",
            "categories",
            "instructions",
            "ingredients",
            "imgSrc",
            "updateTime",
            "createTime",
        ],
    )

    # TODO: Paginate
    table, _ = _get_table()

    return (Recipe(**r) for r in query_table(table, key=("userId", user_id), **kwargs))


def upsert(user_id: str, recipe_id: int, body: RecipeBase):
    table, _ = _get_table()
    if body.categories:
        body.categories = set(body.categories)
    create_time, update_time = upsert_to_table(
        table, key={"userId": user_id, "recipeId": recipe_id}, item=body
    )

    return Recipe(**body.dict(), recipeId=recipe_id, createTime=create_time, updateTime=update_time)


def delete(user_id, recipe_id: int) -> str:
    table, _ = _get_table()

    return (
        remove_item_from_table(
            table,
            key={"userId": user_id, "recipeId": recipe_id},
            ConditionExpression=Attr("userId").exists() & Attr("recipeId").exists(),
            ReturnValues="ALL_OLD",
        )
        .get("Attributes", {})
        .get("imgSrc")
    )


def remove_categories_from_recipes(user_id: str, category_ids: Iterable[int]) -> list[int]:
    """
    Remove references to the specified categories from all recipes.

    :param user_id: ID of the user
    :param category_ids: IDs of the categories to remove
    :return: IDs for updated recipes
    """
    recipes_table, client = _get_table()
    kwargs = format_query_fields(["recipeId", "categories"])
    recipes_to_update = [
        int(recipe["recipeId"])
        for recipe in query_table(
            recipes_table,
            key=("userId", user_id),
            **kwargs,
        )
        # Check if it shares any categories with category_ids. Can't be done with
        # FilterExpression due to it not supporting checking for multiple items in sets
        if not set(recipe.get("categories", [])).isdisjoint(category_ids)
    ]
    if not recipes_to_update:
        logging.info(f"No recipes to update after deleting category IDs {category_ids}")
        return []

    logging.info(
        f"Removing references to categories with IDs {category_ids} from "
        f"recipes with IDs {recipes_to_update} for user with ID {user_id}."
    )

    items = [
        {
            "Update": {
                "TableName": os.environ["recipes_table_name"],
                "Key": {"userId": {"S": user_id}, "recipeId": {"N": str(recipe_id)}},
                "UpdateExpression": "DELETE #categories :categories",
                "ExpressionAttributeNames": {"#categories": "categories"},
                "ExpressionAttributeValues": {
                    ":categories": {"NS": [str(c) for c in category_ids]}
                },
            }
        }
        for recipe_id in recipes_to_update
    ]
    try:
        for chunk in chunks(items, batch_size=25):
            client.transact_write_items(
                TransactItems=[item for item in chunk if item]
            )  # Filter Nones
    except ClientError as e:
        logging.info(f"Response: {e.response}")

    return recipes_to_update
