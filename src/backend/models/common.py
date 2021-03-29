from typing import Dict, Optional, Tuple

from flask_restx import Model
from flask_restx.fields import DateTime, Nested, Raw, String

_user_id = String(required=True)
_name = String(min_length=1, max_length=200, required=True)
_create_time = DateTime(required=True)
_update_time = DateTime(required=True)


def _make_response_data_model(
    name: str, fields: Dict[str, Raw], skip_none: Optional[bool] = False
) -> Tuple[Model, Model]:
    model = Model(f"{name}Data", fields)
    return model, Model(
        f"{name}Response", {"message": String(), "data": Nested(model, skip_none=skip_none)}
    )
