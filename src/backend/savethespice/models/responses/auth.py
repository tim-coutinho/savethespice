from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SignUpResponse(BaseModel):
    message: str


class ConfirmSignUpResponse(BaseModel):
    message: str


class SignInResponse(BaseModel):
    class SignInResponseData(BaseModel):
        user: str
        idToken: str
        idTokenExpiryTimestamp: datetime
        refreshToken: str

    message: str
    data: Optional[SignInResponseData]


class RefreshIdTokenResponse(BaseModel):
    class RefreshIdTokenResponseData(BaseModel):
        user: str
        idToken: str
        idTokenExpiryTimestamp: datetime
        refreshTokenExpired: bool

    message: Optional[str]
    data: Optional[RefreshIdTokenResponseData]


class ResendCodeResponse(BaseModel):
    message: str


class ForgotPasswordResponse(BaseModel):
    message: str


class ConfirmForgotPasswordResponse(BaseModel):
    message: str
