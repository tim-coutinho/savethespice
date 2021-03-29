from flask_restx.fields import DateTime, Integer, List, String

from models.common import _make_response_data_model

_shopping_list = {
    "shoppingList": List(String),
}

_user = {
    **_shopping_list,
    "userId": String(required=True),
    "nextCategoryId": Integer(),
    "nextRecipeId": Integer(),
    "signUpTime": DateTime(),
}

shopping_list_data, _shopping_list_response_model = _make_response_data_model(
    "ShoppingList", _shopping_list
)
