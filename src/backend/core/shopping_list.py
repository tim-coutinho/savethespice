from typing import Iterable

from boto3.dynamodb.conditions import Attr

from lib.common import format_query_fields, get_meta_table, root_logger, verify_parameters
from lib.types import Response, ResponseData

logging = root_logger.getChild("shopping_list")


def get_shopping_list(user_id: str) -> Response:
    """
    GET all shopping list items in the database.

    :param user_id: ID of the user
    :return: (Response specifics, status code)
    """
    logging.info(f"Getting shopping list for user with ID {user_id}.")
    kwargs = format_query_fields(["shoppingList"])

    meta_table, _ = get_meta_table()
    shopping_list = (
        meta_table.get_item(Key={"userId": user_id}, **kwargs)
        .get("Item", {})
        .get("shoppingList", [])
    )

    return ResponseData(data={"shoppingList": shopping_list}), 200


def patch_shopping_list(user_id: str, body: Iterable[str]) -> Response:
    """
    PATCH the shopping list, adding the items specified in `body`.

    :param user_id: ID of the user
    :param body: List of shopping list items to add
    :return: (Response specifics, status code)
    """
    verify_parameters(body, list_type=str)
    logging.info(f"Updating shopping list for user with ID {user_id} with items {body}.")
    kwargs = format_query_fields(
        {"shoppingList": body},
        projection_expression=False,
        attribute_names=True,
        attribute_values=True,
    )

    meta_table, resource = get_meta_table()
    try:
        meta_table.update_item(
            Key={"userId": user_id},
            UpdateExpression="SET #shoppingList = list_append(#shoppingList, :shoppingList)",
            ConditionExpression=Attr("userId").exists() & Attr("shoppingList").exists(),
            **kwargs,
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        meta_table.update_item(
            Key={"userId": user_id},
            UpdateExpression="SET #shoppingList = :shoppingList",
            ConditionExpression=Attr("userId").exists(),
            **kwargs,
        )

    return {}, 204


def put_shopping_list(user_id: str, body: Iterable[str]) -> Response:
    """
    PUT a new shopping list, replacing the existing list with the items specified in `body`.

    :param user_id: ID of the user
    :param body: List of shopping list items to add
    :return: (Response specifics, status code)
    """
    verify_parameters(body, list_type=str)
    logging.info(f"Replacing shopping list for user with ID {user_id} with items {body}.")
    kwargs = format_query_fields(
        {"shoppingList": body},
        projection_expression=False,
        attribute_names=True,
        attribute_values=True,
    )

    meta_table, _ = get_meta_table()
    meta_table.update_item(
        Key={"userId": user_id},
        UpdateExpression="SET #shoppingList = :shoppingList",
        ConditionExpression=Attr("userId").exists(),
        **kwargs,
    )

    return {}, 204
