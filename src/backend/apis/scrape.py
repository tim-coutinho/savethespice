import re
from typing import List, Union

from flask import request
from flask_restx import Namespace, Resource
from recipe_scrapers import NoSchemaFoundInWildMode, scrape_me
from requests.exceptions import ConnectionError, InvalidURL
from requests.utils import prepend_scheme_if_needed

from lib.common import pformat_ as pformat, root_logger
from lib.types import ResponseData
from models import invalid_input_model, register_scrape_response_models, scrape_response_model

logging = root_logger.getChild("scrape")

api = Namespace("scrape", description="Scraping related operations.")
register_scrape_response_models(api)


@api.route("")
@api.response(400, "Invalid Input", invalid_input_model)
class Scrape(Resource):
    @api.param("url", "URL to scrape.")
    @api.marshal_with(scrape_response_model, skip_none=True)
    def get(self):
        """Scrape a url for recipe info."""

        def _normalize_list(list_: Union[str, List[str]]) -> List[str]:
            """Normalize a list or string with possible leading markers to just a list."""
            return (
                [re.sub(r"^\d+[.:]? ?", "", entry) for entry in list_.split("\n")]
                if isinstance(list_, str)
                else list_
            )

        url = request.args.get("url")
        if not url:
            return ResponseData(message="No url provided."), 400
        logging.info(f"Scraping url: {url}")
        try:
            scraped = scrape_me(prepend_scheme_if_needed(url, "http"), wild_mode=True)
        except NoSchemaFoundInWildMode:
            return ResponseData(message=f"No recipe schema found at {url}"), 200
        except (ConnectionError, InvalidURL):
            return ResponseData(message=f"{url} is not a valid url."), 400
        except Exception:
            logging.exception(r"¯\_(ツ)_/¯")
            return ResponseData(message=r"¯\_(ツ)_/¯"), 500

        data = {
            "url": url,
            "name": scraped.title(),
            "imgSrc": scraped.image(),
            "adaptedFrom": scraped.site_name() or scraped.host(),
            "yield": scraped.yields(),
            "cookTime": scraped.total_time() or "",
            "instructions": _normalize_list(scraped.instructions()),
            "ingredients": _normalize_list(scraped.ingredients()),
        }
        logging.info(f"Found data:\n{pformat(data)}")
        return ResponseData(data=data), 200
