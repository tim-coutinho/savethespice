from pydantic import BaseModel


class SignUpRequest(BaseModel):
    email: str
    password: str


class ConfirmSignUpRequest(BaseModel):
    email: str
    confirmationCode: str


class SignInRequest(BaseModel):
    email: str
    password: str


class RefreshIdTokenRequest(BaseModel):
    refreshToken: str


class ResendCodeRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ConfirmForgotPasswordRequest(BaseModel):
    email: str
    password: str
    confirmationCode: str
