# flake8: noqa
from flask_restx import Model, Namespace
from flask_restx.fields import String

from models.requests.auth import (
    confirm_forgot_password_model,
    confirm_sign_up_model,
    forgot_password_model,
    refresh_id_token_model,
    resend_code_model,
    sign_in_model,
    sign_up_model,
)
from models.requests.categories import (
    batch_category_delete_model,
    batch_category_update_model,
    category_model,
    category_update_model,
    category_with_id_model,
    db_category_data,
)
from models.requests.recipes import (
    batch_recipe_delete_model,
    batch_recipe_update_model,
    db_recipe_data,
    recipe_model,
    recipe_update_model,
    recipe_with_id_model,
)
from models.requests.users import shopping_list_data

invalid_input_model = Model("InvalidInput", {"message": String()})
not_found_model = Model("NotFound", {"message": String()})


def register_recipe_request_models(api: Namespace) -> None:
    for model in (
        recipe_model,
        recipe_with_id_model,
        db_recipe_data,
        recipe_update_model,
        batch_recipe_delete_model,
        batch_recipe_update_model,
        invalid_input_model,
        not_found_model,
    ):
        api.models[model.name] = model


def register_category_request_models(api: Namespace) -> None:
    for model in (
        batch_category_delete_model,
        batch_category_update_model,
        category_model,
        category_update_model,
        category_with_id_model,
        db_category_data,
        invalid_input_model,
        not_found_model,
    ):
        api.models[model.name] = model


def register_user_request_models(api: Namespace) -> None:
    for model in (
        shopping_list_data,
        invalid_input_model,
        not_found_model,
    ):
        api.models[model.name] = model


def register_auth_request_models(api: Namespace) -> None:
    for model in (
        confirm_forgot_password_model,
        confirm_sign_up_model,
        forgot_password_model,
        refresh_id_token_model,
        resend_code_model,
        sign_in_model,
        sign_up_model,
        invalid_input_model,
        not_found_model,
    ):
        api.models[model.name] = model
