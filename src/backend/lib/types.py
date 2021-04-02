from decimal import Decimal
from typing import Iterable, List, MutableMapping, Optional, Set, Tuple, TypedDict, Union

Hashable = Union[None, bool, float, int, str]
Serializable = Union[
    Hashable, Decimal, MutableMapping[str, "Serializable"], Iterable["Serializable"]
]


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
    imgSrc: str
    ingredients: List[str]
    instructions: List[str]
    categories: Set[int]


class ResponseData(TypedDict, total=False):
    message: Optional[str]
    data: Optional[Serializable]


Response = Tuple[ResponseData, int]
