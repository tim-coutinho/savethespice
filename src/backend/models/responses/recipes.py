# flake8: noqa
from flask_restx.fields import Integer, List, Nested, String

from models import db_category_data
from models.common import _make_response_data_model
from models.requests.recipes import (
    _db_recipe,
    _db_recipe_response_model as db_recipe_response_model,
    db_recipe_data,
    recipe_model,
)

recipe_update_response_data, recipe_update_response_model = _make_response_data_model(
    "UpdateRecipe",
    {
        "existingCategories": List(Integer),
        "newCategories": List(Nested(db_category_data, skip_none=True)),
        "categoryFailedAdds": List(String),
        "imgSrc": String(),
    },
    skip_none=True,
)

recipe_add_response_data, recipe_add_response_model = _make_response_data_model(
    "AddRecipe",
    {
        **_db_recipe,
        "existingCategories": List(Integer),
        "newCategories": List(Nested(db_category_data, skip_none=True)),
        "categoryFailedAdds": List(String),
    },
    skip_none=True,
)

recipe_delete_response_data, recipe_delete_response_model = _make_response_data_model(
    "DeleteRecipe",
    {"updatedRecipes": List(Integer), "failedUpdatedRecipes": List(Integer)},
    skip_none=True,
)

batch_recipe_get_response_data, batch_recipe_get_response_model = _make_response_data_model(
    "BatchGetRecipe", {"recipes": List(Nested(db_recipe_data, skip_none=True))}
)

(
    batch_recipe_update_response_data,
    batch_recipe_update_response_model,
) = _make_response_data_model("BatchUpdateRecipe", {"failedUpdates": List(Integer)}, skip_none=True)

(
    batch_recipe_delete_response_data,
    batch_recipe_delete_response_model,
) = _make_response_data_model(
    "BatchDeleteRecipe", {"failedDeletions": List(Integer)}, skip_none=True
)

batch_recipe_add_response_data, batch_recipe_add_response_model = _make_response_data_model(
    "BatchAddRecipe",
    {
        "recipes": List(Nested(db_recipe_data), skip_none=True),
        "failedAdds": List(Nested(recipe_model), skip_none=True),
        "existingCategories": List(Integer),
        "newCategories": List(Nested(db_category_data, skip_none=True)),
        "categoryFailedAdds": List(String),
    },
)
