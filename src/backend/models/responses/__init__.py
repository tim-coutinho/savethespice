# flake8: noqa
from flask_restx import Model, Namespace
from flask_restx.fields import String, Wildcard

from models.responses.auth import (
    refresh_id_token_response_data,
    refresh_id_token_response_model,
    sign_in_token_response_data,
    sign_in_token_response_model,
)
from models.responses.categories import (
    batch_category_delete_response_data,
    batch_category_delete_response_model,
    batch_category_get_response_data,
    batch_category_get_response_model,
    batch_category_update_response_data,
    batch_category_update_response_model,
    category_delete_response_data,
    category_delete_response_model,
    db_category_response_model,
)
from models.responses.recipes import (
    batch_recipe_add_response_data,
    batch_recipe_add_response_model,
    batch_recipe_delete_response_data,
    batch_recipe_delete_response_model,
    batch_recipe_get_response_data,
    batch_recipe_get_response_model,
    batch_recipe_update_response_data,
    batch_recipe_update_response_model,
    db_recipe_response_model,
    recipe_add_response_data,
    recipe_add_response_model,
    recipe_delete_response_data,
    recipe_delete_response_model,
    recipe_update_response_data,
    recipe_update_response_model,
)
from models.responses.scrape import scrape_response_data, scrape_response_model
from models.responses.users import shopping_list_response_model

default_response_model = Model("DefaultResponse", {"message": String(), "data": Wildcard(String)})


def register_recipe_response_models(api: Namespace) -> None:
    for model in (
        batch_recipe_add_response_data,
        batch_recipe_add_response_model,
        batch_recipe_delete_response_data,
        batch_recipe_delete_response_model,
        batch_recipe_get_response_data,
        batch_recipe_get_response_model,
        batch_recipe_update_response_data,
        batch_recipe_update_response_model,
        db_recipe_response_model,
        recipe_add_response_data,
        recipe_add_response_model,
        recipe_delete_response_data,
        recipe_delete_response_model,
        recipe_update_response_data,
        recipe_update_response_model,
    ):
        api.models[model.name] = model


def register_category_response_models(api: Namespace) -> None:
    for model in (
        batch_category_get_response_model,
        batch_category_update_response_model,
        category_delete_response_model,
        db_category_response_model,
        category_delete_response_data,
        batch_category_get_response_data,
        batch_category_update_response_data,
        batch_category_delete_response_data,
        batch_category_delete_response_model,
        default_response_model,
    ):
        api.models[model.name] = model


def register_scrape_response_models(api: Namespace) -> None:
    for model in (scrape_response_data, scrape_response_model, default_response_model):
        api.models[model.name] = model


def register_user_response_models(api: Namespace) -> None:
    for model in (shopping_list_response_model, default_response_model):
        api.models[model.name] = model


def register_auth_response_models(api: Namespace) -> None:
    for model in (
        refresh_id_token_response_data,
        refresh_id_token_response_model,
        sign_in_token_response_data,
        sign_in_token_response_model,
        default_response_model,
    ):
        api.models[model.name] = model
