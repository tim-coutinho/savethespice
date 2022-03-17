from typing import Optional

from pydantic import BaseModel

from savethespice.models.requests.recipes import RecipeBase


class GetRecipeWithShareLinkResponse(BaseModel):
    message: Optional[str]
    data: Optional[RecipeBase]


class CreateShareLinkResponse(BaseModel):
    class ShareRecipeResponseData(BaseModel):
        shareId: str
        ttl: int

    message: Optional[str]
    data: Optional[ShareRecipeResponseData]
