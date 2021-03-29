import logging
import os
from functools import lru_cache as cache, singledispatch
from itertools import zip_longest
from pprint import pformat
from typing import Any, Dict, Iterable, Iterator, List, Mapping, Optional, Tuple, Type, Union, \
    Literal

import boto3
from boto3_type_annotations.dynamodb import ServiceResource as DynamoDB, Table

from lib.types import CategoryEntry, Hashable, RecipeEntry, Serializable

root_logger = logging.getLogger("SaveTheSpice")
root_logger.setLevel(
    logging.INFO if os.environ.get("FLASK_ENV") == "development" else logging.DEBUG
)

UNEXPECTED_EXCEPTION = "Unexpected exception occured."

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
#     return ResponseData(message="The token's signature has expired"), 400
# except JWTError:
#     return ResponseData(message="The token's signature is invalid"), 400


@cache
def get_recipes_table() -> Tuple[Table, DynamoDB]:
    resource: DynamoDB = boto3.resource("dynamodb")
    table = resource.Table(os.environ["recipes_table_name"])
    return table, resource


@cache
def get_categories_table() -> Tuple[Table, DynamoDB]:
    resource: DynamoDB = boto3.resource("dynamodb")
    table = resource.Table(os.environ["categories_table_name"])
    return table, resource


@cache
def get_meta_table() -> Tuple[Table, DynamoDB]:
    resource: DynamoDB = boto3.resource("dynamodb")
    table = resource.Table(os.environ["meta_table_name"])
    return table, resource


def get_next_id(user_id: str, type_: Literal["recipe", "category"]) -> int:
    meta_table, _ = get_meta_table()
    field_name = f"next{type_.title()}Id"
    kwargs = format_query_fields(
        {field_name: 1},
        projection_expression=False,
        attribute_names=True,
        attribute_values=True,
    )

    next_id = (
        meta_table.update_item(
            Key={"userId": user_id},
            UpdateExpression=f"ADD #{field_name} :{field_name}",
            ReturnValues="UPDATED_OLD",
            **kwargs,
        ).get("Attributes", {}).get(field_name, 0)
    )

    return next_id


def pformat_(obj: object) -> str:
    return pformat(obj, indent=2, width=100)


def chunks(list_: Iterable, batch_size: int = 10) -> Iterator:
    """Break an iterable up into chunks of `batch_size` size."""
    return zip_longest(*[iter(list_)] * batch_size)


def verify_list(
    params: Iterable[Hashable], list_type: Optional[Union[Type, Tuple[Type, ...]]] = None
):
    if not list_type:
        return
    if any(item for item in params if not isinstance(item, list_type)):
        raise AssertionError(f"Items in {params} are not all of type {list_type}.")
    return


def verify_parameters(
    body: Union[
        Mapping[Union[int, str], Serializable], Iterable[Hashable], CategoryEntry, RecipeEntry, None
    ],
    *required_parameters: Optional[str],
    valid_parameters: Optional[Iterable[str]] = None,
    parameter_types: Optional[Mapping[str, Type]] = None,
    list_type: Optional[Union[Type, Tuple[Type, ...]]] = None,
) -> Optional[List[Any]]:
    if isinstance(body, list):
        return verify_list(body, list_type)

    if not body:
        raise AssertionError("Request body not provided.")

    if not required_parameters and not valid_parameters:
        return

    values = [body.get(parameter) for parameter in required_parameters]
    missing_parameters = {
        parameter for parameter, value in zip(required_parameters, values) if value is None
    }
    if any(missing_parameters):
        raise AssertionError(f"Required parameter(s) {missing_parameters} not provided.")

    if valid_parameters is not None:
        unexpected_parameters = {
            parameter for parameter in body if parameter not in valid_parameters
        }
        if any(unexpected_parameters):
            raise AssertionError(f"Unexpected parameter(s) {unexpected_parameters} provided.")

    if parameter_types is not None:
        # TODO: Support arbitrary parameter validation with supplied function
        incorrect_types = {
            parameter: type(body[parameter])
            for parameter, type_ in parameter_types.items()
            if parameter in body and not isinstance(body[parameter], type_)
        }
        if any(incorrect_types):
            raise AssertionError(
                f"Incorrect type provided for the following parameter(s): {incorrect_types}."
            )

    return values


# noinspection PyUnusedLocal
@singledispatch
def format_query_fields(
    fields: Union[Iterable[str], Mapping[str, Iterable[str]]],
    *,
    projection_expression: bool = True,
    attribute_names: bool = True,
    attribute_values: bool = False,
) -> Dict[str, Union[str, Dict[str, str]]]:
    ...


@format_query_fields.register(list)
def format_query_fields_list(
    fields: Iterable[str], *, projection_expression: bool = True, attribute_names: bool = True
) -> Dict[str, Union[str, Dict[str, str]]]:
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
) -> Dict[str, Union[str, Dict[str, str]]]:
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
