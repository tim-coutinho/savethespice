import json
import os
import re
from decimal import Decimal
from pprint import pformat
from typing import List, Union

from flask import Blueprint, Response as FlaskResponse, request
from flask.json import JSONEncoder
from recipe_scrapers import NoSchemaFoundInWildMode, scrape_me
from requests.exceptions import ConnectionError, InvalidURL
from requests.utils import prepend_scheme_if_needed
from werkzeug.exceptions import MethodNotAllowed

from lib.common import root_logger as logging
from lib.flask_lambda import FlaskLambda
from lib.types import Response, ResponseData
from ops import auth, categories, recipes, shopping_list


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


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
scrape_bp = Blueprint("scrape", __name__, url_prefix="/scrape")
recipes_bp = Blueprint("recipes", __name__, url_prefix="/recipes")
categories_bp = Blueprint("categories", __name__, url_prefix="/categories")
shopping_list_bp = Blueprint("shoppinglist", __name__, url_prefix="/shoppinglist")

app = FlaskLambda(__name__)
app.json_encoder = DecimalEncoder
logging.addHandler(app.logger)


#########################
# Error handling / Meta #
#########################


@app.errorhandler(404)
def resource_not_found(_) -> Response:
    return ResponseData(message=f"Unrecognized HTTP resource {request.path}"), 404


# @auth_bp.errorhandler(404)
# @scrape_bp.errorhandler(404)
# @recipes_bp.errorhandler(404)
# @categories_bp.errorhandler(404)
# @shopping_list_bp.errorhandler(404)
# def handle_404(e) -> Response:
#     ...


@app.errorhandler(500)
@app.errorhandler(Exception)
def generic_exception(e) -> Response:
    return ResponseData(message=f"Unhandled exception: {repr(e)}"), 500


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


if os.environ["FLASK_ENV"] == "development":
    @app.before_request
    def before_request():
        request.environ["USER_ID"] = "16e09fc0-89a7-4aff-946c-02771482576f"
        os.environ.update(
            {
                "recipes_table_name": "SaveTheSpice-Recipes",
                "categories_table_name": "SaveTheSpice-Categories",
                "meta_table_name": "SaveTheSpice-Meta",
            }
        )


@app.after_request
def wrap_response(res: FlaskResponse) -> FlaskResponse:
    """
    Handles adding necessary response headers and logging.
    """
    if res.json:
        if res.json.pop("exception", None):  # Don't return to client, and don't log if already logged
            res.data = json.dumps(res.json)
        elif res.status_code >= 400:
            logging.error(res.json["message"])

    res.headers.update(
        {
            "Access-Control-Allow-Headers": (
                "Content-Type,X-Amz-Date,Authorization,"
                "X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent"
            ),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
        }
    )
    logging.debug(f"\nResponse: {pformat({'statusCode': res.status_code, 'body': res.json})}")
    return res


##########
# Routes #
##########


###################
# Auth operations #
###################


@auth_bp.route("/signup", methods=("POST",))
def route_sign_up() -> Response:
    body = request.json
    return auth.sign_up(body)


@auth_bp.route("/confirmsignup", methods=("POST",))
def route_confirm_sign_up() -> Response:
    body = request.json
    return auth.confirm_sign_up(body)


@auth_bp.route("/signin", methods=("POST",))
def route_sign_in() -> Response:
    body = request.json
    return auth.sign_in(body)


@auth_bp.route("/refreshidtoken", methods=("POST",))
def route_refresh_id_token() -> Response:
    body = request.json
    return auth.refresh_id_token(body)


@auth_bp.route("/resendcode", methods=("POST",))
def route_resend_code() -> Response:
    body = request.json
    return auth.resend_code(body)


@auth_bp.route("/forgotpassword", methods=("POST",))
def route_forgot_password() -> Response:
    body = request.json
    return auth.forgot_password(body)


@auth_bp.route("/confirmforgotpassword", methods=("POST",))
def route_confirm_forgot_password() -> Response:
    body = request.json
    return auth.confirm_forgot_password(body)


#####################
# Scrape operations #
#####################


