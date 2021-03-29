from flask import request
from flask_restx import Namespace, Resource

from core.categories import (
    delete_categories,
    delete_category,
    get_categories,
    get_category,
    patch_categories,
    patch_category,
    post_category,
    put_category,
)
from core.recipes import remove_categories_from_recipes
from lib.types import ResponseData
from models import (  # default_response_model,
    batch_category_delete_model,
    batch_category_delete_response_model,
    batch_category_get_response_model,
    batch_category_update_model,
    batch_category_update_response_model,
    category_delete_response_model,
    category_model,
    category_update_model,
    db_category_response_model,
    invalid_input_model,
    not_found_model,
    register_category_request_models,
    register_category_response_models,
)

api = Namespace("categories", description="Category related operations.")
register_category_request_models(api)
register_category_response_models(api)


@api.route("")
@api.response(400, description="Invalid Input", model=invalid_input_model)
@api.response(404, description="Not Found", model=not_found_model)
class Categories(Resource):
    @api.marshal_with(batch_category_get_response_model, skip_none=True)
    def get(self):
        """Get all categories."""
        user_id = request.environ["USER_ID"]
        return get_categories(user_id)

    @api.expect(batch_category_delete_model)
    @api.marshal_with(batch_category_delete_response_model)
    @api.response(204, description="Success")
    def delete(self):
        """Batch delete categories."""
        category_ids = api.payload.get("categoryIds")
        if not isinstance(category_ids, list):
            raise AssertionError("categoryIds provided is not a list.")
        user_id = request.environ["USER_ID"]
        res_data = {}

        res, status_code = delete_categories(user_id, category_ids)
        if status_code != 204:
            res_data.update(res["data"])
            category_ids = [
                category_id
                for category_id in category_ids
                if category_id not in res_data["failedDeletions"]
            ]

        res, status_code = remove_categories_from_recipes(user_id, category_ids)
        if status_code != 204:
            res_data.update(res["data"])

        if not res_data:
            return {}, 204
        return ResponseData(data=res_data), 200

    @api.expect(batch_category_update_model)
    @api.marshal_with(batch_category_update_response_model)
    @api.response(204, description="Success")
    def patch(self):
        """Batch update categories."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return patch_categories(user_id, body)

    @api.expect(category_model)
    @api.marshal_with(db_category_response_model, code=201)
    def post(self):
        """Add a new category."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return post_category(user_id, body)


@api.route("/<int:categoryId>")
@api.param("categoryId", "Unique category ID.")
@api.response(400, description="Invalid Input", model=invalid_input_model)
@api.response(404, description="Not Found", model=not_found_model)
class Category(Resource):
    @api.marshal_with(db_category_response_model)
    def get(self, categoryId):
        """Get a category by ID."""
        user_id = request.environ["USER_ID"]
        return get_category(user_id, categoryId)

    @api.marshal_with(category_delete_response_model, skip_none=True)
    @api.response(204, description="Success")
    def delete(self, categoryId):
        """Delete a category by ID."""
        user_id = request.environ["USER_ID"]

        res, status_code = delete_category(user_id, categoryId)
        if status_code != 204:
            return ResponseData(message=res["message"]), status_code

        res, status_code = remove_categories_from_recipes(user_id, [categoryId])
        if status_code != 204:
            return ResponseData(data=res["data"]), status_code

        return {}, 204

    @api.expect(category_update_model)
    @api.response(204, description="Success")
    def patch(self, categoryId):
        """Update a category by ID."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return patch_category(user_id, body, categoryId)

    @api.expect(category_model)
    @api.marshal_with(db_category_response_model)
    def put(self, categoryId):
        """Overwrite a category by ID."""
        body = api.payload
        user_id = request.environ["USER_ID"]
        return put_category(user_id, body, categoryId)
