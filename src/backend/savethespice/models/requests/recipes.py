from typing import Optional

from pydantic import BaseModel, Field

from savethespice.models import DBItem


class RecipeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    desc: Optional[str] = Field(None, max_length=200)
    cookTime: Optional[str]
    yields: Optional[str]
    ingredients: Optional[list[str]]
    instructions: Optional[list[str]]
    # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
    categories: Optional[list[int]]
    adaptedFrom: Optional[str]
    url: Optional[str]
    imgSrc: Optional[str]


class Recipe(DBItem, RecipeBase):
    recipeId: int


DeleteRecipesRequest = list[int]


class PostRecipeRequest(RecipeBase):
    # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
    categories: Optional[list[str]]


class PutRecipeRequest(PostRecipeRequest):
    pass


class PatchRecipeRequest(BaseModel):
    add: Optional[PostRecipeRequest]
    remove: Optional[PostRecipeRequest]
    update: Optional[PostRecipeRequest]


PatchRecipesRequest = dict[int, PatchRecipeRequest]


PutRecipesRequest = list[PutRecipeRequest]
