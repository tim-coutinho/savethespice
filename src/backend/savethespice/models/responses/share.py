from typing import Optional

from pydantic import BaseModel

from savethespice.models.requests.recipes import PostRecipeRequest


class GetRecipeWithShareIdResponse(BaseModel):
    message: Optional[str]
    data: Optional[PostRecipeRequest]  # TODO: Create different model


class CreateShareLinkResponse(BaseModel):
    class ShareRecipeResponseData(BaseModel):
        shareId: str
        ttl: int

    message: Optional[str]
    data: Optional[ShareRecipeResponseData]
