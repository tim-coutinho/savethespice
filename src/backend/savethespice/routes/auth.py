from functools import cache

import boto3
from boto3_type_annotations.cognito_idp import Client as CognitoClient
from botocore.exceptions import ParamValidationError
from fastapi import APIRouter, Response, status

from savethespice.crud import meta_table
from savethespice.lib.common import root_logger
from savethespice.lib.config import environment
from savethespice.models import (
    ConfirmForgotPasswordRequest,
    ConfirmForgotPasswordResponse,
    ConfirmSignUpRequest,
    ConfirmSignUpResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    RefreshIdTokenRequest,
    RefreshIdTokenResponse,
    ResendCodeRequest,
    ResendCodeResponse,
    SignInRequest,
    SignInResponse,
    SignUpRequest,
    SignUpResponse,
)

logging = root_logger.getChild(__name__)
api = APIRouter(prefix="/auth", tags=["auth"])


@cache
def _get_cognito_client() -> CognitoClient:
    return boto3.client("cognito-idp")


@api.post("/signup", status_code=status.HTTP_200_OK, response_model=SignUpResponse)
async def sign_up(req: SignUpRequest, res: Response):
    """
    Sign up using email and password, sending a confirmation code to the email.
    """
    logging.info("Starting sign up flow.")

    client = _get_cognito_client()
    try:
        cognito_response = client.sign_up(
            ClientId=environment.client_id, Username=req.email, Password=req.password
        )
    except client.exceptions.UsernameExistsException:
        res.status_code = status.HTTP_409_CONFLICT
        return {"message": "This email is already registered."}
    except (client.exceptions.InvalidPasswordException, ParamValidationError):
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Invalid password."}

    meta_table.create_user(cognito_response["UserSub"])

    logging.info("Sign up flow successful.")
    return {"message": f"Sign up successful! A verification email has been sent to {req.email}."}


@api.post("/confirmsignup", status_code=status.HTTP_200_OK, response_model=ConfirmSignUpResponse)
async def confirm_sign_up(req: ConfirmSignUpRequest, res: Response):
    """
    Confirm sign up using a confirmation code.
    """
    logging.info("Starting confirm sign up flow.")

    client = _get_cognito_client()
    try:
        client.confirm_sign_up(
            ClientId=environment.client_id,
            Username=req.email,
            ConfirmationCode=req.confirmationCode,
        )
    except client.exceptions.UserNotFoundException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "This email is not registered."}
    except (client.exceptions.CodeMismatchException, ParamValidationError):
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Invalid confirmation code."}
    except client.exceptions.NotAuthorizedException:
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "User has already been verified."}

    logging.info("Confirm sign up flow successful.")
    return {"message": "Your email has been verified!"}


@api.post("/signin", status_code=status.HTTP_200_OK, response_model=SignInResponse)
async def sign_in(req: SignInRequest, res: Response):
    """
    Sign in using email and password, returning an id token, refresh token, and user string.
    """
    logging.info("Starting sign in flow.")

    client = _get_cognito_client()

    try:
        cognito_response = client.admin_initiate_auth(
            AuthFlow="ADMIN_USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": req.email, "PASSWORD": req.password},
            ClientId=environment.client_id,
            UserPoolId=environment.user_pool_id,
        )
    except client.exceptions.InvalidParameterException as e:
        message: str = e.args[0]
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": message[message.rindex(": ") + 2 :].replace("USERNAME", "EMAIL")}
    except client.exceptions.NotAuthorizedException:
        res.status_code = status.HTTP_401_UNAUTHORIZED
        return {"message": "Incorrect password."}
    except client.exceptions.UserNotConfirmedException:
        res.status_code = status.HTTP_403_FORBIDDEN
        return {"message": "User is not verified."}
    except client.exceptions.UserNotFoundException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "This email is not registered."}

    cognito_response = cognito_response["AuthenticationResult"]
    access_token = cognito_response.get("AccessToken")
    refresh_token = cognito_response.get("RefreshToken")
    id_token = cognito_response.get("IdToken")

    user = client.get_user(AccessToken=access_token).get("Username")

    logging.info("Sign in flow successful.")
    return {
        "message": "You have been signed in.",
        "data": {"idToken": id_token, "refreshToken": refresh_token, "user": user},
    }


