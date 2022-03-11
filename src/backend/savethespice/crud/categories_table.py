import os
from collections import Generator, Iterable
from functools import cache
from itertools import count
from typing import cast

import boto3
from boto3.dynamodb.conditions import Attr
from boto3_type_annotations.dynamodb import Client as DynamoDBClient, Table

from savethespice.crud.common import (
    format_query_fields,
    get_item_from_table,
    query_table,
    remove_item_from_table,
    upsert_to_table,
)
from savethespice.crud.meta_table import get_next_id
from savethespice.lib.common import root_logger
from savethespice.models import Category, CategoryBase

logging = root_logger.getChild(__name__)


@cache
def _get_table() -> tuple[Table, DynamoDBClient]:
    client: DynamoDBClient = boto3.client("dynamodb")
    table = boto3.resource("dynamodb").Table(os.environ["categories_table_name"])

    return table, client


def get(user_id: str, category_id: int) -> Category:
    table, _ = _get_table()
    kwargs = format_query_fields(["categoryId", "name", "updateTime", "createTime"])

    return Category(
        **get_item_from_table(table, key={"userId": user_id, "categoryId": category_id}, **kwargs)
    )


def get_all(user_id: str) -> Generator[Category, None, None]:
    table, _ = _get_table()
    kwargs = format_query_fields(["categoryId", "name", "updateTime", "createTime"])

    # TODO: Paginate
    return (Category(**c) for c in query_table(table, key=("userId", user_id), **kwargs))


def delete(user_id, category_id: int):
    table, _ = _get_table()
    remove_item_from_table(
        table,
        key={"userId": user_id, "categoryId": category_id},
        ConditionExpression=Attr("userId").exists() & Attr("categoryId").exists(),
    )


def upsert(user_id: str, category_id: int, body: CategoryBase) -> Category:
    table, _ = _get_table()
    create_time, update_time = upsert_to_table(
        table, key={"categoryId": category_id, "userId": user_id}, item=body
    )

    return Category(
        **body.dict(), categoryId=category_id, createTime=create_time, updateTime=update_time
    )


def add_categories_by_name(
    user_id: str, categories: Iterable[str]
) -> tuple[list[int], list[Category], list[str]]:
    """
    Add categories that don't already exist by name.

    :param user_id: ID of the user
    :param categories: Names of the categories being added in the recipe request
    :return: (Existing category entries found by name, New category entries, Any failed category
              additions)
    """
    if not categories:
        return [], [], []
    categories = set(categories)
    table, client = _get_table()
    kwargs = format_query_fields(["categoryId", "name", "createTime", "updateTime"])
    existing_categories: list[Category] = [
        Category(**category)
        for category in query_table(
            table,
            key=("userId", user_id),
            FilterExpression=Attr("name").is_in(cast(list[str], categories)),
            **kwargs,
        )
    ]
    categories_to_return = [
        category.categoryId for category in existing_categories if category.name in categories
    ]

    if categories_to_add := categories.difference(
        category.name for category in existing_categories
    ):
        logging.info(f"Adding categories {categories_to_add} to user with ID {user_id}.")
    new_categories: list[Category] = []
    failed_adds: list[str] = []
    next_category_id = get_next_id(user_id, "category")
    for name, category_id in zip(categories_to_add, count(next_category_id)):
        body = CategoryBase(name=name)
        try:
            create_time, update_time = upsert_to_table(
                table, key={"categoryId": category_id, "userId": user_id}, item=body
            )
        except Exception:
            logging.exception(f"{name} failed to be created")
            failed_adds.append(name)
        else:
            new_categories.append(
                Category(
                    **body.dict(),
                    createTime=create_time,
                    updateTime=update_time,
                    categoryId=category_id,
                )
            )

    return categories_to_return, new_categories, failed_adds
