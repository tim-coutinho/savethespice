import os
from functools import cache
from typing import Optional

import boto3
from boto3_type_annotations.dynamodb import Client as DynamoDBClient, Table

from savethespice.crud.common import format_query_fields, get_item_from_table, upsert_to_table
from savethespice.lib.common import root_logger
from savethespice.models import RecipeBase, ShareRecipeEntry
from savethespice.models.requests.share import ShareRecipeBase

logging = root_logger.getChild(__name__)


@cache
def _get_table() -> tuple[Table, DynamoDBClient]:
    client: DynamoDBClient = boto3.client("dynamodb")
    table = boto3.resource("dynamodb").Table(os.environ["share_table_name"])

    return table, client


def get(share_id: str) -> Optional[RecipeBase]:
    table, _ = _get_table()
    kwargs = format_query_fields(
        [
            "shareId",
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
        ]
    )

    item = get_item_from_table(table, key={"shareId": share_id}, **kwargs)

    return RecipeBase(**item) if item else None


def upsert(share_id: str, body: RecipeBase, ttl: int) -> ShareRecipeEntry:
    table, _ = _get_table()
    if body.categories:
        body.categories = set(body.categories)
    create_time, update_time = upsert_to_table(
        table,
        key={"shareId": share_id},
        item=ShareRecipeBase(**body.dict(), ttl=ttl),
    )

    return ShareRecipeEntry(
        **body.dict(exclude={"createTime", "updateTime"}),
        shareId=share_id,
        ttl=ttl,
        createTime=create_time,
        updateTime=update_time,
    )
