from pydantic import BaseModel

from savethespice.models import DBItem


class CategoryBase(BaseModel):
    name: str


class Category(DBItem, CategoryBase):
    categoryId: int


DeleteCategoriesRequest = list[int]


class PatchCategoryRequest(BaseModel):
    update: CategoryBase


PatchCategoriesRequest = dict[int, PatchCategoryRequest]


class PostCategoryRequest(CategoryBase):
    pass


class PutCategoryRequest(CategoryBase):
    pass
