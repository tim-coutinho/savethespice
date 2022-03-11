from typing import Optional

from pydantic import BaseModel


class SignUpResponse(BaseModel):
    message: str


class ConfirmSignUpResponse(BaseModel):
    message: str


class SignInResponse(BaseModel):
    class SignInResponseData(BaseModel):
        idToken: str
        refreshToken: str
        user: str

    message: str
    data: Optional[SignInResponseData]


class RefreshIdTokenResponse(BaseModel):
    class RefreshIdTokenResponseData(BaseModel):
        idToken: Optional[str]
        user: Optional[str]
        refreshTokenExpired: Optional[bool] = False

    message: str
    data: Optional[RefreshIdTokenResponseData]


class ResendCodeResponse(BaseModel):
    message: str


class ForgotPasswordResponse(BaseModel):
    message: str


class ConfirmForgotPasswordResponse(BaseModel):
    message: str
