from typing import Optional

from pydantic import BaseModel

from savethespice.models.common import DBItem
from savethespice.models.requests.recipes import RecipeBase


class CreateShareLinkRequest(BaseModel):
    recipeId: int


class ShareRecipeBase(RecipeBase):
    categories: Optional[list[str]]
    ttl: int


class ShareRecipeEntry(DBItem, ShareRecipeBase):
    shareId: str
