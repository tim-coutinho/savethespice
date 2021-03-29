from flask import request
from flask_restx import Namespace, Resource

from core.recipes import (
    delete_recipe,
    delete_recipes,
    get_recipe,
    get_recipes,
    patch_recipe,
    patch_recipes,
    post_recipe,
    put_recipe,
)
from models import (
    batch_recipe_delete_model,
    batch_recipe_delete_response_model,
    batch_recipe_get_response_model,
    batch_recipe_update_model,
    invalid_input_model,
    not_found_model,
    recipe_add_response_model,
    recipe_model,
    recipe_update_model,
    recipe_update_response_model,
    register_recipe_request_models,
    register_recipe_response_models,
)

api = Namespace("recipes", description="Recipe related operations.")
register_recipe_request_models(api)
register_recipe_response_models(api)


@api.route("")
@api.response(400, "Invalid Input", invalid_input_model)
@api.response(404, "Not Found", not_found_model)
class Recipes(Resource):
    @api.marshal_list_with(batch_recipe_get_response_model, skip_none=True)
    def get(self):
        """Get all recipes."""
        user_id = request.environ["USER_ID"]
        return get_recipes(user_id)

    @api.expect(batch_recipe_delete_model)
    @api.marshal_with(batch_recipe_delete_response_model)
    @api.response(204, description="Success")
    def delete(self):
        """Batch delete recipes."""
        recipe_ids = api.payload.get("recipeIds")
        if not isinstance(recipe_ids, list):
            raise AssertionError("recipeIds provided is not a list.")
        user_id = request.environ["USER_ID"]
        return delete_recipes(user_id, recipe_ids)

    @api.expect(batch_recipe_update_model)
    @api.marshal_with(batch_recipe_update_model)
    @api.response(204, description="Success")
    def patch(self):
        """Batch update recipes."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return patch_recipes(user_id, body)

    @api.expect(recipe_model)
    @api.marshal_with(recipe_add_response_model, code=201, skip_none=True)
    def post(self):
        """Add a new recipe."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return post_recipe(user_id, body)


@api.route("/<int:recipeId>")
@api.param("recipeId", "Unique recipe ID.")
class Recipe(Resource):
    @api.marshal_with(recipe_model)
    def get(self, recipeId):
        """Get a recipe by ID."""
        user_id = request.environ["USER_ID"]
        return get_recipe(user_id, recipeId)

    @api.response(204, description="Success")
    def delete(self, recipeId):
        """Delete a recipe by ID."""
        user_id = request.environ["USER_ID"]
        return delete_recipe(user_id, recipeId)

    @api.expect(recipe_update_model)
    @api.marshal_with(recipe_update_response_model)
    @api.response(204, description="Success")
    def patch(self, recipeId):
        """Update a recipe by ID."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return patch_recipe(user_id, body, recipeId)

    @api.expect(recipe_model)
    @api.marshal_with(recipe_add_response_model)
    def put(self, recipeId):
        """Overwrite a recipe by ID."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return put_recipe(user_id, body, recipeId)
