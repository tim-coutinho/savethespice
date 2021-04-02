from flask_restx import Model
from flask_restx.fields import DateTime, Integer, List, Nested, String

from models.common import _make_response_data_model

_recipe_id = Integer(required=True)
_name = String(min_length=1, max_length=200, required=True)
_desc = String(max_length=200)
_cookTime = String()
_ingredients = List(String)
_instructions = List(String)
_create_time = DateTime(required=True)
_update_time = DateTime(required=True)
_adapted_from = String()
_url = String()

# Editable recipe fields
_recipe = {
    "name": _name,
    "desc": _desc,
    "cookTime": _cookTime,
    "ingredients": _ingredients,
    "instructions": _instructions,
    "categories": List(String),
    "adaptedFrom": _adapted_from,
    "url": _url,
    "imgSrc": String(),
}
recipe_model = Model("Recipe", _recipe)

_recipe_with_id = {
    **_recipe,
    "recipeId": _recipe_id,
}
recipe_with_id_model = Model("RecipeWithId", _recipe_with_id)

# All fields present in DynamoDB
_db_recipe = {
    **_recipe_with_id,
    "categories": List(Integer),
    "createTime": _create_time,
    "updateTime": _update_time,
}
db_recipe_data, _db_recipe_response_model = _make_response_data_model(
    "DbRecipe", _db_recipe, skip_none=True
)

_recipe_update = {
    "add": Nested(recipe_model),
    "remove": Nested(recipe_model),
    "update": Nested(recipe_model),
}
recipe_update_model = Model("RecipeUpdate", _recipe_update)

_batch_recipe_delete = {"recipeIds": List(_recipe_id)}
batch_recipe_delete_model = Model("BatchRecipeDelete", _batch_recipe_delete)

_batch_recipe_update = {
    "recipeIdToUpdate1": Nested(recipe_update_model),
    "recipeIdToUpdate2": Nested(recipe_update_model),
}
batch_recipe_update_model = Model("BatchRecipeUpdate", _batch_recipe_update)

_batch_recipe_add = {"recipes": List(Nested(recipe_model))}
batch_recipe_add_model = Model("BatchRecipeAdd", _batch_recipe_add)
