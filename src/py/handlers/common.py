import json
import logging
from typing import Dict, Optional, Union

Response = Dict[str, Union[bool, int, str]]


def wrap_response(
    status_code: int,
    success: bool,
    error: bool,
    message: str,
    data: Optional[Dict[str, Union[str, bool]]] = None,
) -> Response:
    """
    :param status_code: HTTP status code to return.
    :param success: Indicates success.
    :param error: Indicates an error.
    :param message: Message to accompany the response.
    :param data: Optional data object to return with.
    """
    return {
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
        "body": json.dumps(dict(success=success, error=error, message=message, data=data)),
    }


def wrap_exception(
    status_code: int = 400, message: str = "", data: Optional[Dict[str, Union[str, bool]]] = None
):
    """
    :param status_code: HTTP status code to return.
    :param message: Message to accompany the exception.
    :param data: Optional data object to return with.
    """
    logging.exception(message)
    return wrap_response(status_code, success=False, error=True, message=message, data=data)
