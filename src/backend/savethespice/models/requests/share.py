from pydantic import BaseModel

from savethespice.models.common import DBItem
from savethespice.models.requests.recipes import RecipeBase


class CreateShareLinkRequest(BaseModel):
    recipeId: int


class ShareRecipeBase(RecipeBase):
    ttl: int


class ShareRecipeEntry(DBItem, ShareRecipeBase):
    shareId: str
