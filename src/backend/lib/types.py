from decimal import Decimal
from typing import Iterable, List, Mapping, Optional, Set, Tuple, TypedDict, Union

Hashable = Union[None, bool, float, int, str]
Serializable = Union[Hashable, Decimal, Mapping[str, "Serializable"], Iterable["Serializable"]]


class CategoryEntry(TypedDict, total=False):
    userId: str
    categoryId: int
    updateTime: str
    createTime: str
    name: str


class RecipeEntry(TypedDict, total=False):
    userId: str
    recipeId: int
    updateTime: str
    createTime: str
    name: str
    desc: str
    cookTime: str
    ingredients: List[str]
    instructions: List[str]
    categories: Set[int]
    categoryId: Optional[int]  # Only when deleting categories


class ResponseData(TypedDict, total=False):
    message: Optional[str]
    data: Optional[Serializable]


Response = Tuple[ResponseData, int]
