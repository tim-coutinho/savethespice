from flask_restx import Model
from flask_restx.fields import Integer, List, Nested

from models.common import _create_time, _make_response_data_model, _name, _update_time

_category_id = Integer(required=True)

# Editable category fields
_category = {
    "name": _name,
}
category_model = Model("Category", _category)

_category_with_id = {
    **_category,
    "categoryId": _category_id,
}
category_with_id_model = Model("CategoryWithId", _category_with_id)

# All fields present in DynamoDB
_db_category = {
    **_category_with_id,
    "createTime": _create_time,
    "updateTime": _update_time,
}
db_category_data, _db_category_response_model = _make_response_data_model(
    "DbCategory", _db_category, skip_none=True
)

_category_update = {"update": Nested(category_model)}
category_update_model = Model("CategoryUpdate", _category_update)

_batch_category_delete = {"categoryIds": List(_category_id)}
batch_category_delete_model = Model("BatchCategoryDelete", _batch_category_delete)

_batch_category_update = {
    "categoryIdToUpdate1": Nested(category_update_model),
    "categoryIdToUpdate2": Nested(category_update_model),
}
batch_category_update_model = Model("BatchCategoryUpdate", _batch_category_update)
