from datetime import datetime
from typing import Iterable, List, Mapping, MutableMapping, Optional, Union

from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from lib.common import (
    UNEXPECTED_EXCEPTION,
    format_query_fields,
    get_categories_table,
    get_next_id,
    root_logger,
    verify_parameters,
)
from lib.types import CategoryEntry, Response, ResponseData

logging = root_logger.getChild("categories")

editable_category_fields = {"name": str}


def get_categories(user_id: str) -> Response:
    """
    GET all categories in the database.

    :param user_id: ID of the user
    :return: (Response specifics, status code)
    """
    logging.info(f"Getting all categories for user with ID {user_id}.")
    kwargs = format_query_fields(["categoryId", "name", "updateTime", "createTime"])

    # TODO: Paginate
    table, _ = get_categories_table()
    items = table.query(KeyConditionExpression=Key("userId").eq(user_id), **kwargs).get("Items", [])
    return ResponseData(data={"categories": items}), 200


def get_category(user_id: str, category_id: int) -> Response:
    """
    GET a specific category in the database.

    :param user_id: ID of the user
    :param category_id: ID of the category being retrieved
    :return: (Response specifics, status code)
    """
    logging.info(f"Getting category with ID {category_id} for user with ID {user_id}.")
    kwargs = format_query_fields(["categoryId", "name", "updateTime", "createTime"])

    categories_table, _ = get_categories_table()
    try:
        item = categories_table.get_item(
            Key={"userId": user_id, "categoryId": category_id},
            **kwargs,
        ).get("Item", {})
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            return (
                ResponseData(
                    message="One of the following parameters is invalid: "
                    f"{{User ID: {user_id}, Category ID: {category_id}}}"
                ),
                400,
            )
        logging.exception(UNEXPECTED_EXCEPTION)
        raise
    if not item:
        return (
            ResponseData(message=f"User {user_id} does not have a category with ID {category_id}."),
            404,
        )

    return ResponseData(data=item), 200


def post_category(
    user_id: str,
    body: CategoryEntry,
    category_id: Optional[int] = None,
    *,
    batch: Optional[bool] = False,
    pool_res: Optional[MutableMapping[str, Union[List[str], List[CategoryEntry]]]] = None,
) -> Response:
    """
    POST a category to the database, adding a new entry. If 'category_id' is specified, instead
    replace an existing category.

    :param user_id: ID of the user
    :param body: Category data to replace with
    :param category_id: ID of the category being replaced
    :param batch: Whether or not this is part of a batch operation
    :param pool_res: Response data used by the calling thread pool
    :return: (Response specifics, status code)
    """
    try:
        # If not updating an existing category, name must be present
        # TODO: Verify types
        verify_parameters(
            body,
            "name" if not category_id else None,
            valid_parameters=editable_category_fields,
            parameter_types=editable_category_fields,
        )
    except AssertionError:
        if batch and pool_res:  # Continue with the rest of the batch
            pool_res["failed_adds"].append(body["name"])
            return {}, 400
        raise

    edit_time = datetime.utcnow().replace(microsecond=0).isoformat()
    body["updateTime"] = edit_time
    if category_id is None:  # POST
        status_code = 201
        body["createTime"] = edit_time
        category_id = get_next_id(user_id, "category")

        logging.info(
            f"Creating category with ID {category_id} for user with ID {user_id} and body {body}."
        )
    else:  # PUT
        status_code = 200
        kwargs = format_query_fields(["createTime"])
        categories_table, _ = get_categories_table()
        body["createTime"] = (
            categories_table.get_item(Key={"userId": user_id, "categoryId": category_id}, **kwargs)
            .get("Item", {})
            .get("createTime", edit_time)
        )

        logging.info(
            f"Updating category with ID {category_id} for user with ID {user_id} and body {body}."
        )

    body["categoryId"] = category_id
    categories_table, _ = get_categories_table()
    categories_table.put_item(
        Item={
            **body,
            "userId": user_id,
        }
    )
    if batch and pool_res:
        pool_res["new_categories"].append(body)

    return ResponseData(data=body), status_code


