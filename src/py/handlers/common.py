import json
import logging
from decimal import Decimal
from pprint import pformat
from typing import Any, Iterable, List, Mapping, Optional, Set, Type, TypedDict, Union, Tuple


class CategoryEntry(TypedDict, total=False):
    userId: str
    categoryId: int
    lastEditedTime: int
    originalSubmitTime: int
    name: str


class RecipeEntry(TypedDict, total=False):
    userId: str
    recipeId: int
    lastEditedTime: int
    originalSubmitTime: int
    name: str
    desc: str
    cookTime: str
    ingredients: List[str]
    instructions: List[str]
    categories: Set[int]
    categoryId: Optional[int]  # For when deleting categories


class Response(TypedDict):
    isBase64Encoded: bool
    statusCode: int
    headers: str
    body: Optional[str]


Hashable = Union[None, bool, float, int, str]
Serializable = Union[Hashable, Decimal, Mapping[str, "Serializable"], List["Serializable"]]

logger = logging.getLogger("SaveTheSpice")
logger.setLevel(logging.INFO)


def _replace_decimals(obj: Serializable) -> Serializable:
    if isinstance(obj, list) or isinstance(obj, set):
        return [_replace_decimals(v) for v in obj]
    elif isinstance(obj, dict):
        return {k: _replace_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def pformat_(obj: object) -> str:
    return pformat(obj, indent=2, width=100)


def is_collection(obj: Any):
    return hasattr(obj, "__iter__") and not isinstance(obj, str)


def verify_parameters(
    body: Union[Mapping[str, Serializable], CategoryEntry, RecipeEntry, None],
    *required_parameters: Optional[str],
    valid_parameters: Optional[Iterable[str]] = None,
    parameter_types: Optional[Mapping[str, Type]] = None,
    list_type: Optional[Union[Type, Tuple[Type]]] = None
) -> Optional[List[Any]]:
    if not body:
        raise AssertionError("Request body not provided.")

    if isinstance(body, list):
        if not list_type:
            return
        if any(item for item in body if not isinstance(item, list_type)):
            raise AssertionError(f"Items in {body} are not all of type {list_type}.")
        return

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
            if parameter in body
            and not isinstance(body[parameter], type_)
        }
        if any(incorrect_types):
            raise AssertionError(
                f"Incorrect type provided for the following parameter(s): {incorrect_types}."
            )

    return values


def wrap_response(
    status_code: int,
    success: bool,
    error: bool,
    message: str = "",
    data: Optional[Serializable] = None,
) -> Response:
    """
    :param status_code: HTTP status code to return.
    :param success: Indicates success.
    :param error: Indicates an error.
    :param message: Message to accompany the response.
    :param data: Optional data object to return with.
    """
    if status_code >= 400:
        logging.error(message)
    body = dict(success=success, error=error, message=message)
    if data:
        body["data"] = _replace_decimals(data)
    res = {
        "isBase64Encoded": False,
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Headers": (
                "Content-Type,X-Amz-Date,Authorization,"
                "X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
            ),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
        },
        "body": json.dumps(body),
    }
    logging.info(f"\nResponse:\n{pformat(res)}")
    return res


def wrap_exception(
    status_code: int = 400, message: str = "", data: Optional[Serializable] = None
) -> Response:
    """
    :param status_code: HTTP status code to return.
    :param message: Message to accompany the exception.
    :param data: Optional data object to return with.
    """
    logging.exception(message)
    body = dict(success=False, error=True, message=message)
    if data:
        body["data"] = _replace_decimals(data)
    res = {
        "isBase64Encoded": False,
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Headers": (
                "Content-Type,X-Amz-Date,Authorization,"
                "X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
            ),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
        },
        "body": json.dumps(body),
    }
    logging.info(f"\nResponse:\n{pformat(res)}")
    return res
