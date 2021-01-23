import json
import logging
import os

import boto3
from boto3_type_annotations.cognito_idp import Client as CognitoClient
from botocore.exceptions import ParamValidationError

from common import Response, wrap_exception, wrap_response

CLIENT_ID = os.environ["client_id"]


def sign_up(event) -> Response:
    logging.info("Starting sign up flow")
    body = json.loads(event["body"] or "{}")

    try:
        if not body:
            raise KeyError("body")
        email = body.get("email")
        password = body.get("password")

        if not (email and password):
            raise KeyError("email" if not email else "password")
    except KeyError as e:
        return wrap_exception(400, f"{e.args[0].title()} required for sign up but not provided")

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        res = client.sign_up(ClientId=CLIENT_ID, Username=email, Password=password)
        logging.info(f"Sign up response: {res}")
    except client.exceptions.UsernameExistsException:
        return wrap_exception(409, "This email is already registered")
    except (client.exceptions.InvalidPasswordException, ParamValidationError):
        return wrap_exception(400, "Invalid password")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered")

    email = res["CodeDeliveryDetails"]["Destination"]

    logging.info("Sign up flow successful")
    return wrap_response(
        200,
        success=True,
        error=False,
        message=f"Sign up successful! A verification email has been sent to {email}",
    )


def confirm_sign_up(event) -> Response:
    logging.info("Starting confirm sign up flow")
    body = json.loads(event["body"] or "{}")

    try:
        if not body:
            raise KeyError("body")
        email = body.get("email")
        confirmation_code = body.get("confirmationCode")

        if not (email and confirmation_code):
            raise KeyError("email" if not email else "confirmation code")
    except KeyError as e:
        return wrap_exception(
            400,
            f"{e.args[0].title()} required to " f"confirm password reset but not provided",
        )

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=confirmation_code,
        )
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered")
    except (client.exceptions.CodeMismatchException, ParamValidationError):
        return wrap_exception(400, "Invalid confirmation code")
    except client.exceptions.NotAuthorizedException:
        return wrap_exception(400, "User has already been confirmed")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered")

    logging.info("Confirm sign up flow successful")
    return wrap_response(200, success=True, error=False, message="Your email has been verified!")


def sign_in(event) -> Response:
    logging.info("Starting sign in flow")
    body = json.loads(event["body"] or "{}")

    # Either username/password or refresh token required
    try:
        if not body:
            raise KeyError("body")
        email = body.get("email")
        password = body.get("password")
        refresh_token = body.get("refreshToken")

        if not ((email and password) or refresh_token):
            raise KeyError("email" if not email else "password")
    except KeyError as e:
        return wrap_exception(400, f"{e.args[0].title()} required for sign in but not provided")

    client: CognitoClient = boto3.client("cognito-idp")

    try:
        res = client.admin_initiate_auth(
            AuthFlow="REFRESH_TOKEN_AUTH" if refresh_token else "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters=(
                {"REFRESH_TOKEN": "refresh_token"}
                if refresh_token
                else {"USERNAME": email, "PASSWORD": password}
            ),
            ClientId=CLIENT_ID,
            UserPoolId=os.environ["user_pool_id"],
        )
        res = res["AuthenticationResult"]
    except client.exceptions.NotAuthorizedException as e:
        return wrap_exception(
            401,
            "Incorrect password or invalid refresh token",
            data={
                "refresh_token_expired": e.response["message"]
                in ("Refresh Token has been revoked", "Invalid Refresh Token")
            },
        )
    except client.exceptions.UserNotConfirmedException:
        return wrap_exception(403, "User is not confirmed")
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "User not found")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered")

    access_token = res.get("AccessToken")
    refresh_token = res.get("RefreshToken")
    id_token = res.get("IdToken")

    user = client.get_user(AccessToken=access_token)

    logging.info("Sign in flow successful")
    return wrap_response(
        200,
        success=True,
        error=False,
        message="You have been signed in",
        data={
            "accessToken": access_token,
            "idToken": id_token,
            "refreshToken": refresh_token,
            "user": user,
        },
    )