@scrape_bp.route("", methods=("GET",))
def route_scrape() -> Response:
    def _normalize_list(list_: Union[str, List[str]]) -> List[str]:
        """Normalize a list or string with possible leading markers to just a list."""
        return (
            [re.sub(r"^\d+[.:]? ?", "", entry) for entry in list_.split("\n")]
            if isinstance(list_, str)
            else list_
        )

    url = request.args.get("url")
    if not url:
        return ResponseData(message="No url provided."), 400
    logging.info(f"Scraping url: {url}")
    try:
        scraped = scrape_me(prepend_scheme_if_needed(url, "https"), wild_mode=True)
    except NoSchemaFoundInWildMode:
        return ResponseData(message=f"No recipe schema found at {url}"), 200
    except (ConnectionError, InvalidURL):
        return ResponseData(message=f"{url} is not a valid url."), 400
    except Exception:
        logging.exception("")
        return ResponseData(message=r"¯\_(ツ)_/¯", exception=True), 400

    data = {
        "url": url,
        "name": scraped.title(),
        "imgSrc": scraped.image(),
        "adaptedFrom": scraped.site_name() or scraped.host(),
        "yield": scraped.yields(),
        "cookTime": scraped.total_time() or "",
        "instructions": _normalize_list(scraped.instructions()),
        "ingredients": _normalize_list(scraped.ingredients()),
    }
    logging.info(f"Found data:\n{pformat(data)}")
    return ResponseData(data=data), 200


###########################
# Batch recipe operations #
###########################


@recipes_bp.route("", methods=("GET",))
def route_get_recipes() -> Response:
    user_id = request.environ["USER_ID"]
    return recipes.get_recipes(user_id)


@recipes_bp.route("", methods=("PATCH",))
def route_patch_recipes() -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return recipes.patch_recipes(user_id, body)


@recipes_bp.route("", methods=("DELETE",))
def route_delete_recipes() -> Response:
    recipe_ids = request.json
    user_id = request.environ["USER_ID"]
    return recipes.delete_recipes(user_id, recipe_ids)


############################
# Single recipe operations #
############################


@recipes_bp.route("/<int:recipe_id>", methods=("GET",))
def route_get_recipe(recipe_id: int) -> Response:
    user_id = request.environ["USER_ID"]
    return recipes.get_recipe(user_id, recipe_id)


@recipes_bp.route("", methods=("POST",))
def route_post_recipe() -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return recipes.post_recipe(user_id, body)


@recipes_bp.route("/<int:recipe_id>", methods=("PATCH",))
def route_patch_recipe(recipe_id: int) -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return recipes.patch_recipe(user_id, body, recipe_id)


@recipes_bp.route("/<int:recipe_id>", methods=("PUT",))
def route_put_recipe(recipe_id: int) -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return recipes.put_recipe(user_id, body, recipe_id)


@recipes_bp.route("/<int:recipe_id>", methods=("DELETE",))
def route_delete_recipe(recipe_id: int) -> Response:
    user_id = request.environ["USER_ID"]
    return recipes.delete_recipe(user_id, recipe_id)


#############################
# Batch category operations #
#############################


@categories_bp.route("", methods=("GET",))
def route_get_categories() -> Response:
    user_id = request.environ["USER_ID"]
    return categories.get_categories(user_id)


@categories_bp.route("", methods=("PATCH",))
def route_patch_categories() -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return categories.patch_categories(user_id, body)


@categories_bp.route("", methods=("DELETE",))
def route_delete_categories() -> Response:
    category_ids = request.json
    user_id = request.environ["USER_ID"]
    res1, status_code1 = recipes.remove_categories_from_recipes(user_id, category_ids)
    res2, status_code2 = categories.delete_categories(user_id, category_ids)
    return ResponseData(data={**res1["data"], **res2["data"]}), max(status_code1, status_code2)


##############################
# Single category operations #
##############################


@categories_bp.route("/<int:category_id>", methods=("GET",))
def route_get_category(category_id: int) -> Response:
    user_id = request.environ["USER_ID"]
    return categories.get_category(user_id, category_id)


@categories_bp.route("", methods=("POST",))
def route_post_category() -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return categories.post_category(user_id, body)


@categories_bp.route("/<int:category_id>", methods=("PATCH",))
def route_patch_category(category_id: int) -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return categories.patch_category(user_id, body, category_id)


@categories_bp.route("/<int:category_id>", methods=("PUT",))
def route_put_category(category_id: int) -> Response:
    body = request.json
    user_id = request.environ["USER_ID"]
    return categories.put_category(user_id, body, category_id)


@categories_bp.route("/<int:category_id>", methods=("DELETE",))
def route_delete_category(category_id: int) -> Response:
    user_id = request.environ["USER_ID"]
    res1, status_code1 = recipes.remove_categories_from_recipes(user_id, [category_id])
    res2, status_code2 = categories.delete_category(user_id, category_id)
    return ResponseData(data={**res1["data"], **res2["data"]}), max(status_code1, status_code2)


##################################
# Batch shopping list operations #
##################################


@shopping_list_bp.route("", methods=("GET",))
def route_get_shopping_list() -> Response:
    user_id = request.environ["USER_ID"]
    return shopping_list.get_shopping_list(user_id)


for bp in (auth_bp, scrape_bp, recipes_bp, categories_bp, shopping_list_bp):
    app.register_blueprint(bp)
