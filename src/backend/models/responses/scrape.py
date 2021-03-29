from flask_restx.fields import List, String

from models.common import _make_response_data_model

scrape_response_data, scrape_response_model = _make_response_data_model(
    "Scrape",
    {
        "url": String(required=True),
        "name": String(),
        "imgSrc": String(),
        "adaptedFrom": String(),
        "yield": String(),
        "cookTime": String(),
        "instructions": List(String),
        "ingredients": List(String),
    },
    skip_none=True,
)
