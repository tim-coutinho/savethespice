from typing import Optional

from pydantic import BaseModel

from savethespice.models.requests.categories import Category


class GetCategoryResponse(BaseModel):
    message: Optional[str]
    data: Optional[Category]


class GetCategoriesResponse(BaseModel):
    class GetCategoriesResponseData(BaseModel):
        categories: list[Category]

    data: GetCategoriesResponseData


class DeleteCategoryResponse(BaseModel):
    class DeleteCategoryResponseData(BaseModel):
        updatedRecipes: Optional[list[int]]

    message: Optional[str]
    data: Optional[DeleteCategoryResponseData]


class DeleteCategoriesResponse(BaseModel):
    class DeleteCategoriesResponseData(BaseModel):
        # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
        updatedRecipes: Optional[list[int]]
        failedDeletions: Optional[list[int]]

    data: Optional[DeleteCategoriesResponseData]


class PatchCategoriesResponse(BaseModel):
    class PatchCategoriesResponseData(BaseModel):
        # TODO: Prefer Iterable: https://github.com/tiangolo/fastapi/pull/3913
        failedUpdates: list[int]

    data: Optional[PatchCategoriesResponseData]


class PostCategoryResponse(BaseModel):
    data: Category


class PutCategoryResponse(BaseModel):
    data: Category
