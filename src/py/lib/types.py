from decimal import Decimal
from typing import Iterable, List, Mapping, Optional, Set, Tuple, TypedDict, Union

Hashable = Union[None, bool, float, int, str]
Serializable = Union[Hashable, Decimal, Mapping[str, "Serializable"], Iterable["Serializable"]]


class CategoryEntry(TypedDict, total=False):
    userId: str
    categoryId: int
    lastEditedTime: int
    originalSubmitTime: int
    name: str


class RecipeEntry(TypedDict, total=False):
    userId: str
    recipeId: int
    lastEditedTime: int
    originalSubmitTime: int
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
    exception: Optional[bool]


Response = Tuple[ResponseData, int]