def resend_code(event) -> Response:
    logging.info("Starting resend code flow")
    body = json.loads(event["body"] or "{}")

    try:
        if not body:
            raise KeyError("body")
        email = body.get("email")

        if not email:
            raise KeyError("email")
    except KeyError as e:
        return wrap_exception(
            400, f"{e.args[0].title()} required to send password reset code but not provided"
        )

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.resend_confirmation_code(ClientId=CLIENT_ID, Username=email)
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered")
    except client.exceptions.InvalidParameterException:
        return wrap_exception(400, "User is already confirmed")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered")

    logging.info("Resend code flow successful")
    return wrap_response(
        200, success=True, error=False, message=f"A verification code has been sent to {email}"
    )


def forgot_password(event) -> Response:
    logging.info("Starting forgot password flow")
    body = json.loads(event["body"] or "{}")

    try:
        if not body:
            raise KeyError("body")
        email = body.get("email")

        if not email:
            raise KeyError("email")
    except KeyError as e:
        return wrap_exception(
            400, f"{e.args[0].title()} required to send password reset code but not provided"
        )

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.forgot_password(ClientId=CLIENT_ID, Username=email)
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered")
    except client.exceptions.InvalidParameterException:
        return wrap_exception(403, "User is not confirmed yet")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered")

    logging.info("Forgot password flow successful")
    return wrap_response(
        200, success=True, error=False, message=f"A password reset code has been sent to {email}"
    )


def confirm_forgot_password(event) -> Response:
    logging.info("Starting confirm forgot password flow")
    body = json.loads(event["body"] or "{}")

    try:
        if not body:
            raise KeyError("body")
        email = body.get("email")
        password = body.get("password")
        confirmation_code = body.get("confirmationCode")

        if not all([email, password, confirmation_code]):
            raise KeyError(
                "email" if not email else "password" if not password else "confirmation code"
            )
    except KeyError as e:
        return wrap_exception(
            400,
            f"{e.args[0].title()} required to " f"confirm password reset but not provided",
        )

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=confirmation_code,
            Password=password,
        )
    except ParamValidationError as e:
        report = e.kwargs["report"]
        if "Invalid type for parameter ConfirmationCode" in report:
            return wrap_exception(400, "Invalid confirmation code")
        elif "Invalid length for parameter Password" in report:
            return wrap_exception(400, "Invalid password")
        else:
            return wrap_exception(500, "Unexpected exception encountered")
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered")
    except client.exceptions.InvalidPasswordException:
        return wrap_exception(400, "Invalid password")
    except client.exceptions.CodeMismatchException:
        return wrap_exception(400, "Invalid confirmation code")
    except client.exceptions.NotAuthorizedException:
        return wrap_exception(400, "Password reset has already been confirmed")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered")

    logging.info("Confirm forgot password flow successful")
    return wrap_response(
        200, success=True, error=False, message="Your password has been successfully reset!"
    )


def handler(event, context) -> Response:
    logging.basicConfig(format="")
    logging.getLogger().setLevel(logging.INFO)
    logging.info(f"Environment:{os.environ}")

    query_params = event["queryStringParameters"]

    try:
        operation_string = query_params["operation"]
    except (KeyError, TypeError):
        message = "Error: Operation type not specified"
        logging.exception(message)
        res = wrap_response(400, error=True, success=False, message=message)
        return res

    try:
        operation = auth_operations[operation_string]
    except KeyError:
        message = f"Error: {operation_string} not one of {[*auth_operations]}"
        logging.exception(message)
        res = wrap_response(400, error=True, success=False, message=message)
    else:
        res = operation(event)

    return res


auth_operations = {
    "SIGN_UP": sign_up,
    "CONFIRM_SIGN_UP": confirm_sign_up,
    "SIGN_IN": sign_in,
    "RESEND_CODE": resend_code,
    "FORGOT_PASSWORD": forgot_password,
    "CONFIRM_FORGOT_PASSWORD": confirm_forgot_password,
}
