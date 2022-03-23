from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Request, Response, status

from savethespice.crud import categories_table, recipes_table, share_table
from savethespice.lib.common import root_logger
from savethespice.models import (
    CreateShareLinkRequest,
    CreateShareLinkResponse,
    GetRecipeWithShareIdResponse,
)

logging = root_logger.getChild(__name__)
api = APIRouter(prefix="/public/share", tags=["share"])


@api.get("/{share_id}", response_model=GetRecipeWithShareIdResponse)
async def get(share_id: str, res: Response):
    """
    Get the details for a recipe given a share link.
    """
    logging.info(f"Getting recipe with ID {share_id}.")
    item = share_table.get(share_id)
    if not item:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"Share ID {share_id} is not valid."}
    logging.info(f"Successfully got recipe from share ID {share_id}")

    return {"data": item}


@api.post("", response_model=CreateShareLinkResponse)
async def create_share_link(
    create_share_link_request: CreateShareLinkRequest, req: Request, res: Response
):
    """
    Generate a share link for the given recipe.
    """
    recipe_id = create_share_link_request.recipeId
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Generating a share link for recipe with ID {recipe_id} for user {user_id}")

    recipe = recipes_table.get(user_id, recipe_id)
    if not recipe:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": f"User {user_id} does not have a recipe with ID {recipe_id}."}
    logging.info(f"Successfully got recipe with ID {recipe_id}")

    if recipe.categories:
        recipe.categories = categories_table.get_category_names_by_id(user_id, recipe.categories)

    share_id = str(uuid4())
    ttl = int((datetime.now(tz=timezone.utc) + timedelta(days=1)).timestamp())
    item = share_table.upsert(share_id, recipe, ttl)
    logging.info(f"Successfully generated share link with ID {share_id}")

    return {"data": item}
