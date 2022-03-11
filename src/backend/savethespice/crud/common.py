from collections import Iterable, Mapping
from datetime import datetime
from functools import singledispatch
from typing import Any, Optional, Union

from boto3.dynamodb.conditions import Key
from boto3_type_annotations.dynamodb import Table

from savethespice.models import CategoryBase, RecipeBase


def upsert_to_table(
    table: Table,
    *,
    key: dict[str, Any],
    item: Optional[Union[RecipeBase, CategoryBase]] = None,
    **kwargs,
) -> tuple[str, str]:
    edit_time = datetime.utcnow().replace(microsecond=0).isoformat()
    item = {k: v for k, v in item.dict().items() if v != "" and v is not None} if item else {}
    update_args = {
        "UpdateExpression": (
            "SET #createTime = if_not_exists(#createTime, :createTime), "
            f"{', '.join(f'#{k} = :{k}' for k in {**item, 'updateTime': edit_time})}"
        ),
        "ExpressionAttributeNames": {
            f"#{k}": k
            for k in {
                **item,
                "createTime": edit_time,
                "updateTime": edit_time,
            }
        },
        "ExpressionAttributeValues": {
            f":{k}": v
            for k, v in {
                **item,
                "createTime": edit_time,
                "updateTime": edit_time,
            }.items()
        },
    }
    res = table.update_item(Key=key, ReturnValues="ALL_NEW", **update_args, **kwargs)
    return res["Attributes"]["createTime"], res["Attributes"]["updateTime"]


def remove_item_from_table(table: Table, *, key: dict[str, Any], **kwargs) -> dict[str, Any]:
    return table.delete_item(Key=key, **kwargs)


def get_item_from_table(table: Table, *, key: dict[str, Any], **kwargs) -> dict[str, Any]:
    return table.get_item(Key=key, **kwargs).get("Item", {})


def query_table(
    table: Table, *, key: tuple[str, Union[int, str]], **kwargs
) -> list[dict[str, Any]]:
    return table.query(KeyConditionExpression=Key(key[0]).eq(key[1]), **kwargs).get("Items", [])


# noinspection PyUnusedLocal
@singledispatch
def format_query_fields(
    fields: Union[Iterable[str], Mapping[str, Iterable[str]]],
    *,
    projection_expression: bool = True,
    attribute_names: bool = True,
    attribute_values: bool = False,
) -> dict[str, Union[str, dict[str, str]]]:
    ...


@format_query_fields.register(list)
def format_query_fields_list(
    fields: Iterable[str], *, projection_expression: bool = True, attribute_names: bool = True
) -> dict[str, Union[str, dict[str, str]]]:
    kwargs = {}
    projection_expression and kwargs.setdefault(
        "ProjectionExpression", ", ".join(f"#{field}" for field in fields)
    )
    attribute_names and kwargs.setdefault(
        "ExpressionAttributeNames", {f"#{field}": field for field in fields}
    )
    return kwargs


@format_query_fields.register(dict)
def format_query_fields_dict(
    fields: Mapping[str, Iterable[str]],
    *,
    projection_expression: bool = True,
    attribute_names: bool = True,
    attribute_values: bool = False,
) -> dict[str, Union[str, dict[str, str]]]:
    kwargs = {}
    projection_expression and kwargs.setdefault(
        "ProjectionExpression", ", ".join(f"#{field}" for field in fields)
    )
    attribute_names and kwargs.setdefault(
        "ExpressionAttributeNames", {f"#{field}": field for field in fields}
    )
    attribute_values and kwargs.setdefault(
        "ExpressionAttributeValues", {f":{k}": v for k, v in fields.items()}
    )
    return kwargs
