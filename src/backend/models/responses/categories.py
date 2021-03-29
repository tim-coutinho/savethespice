# flake8: noqa
from flask_restx.fields import Integer, List, Nested

from models.common import _make_response_data_model
from models.requests.categories import (
    _db_category_response_model as db_category_response_model,
    db_category_data,
)

category_delete_response_data, category_delete_response_model = _make_response_data_model(
    "DeleteCategory",
    {"updatedRecipes": List(Integer), "failedUpdatedRecipes": List(Integer)},
    skip_none=True,
)

batch_category_get_response_data, batch_category_get_response_model = _make_response_data_model(
    "BatchGetCategory", {"categories": List(Nested(db_category_data, skip_none=True))}
)

(
    batch_category_update_response_data,
    batch_category_update_response_model,
) = _make_response_data_model(
    "BatchUpdateCategory", {"failedUpdates": List(Integer)}, skip_none=True
)

(
    batch_category_delete_response_data,
    batch_category_delete_response_model,
) = _make_response_data_model(
    "BatchDeleteCategory",
    {
        "updatedRecipes": List(Integer),
        "failedUpdatedRecipes": List(Integer),
        "failedDeletions": List(Integer),
    },
    skip_none=True,
)
