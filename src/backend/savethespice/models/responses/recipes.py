from typing import Optional

from pydantic import BaseModel

from savethespice.models.requests.categories import Category
from savethespice.models.requests.recipes import Recipe, RecipeBase


class ScrapeRecipeResponse(BaseModel):
    message: Optional[str]
    data: Optional[RecipeBase]


class UpsertRecipeResponseData(Recipe):
    imgSrc: Optional[str]
    existingCategories: Optional[list[int]]
    newCategories: Optional[list[Category]]
    categoryFailedAdds: Optional[list[str]]


class GetRecipeResponse(BaseModel):
    message: Optional[str]
    data: Optional[Recipe]


class GetRecipesResponse(BaseModel):
    class GetRecipesResponseData(BaseModel):
        recipes: list[Recipe]

    data: GetRecipesResponseData


class DeleteRecipeResponse(BaseModel):
    message: Optional[str]


class DeleteRecipesResponse(BaseModel):
    class DeleteRecipesResponseData(BaseModel):
        # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
        failedDeletions: list[int]

    data: Optional[DeleteRecipesResponseData]


class PostRecipeResponse(BaseModel):
    data: UpsertRecipeResponseData


class PatchRecipeResponse(BaseModel):
    message: Optional[str]
    data: Optional[UpsertRecipeResponseData]


class PatchRecipesResponse(BaseModel):
    class PatchRecipesResponseData(BaseModel):
        # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
        failedUpdates: list[int]

    data: Optional[PatchRecipesResponseData]


class PutRecipeResponse(BaseModel):
    data: UpsertRecipeResponseData


class PutRecipesResponse(BaseModel):
    class PutRecipesResponseData(BaseModel):
        # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
        recipes: list[Recipe]
        failedAdds: Optional[list[str]]
        existingCategories: Optional[list[int]]
        newCategories: Optional[list[int]]
        categoryFailedAdds: Optional[list[int]]

    data: PutRecipesResponseData
