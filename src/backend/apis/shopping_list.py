from flask import request
from flask_restx import Namespace, Resource

from core.shopping_list import get_shopping_list, patch_shopping_list, put_shopping_list
from models import (
    register_user_request_models,
    register_user_response_models,
    shopping_list_data,
    shopping_list_response_model,
)

api = Namespace("shoppinglist", description="Shopping list related operations.")
register_user_request_models(api)
register_user_response_models(api)


@api.route("")
class ShoppingList(Resource):
    @api.marshal_with(shopping_list_response_model, skip_none=True)
    def get(self):
        """Get the shopping list."""
        user_id = request.environ["USER_ID"]
        return get_shopping_list(user_id)

    @api.expect(shopping_list_data)
    @api.marshal_with({}, code=204)
    def patch(self):
        """Update the shopping list."""
        user_id = request.environ["USER_ID"]
        body = request.json.get("shoppingList")
        return patch_shopping_list(user_id, body)

    @api.expect(shopping_list_data)
    @api.marshal_with({}, code=204)
    def put(self):
        """Overwrite the shopping list."""
        user_id = request.environ["USER_ID"]
        body = request.json.get("shoppingList")
        return put_shopping_list(user_id, body)
