import os
from decimal import Decimal

from flask import Response as FlaskResponse, request
from flask.json import JSONEncoder
from werkzeug.exceptions import MethodNotAllowed

from apis import api
from lib.common import pformat_ as pformat, root_logger as logging
from lib.flask_lambda import FlaskLambda
from lib.types import Response, ResponseData


class DecimalEncoder(JSONEncoder):
    """
    DynamoDB returns numbers as Decimals, which aren't JSON serializable by default. This
    JSONEncoder subclass converts whole Decimals to ints and fractional Decimals to floats.
    """

    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        elif isinstance(obj, set):
            return list(obj)
        return super().default(obj)


app = FlaskLambda(__name__)
app.json_encoder = DecimalEncoder
app.config["RESTX_MASK_SWAGGER"] = False
logging.addHandler(app.logger)

api.init_app(app)

#########################
# Error handling / Meta #
#########################


@app.errorhandler(404)
def resource_not_found(_) -> Response:
    return ResponseData(message=f"Unrecognized HTTP resource {request.path}"), 404


# @app.errorhandler(500)
# @app.errorhandler(Exception)
# def generic_exception(e) -> Response:
#     return ResponseData(message=f"Unhandled exception: {repr(e)}"), 500


@app.errorhandler(MethodNotAllowed)
def method_not_allowed(_) -> Response:
    return ResponseData(message="Unsupported HTTP method."), 405


@app.errorhandler(NotImplementedError)
def method_not_implemented(_) -> Response:
    return ResponseData(message="Method not implemented."), 501


@app.errorhandler(AssertionError)
def assertion_error(e) -> Response:
    return ResponseData(message=e.args[0]), 400


@app.before_first_request
def log_environment():
    logging.debug(
        "\n".join(
            (
                "\nRequest args:",
                pformat(request.args.to_dict()),
                "Remote user:",
                pformat(request.remote_user),
                "Environment:",
                pformat(dict(os.environ)),
                "Request environment:",
                pformat(request.environ),
            )
        )
    )


@app.after_request
def wrap_response(res: FlaskResponse) -> FlaskResponse:
    """
    Handles adding necessary response headers and logging.
    """
    if res.json:
        ...
        # elif res.status_code >= 400:
        #     logging.error(res.json["message"])

    res.headers.update(
        {
            "Access-Control-Allow-Headers": (
                "Content-Type,X-Amz-Date,Authorization,"
                "X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
            ),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "Access-Control-Max-Age": 86400,
        }
    )
    logging.debug(f"\nResponse: {pformat({'statusCode': res.status_code, 'body': res.json})}")
    return res