@api.post("/refreshidtoken", status_code=status.HTTP_200_OK, response_model=RefreshIdTokenResponse)
async def refresh_id_token(req: RefreshIdTokenRequest, res: Response):
    """
    Refresh a user's ID token using a refresh token, returning an id token and user string.
    """
    logging.info("Starting refresh ID token flow.")

    client = _get_cognito_client()

    try:
        cognito_response = client.admin_initiate_auth(
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters=({"REFRESH_TOKEN": req.refreshToken}),
            ClientId=environment.client_id,
            UserPoolId=environment.user_pool_id,
        )
    except client.exceptions.NotAuthorizedException:
        res.status_code = status.HTTP_401_UNAUTHORIZED
        return {"message": "Invalid refresh token.", "data": {"refreshTokenExpired": True}}
    except client.exceptions.UserNotConfirmedException:
        res.status_code = status.HTTP_403_FORBIDDEN
        return {"message": "User is not verified."}

    cognito_response = cognito_response["AuthenticationResult"]
    access_token = cognito_response.get("AccessToken")
    id_token = cognito_response.get("IdToken")

    user = client.get_user(AccessToken=access_token).get("Username")

    logging.info("Refresh ID token flow successful.")
    return {"message": "You have been signed in.", "data": {"idToken": id_token, "user": user}}


@api.post("/resendcode", status_code=status.HTTP_200_OK, response_model=ResendCodeResponse)
async def resend_code(req: ResendCodeRequest, res: Response):
    """
    Resend a confirmation code to a user's email.
    """
    logging.info("Starting resend code flow.")

    client = _get_cognito_client()
    try:
        client.resend_confirmation_code(ClientId=environment.client_id, Username=req.email)
    except client.exceptions.UserNotFoundException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "This email is not registered."}
    except client.exceptions.InvalidParameterException:
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "User is already verified."}

    logging.info("Resend code flow successful.")
    return {"message": f"A verification code has been sent to {req.email}."}


@api.post("/forgotpassword", status_code=status.HTTP_200_OK, response_model=ForgotPasswordResponse)
async def forgot_password(req: ForgotPasswordRequest, res: Response):
    """
    Send a forgot password email to a user.
    """
    logging.info("Starting forgot password flow.")

    client = _get_cognito_client()
    try:
        client.forgot_password(ClientId=environment.client_id, Username=req.email)
    except client.exceptions.UserNotFoundException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "This email is not registered."}
    except client.exceptions.InvalidParameterException:
        res.status_code = status.HTTP_403_FORBIDDEN
        return {"message": "User is not verified yet."}
    except client.exceptions.LimitExceededException:
        res.status_code = status.HTTP_429_TOO_MANY_REQUESTS
        return {"message": "Too many requests, please try again later."}

    logging.info("Forgot password flow successful.")
    return {"message": f"A password reset code has been sent to {req.email}."}


@api.post(
    "/confirmforgotpassword",
    status_code=status.HTTP_200_OK,
    response_model=ConfirmForgotPasswordResponse,
)
async def confirm_forgot_password(req: ConfirmForgotPasswordRequest, res: Response):
    """
    Reset a user's password using a confirmation code and a new password.
    """
    logging.info("Starting confirm forgot password flow.")

    client = _get_cognito_client()
    try:
        client.confirm_forgot_password(
            ClientId=environment.client_id,
            Username=req.email,
            ConfirmationCode=req.confirmationCode,
            Password=req.password,
        )
    except ParamValidationError as e:
        report = e.kwargs["report"]
        if "Invalid type for parameter ConfirmationCode" in report:
            res.status_code = status.HTTP_400_BAD_REQUEST
            return {"message": "Invalid confirmation code."}
        elif "Invalid length for parameter Password" in report:
            res.status_code = status.HTTP_400_BAD_REQUEST
            return {"message": "Invalid password."}
    except client.exceptions.UserNotFoundException:
        res.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "This email is not registered."}
    except client.exceptions.InvalidPasswordException:
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Invalid password."}
    except client.exceptions.CodeMismatchException:
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Invalid confirmation code."}
    except client.exceptions.NotAuthorizedException:
        res.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Password reset has already been confirmed."}

    logging.info("Confirm forgot password flow successful.")
    return {"message": "Your password has been successfully reset!"}
