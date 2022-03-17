from fastapi import APIRouter, Request, status

from savethespice.crud import meta_table
from savethespice.lib.common import root_logger
from savethespice.models import ShoppingList, UpdateShoppingListRequest

logging = root_logger.getChild(__name__)
api = APIRouter(prefix="/private/shoppinglist", tags=["shoppinglist"])


@api.get("", response_model=ShoppingList)
async def get_shopping_list(req: Request):
    """
    Get all shopping list items in the database.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Getting shopping list for user with ID {user_id}.")
    shopping_list = meta_table.get_shopping_list(user_id)
    logging.info(f"Found shopping list {shopping_list}")

    return shopping_list


@api.patch("", status_code=status.HTTP_204_NO_CONTENT)
async def patch_shopping_list(shopping_list: UpdateShoppingListRequest, req: Request):
    """
    Update the shopping list, adding the items provided.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Updating shopping list for user with ID {user_id} with items {shopping_list}.")
    meta_table.update_shopping_list(user_id, shopping_list)


@api.put("", status_code=status.HTTP_204_NO_CONTENT)
async def put_shopping_list(shopping_list: UpdateShoppingListRequest, req: Request):
    """
    Overwrite the shopping list, replacing the existing list with the items provided.
    """
    user_id: str = req.scope["USER_ID"]
    logging.info(f"Replacing shopping list for user with ID {user_id} with items {shopping_list}.")
    meta_table.overwrite_shopping_list(user_id, shopping_list)
