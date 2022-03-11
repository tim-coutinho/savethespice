import os
from functools import cache
from typing import Literal

import boto3
from boto3.dynamodb.conditions import Attr
from boto3_type_annotations.dynamodb import Client as DynamoDBClient, Table

from savethespice.crud.common import format_query_fields, get_item_from_table, upsert_to_table
from savethespice.lib.common import root_logger
from savethespice.models import ShoppingList

logging = root_logger.getChild(__name__)


@cache
def _get_table() -> tuple[Table, DynamoDBClient]:
    client: DynamoDBClient = boto3.client("dynamodb")
    table = boto3.resource("dynamodb").Table(os.environ["meta_table_name"])

    return table, client


def create_user(user_id: str) -> None:
    table, _ = _get_table()
    upsert_to_table(table, key={"userId": user_id})


def get_shopping_list(user_id: str) -> ShoppingList:
    table, _ = _get_table()
    kwargs = format_query_fields(["shoppingList"])

    return get_item_from_table(table, key={"userId": user_id}, **kwargs).get("shoppingList", [])


def update_shopping_list(user_id: str, shopping_list: ShoppingList) -> None:
    table, client = _get_table()
    kwargs = format_query_fields(
        {"shoppingList": shopping_list},
        projection_expression=False,
        attribute_names=True,
        attribute_values=True,
    )
    try:
        upsert_to_table(
            table,
            key={"userId": user_id},
            UpdateExpression="SET #shoppingList = list_append(#shoppingList, :shoppingList)",
            ConditionExpression=Attr("userId").exists() & Attr("shoppingList").exists(),
            **kwargs,
        )
    except client.exceptions.ConditionalCheckFailedException:
        upsert_to_table(
            table,
            key={"userId": user_id},
            UpdateExpression="SET #shoppingList = :shoppingList",
            ConditionExpression=Attr("userId").exists(),
            **kwargs,
        )


def overwrite_shopping_list(user_id: str, shopping_list: ShoppingList) -> None:
    table, _ = _get_table()
    kwargs = format_query_fields(
        {"shoppingList": shopping_list},
        projection_expression=False,
        attribute_names=True,
        attribute_values=True,
    )
    upsert_to_table(
        table,
        key={"userId": user_id},
        UpdateExpression="SET #shoppingList = :shoppingList",
        ConditionExpression=Attr("userId").exists(),
        **kwargs,
    )


def get_next_id(user_id: str, type_: Literal["recipe", "category"]) -> int:
    """
    Retrieve the next recipe or category ID.

    :param user_id: ID of the user
    :param type_: Type of ID to get; one of recipe or category
    :return: The next sequential ID for the
    """
    table, _ = _get_table()
    field_name = f"next{type_.title()}Id"
    kwargs = format_query_fields(
        {field_name: 1},
        projection_expression=False,
        attribute_names=True,
        attribute_values=True,
    )

    next_id = (
        table.update_item(
            Key={"userId": user_id},
            UpdateExpression=f"ADD #{field_name} :{field_name}",
            ReturnValues="UPDATED_OLD",
            **kwargs,
        )
        .get("Attributes", {})
        .get(field_name, 0)
    )

    return next_id