def patch_category(
    user_id: str, body: Mapping[str, Mapping[str, str]], category_id: int, batch: bool = False
) -> Optional[Response]:
    """
    PATCH a category in the database, updating the specified entry.

    :param user_id: ID of the user
    :param body: Mapping of PATCH operations to category data. Currently supports 'update'
    :param category_id: ID of the category being updated
    :param batch: Whether or not this is part of a batch operation
    :return: (Response specifics, status code)
    """
    kwargs = {
        "UpdateExpression": "",
        "ExpressionAttributeNames": {},
        "ExpressionAttributeValues": {},
    }
    try:
        validation = {
            "update": dict,
        }
        verify_parameters(body, valid_parameters=validation.keys(), parameter_types=validation)
        (updates,) = (body.get(parameter) for parameter in validation)

        validation = {
            "name": str,
        }
        verify_parameters(updates, valid_parameters=validation.keys(), parameter_types=validation)

        edit_time = datetime.utcnow().replace(microsecond=0).isoformat()
        updates["updateTime"] = edit_time
        kwargs["UpdateExpression"] = f"SET {', '.join(f'#{k} = :{k}' for k in updates)}"
        kwargs["ExpressionAttributeNames"].update({f"#{k}": k for k in updates})
        kwargs["ExpressionAttributeValues"].update({f":{k}": v for k, v in updates.items()})
        kwargs["UpdateExpression"] = kwargs["UpdateExpression"].replace("  ", " ")

    except AssertionError:
        if batch:  # Continue with the rest of the batch
            return {}, 400
        raise

    table, resource = get_categories_table()

    logging.info(f"Updating category with ID {category_id} for user with ID {user_id}.")
    try:
        table.update_item(
            Key={"userId": user_id, "categoryId": category_id},
            ConditionExpression=Attr("userId").exists() & Attr("categoryId").exists(),
            **kwargs,
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return (
            ResponseData(
                message=f"User {user_id} does not have a category with ID {category_id}.",
            ),
            404,
        )

    return {}, 204


def patch_categories(user_id: str, body: Mapping[str, Mapping[str, Mapping[str, str]]]):
    """
    Batch update a set of category IDs.

    :param user_id: ID of the user
    :param body: Mapping of category IDs to PATCH operations. See patch_category for operation
                 details
    :return: (Response specifics, status code)
    """
    try:
        body = body.items()
    except AttributeError:
        return ResponseData(message=f"Invalid categories body: {body}"), 400

    res_data = {}
    for category_id, category in body:
        try:
            category_id = int(category_id)
        except ValueError:
            res_data.setdefault("failedUpdates", []).append(category_id)
            continue
        _, status_code = patch_category(user_id, category, category_id, batch=True)
        status_code != 200 and res_data.setdefault("failedUpdates", []).append(category_id)

    if not res_data:
        return {}, 204
    return ResponseData(data=res_data), 200


def put_category(user_id: str, body: CategoryEntry, category_id: int) -> Response:
    """
    PUT a category to the database, replacing the specified entry.

    :param user_id: ID of the user
    :param body: Category data to replace with
    :param category_id: ID of the category being replaced
    :return: (Response specifics, status code)
    """
    return post_category(user_id, category_id=category_id, body=body)


def delete_category(user_id: str, category_id: int) -> Response:
    """
    DELETE the specified category from the database.

    :param user_id: ID of the user
    :param category_id: ID of the category being deleted
    :return: (Response specifics, status code)
    """
    table, resource = get_categories_table()

    logging.info(f"Deleting category with ID {category_id} for user with ID {user_id}.")
    try:
        table.delete_item(
            Key={"userId": user_id, "categoryId": category_id},
            ConditionExpression=Attr("userId").exists() & Attr("categoryId").exists(),
        )
    except resource.meta.client.exceptions.ConditionalCheckFailedException:
        return (
            ResponseData(
                message=f"User {user_id} does not have a category with ID {category_id}.",
            ),
            404,
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            return (
                ResponseData(
                    message="One of the following parameters is invalid: "
                    f"{{User ID: {user_id}, Category ID: {category_id}}}"
                ),
                400,
            )
        logging.exception(UNEXPECTED_EXCEPTION)
        raise

    return {}, 204


def delete_categories(user_id: str, category_ids: Iterable[int]):
    """
    Batch delete a list of category IDs.

    :param user_id: ID of the user
    :param category_ids: List of category IDs
    :return: (Response specifics, status code)
    """
    verify_parameters(category_ids, list_type=int)

    res_data = {}
    for category_id in category_ids:
        _, status_code = delete_category(user_id, category_id)
        status_code != 204 and res_data.setdefault("failedDeletions", []).append(category_id)

    if not res_data:
        return {}, 204
    return ResponseData(data=res_data), 200
