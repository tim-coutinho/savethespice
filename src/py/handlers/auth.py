import json
import os
from math import floor
from time import time
from typing import Final

import boto3
from boto3_type_annotations.cognito_idp import Client as CognitoClient
from boto3_type_annotations.dynamodb import Table
from botocore.exceptions import ParamValidationError

from common import Response, Serializable
from common import logger as logging
from common import pformat_ as pformat
from common import verify_parameters, wrap_exception, wrap_response

CLIENT_ID: Final[str] = os.environ["client_id"]
USER_POOL_ID: Final[str] = os.environ["user_pool_id"]

event: Serializable


def sign_up() -> Response:
    logging.info("Starting sign up flow.")
    body = json.loads(event["body"] or "{}")
    email, password = verify_parameters(body, "email", "password")

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        res = client.sign_up(ClientId=CLIENT_ID, Username=email, Password=password)
        logging.info(f"Sign up response:\n{pformat(res)}")
    except client.exceptions.UsernameExistsException:
        return wrap_exception(409, "This email is already registered.")
    except (client.exceptions.InvalidPasswordException, ParamValidationError):
        return wrap_exception(message="Invalid password.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    meta_table: Table = boto3.resource("dynamodb").Table(os.environ["recipes_table_name"])

    meta_table.put_item(
        Item={
            "userId": res["UserSub"],
            "signUpTime": floor(time() * 1000),
        }
    )

    logging.info("Sign up flow successful.")
    return wrap_response(
        200,
        success=True,
        error=False,
        message=f"Sign up successful! A verification email has been sent to {email}.",
    )


def confirm_sign_up() -> Response:
    logging.info("Starting confirm sign up flow.")
    body = json.loads(event["body"] or "{}")
    email, confirmation_code = verify_parameters(body, "email", "confirmationCode")

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=confirmation_code,
        )
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered.")
    except (client.exceptions.CodeMismatchException, ParamValidationError):
        return wrap_exception(message="Invalid confirmation code.")
    except client.exceptions.NotAuthorizedException:
        return wrap_exception(message="User has already been verified.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    logging.info("Confirm sign up flow successful.")
    return wrap_response(200, success=True, error=False, message="Your email has been verified!")


def sign_in() -> Response:
    logging.info("Starting sign in flow.")
    body = json.loads(event["body"] or "{}")
    email, password = verify_parameters(body, "email", "password")

    client: CognitoClient = boto3.client("cognito-idp")

    try:
        res = client.admin_initiate_auth(
            AuthFlow="ADMIN_USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": email, "PASSWORD": password},
            ClientId=CLIENT_ID,
            UserPoolId=USER_POOL_ID,
        )
    except client.exceptions.NotAuthorizedException:
        return wrap_exception(
            401,
            "Incorrect password.",
        )
    except client.exceptions.UserNotConfirmedException:
        return wrap_exception(403, "User is not verified.")
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    res = res["AuthenticationResult"]
    access_token = res.get("AccessToken")
    refresh_token = res.get("RefreshToken")
    id_token = res.get("IdToken")

    user = client.get_user(AccessToken=access_token).get("Username")

    logging.info("Sign in flow successful.")
    return wrap_response(
        200,
        success=True,
        error=False,
        message="You have been signed in.",
        data={
            "idToken": id_token,
            "refreshToken": refresh_token,
            "user": user,
        },
    )


def refresh_id_token() -> Response:
    logging.info("Starting refresh ID token flow.")
    body = json.loads(event["body"] or "{}")
    (refresh_token,) = verify_parameters(body, "refreshToken")

    client: CognitoClient = boto3.client("cognito-idp")

    try:
        res = client.admin_initiate_auth(
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters=({"REFRESH_TOKEN": refresh_token}),
            ClientId=CLIENT_ID,
            UserPoolId=USER_POOL_ID,
        )
    except client.exceptions.NotAuthorizedException:
        return wrap_exception(
            401,
            "Invalid refresh token.",
            data={"refreshTokenExpired": True},
        )
    except client.exceptions.UserNotConfirmedException:
        return wrap_exception(403, "User is not verified.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    res = res["AuthenticationResult"]
    access_token = res.get("AccessToken")
    id_token = res.get("IdToken")

    user = client.get_user(AccessToken=access_token).get("Username")

    logging.info("Refresh ID token flow successful.")
    return wrap_response(
        200,
        success=True,
        error=False,
        message="You have been signed in.",
        data={
            "idToken": id_token,
            "user": user,
        },
    )


def resend_code() -> Response:
    logging.info("Starting resend code flow.")
    body = json.loads(event["body"] or "{}")
    (email,) = verify_parameters(body, "email")

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.resend_confirmation_code(ClientId=CLIENT_ID, Username=email)
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered.")
    except client.exceptions.InvalidParameterException:
        return wrap_exception(message="User is already verified.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    logging.info("Resend code flow successful.")
    return wrap_response(
        200, success=True, error=False, message=f"A verification code has been sent to {email}."
    )


def forgot_password() -> Response:
    logging.info("Starting forgot password flow.")
    body = json.loads(event["body"] or "{}")
    (email,) = verify_parameters(body, "email")

    client: CognitoClient = boto3.client("cognito-idp")
    try:
        client.forgot_password(ClientId=CLIENT_ID, Username=email)
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered.")
    except client.exceptions.InvalidParameterException:
        return wrap_exception(403, "User is not verified yet.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    logging.info("Forgot password flow successful.")
    return wrap_response(
        200, success=True, error=False, message=f"A password reset code has been sent to {email}."
    )


def confirm_forgot_password() -> Response:
    logging.info("Starting confirm forgot password flow.")
    body = json.loads(event["body"] or "{}")
    email, password, confirmation_code = verify_parameters(
        body, "email", "password", "confirmationCode"
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
            return wrap_exception(message="Invalid confirmation code.")
        elif "Invalid length for parameter Password" in report:
            return wrap_exception(message="Invalid password.")
        else:
            return wrap_exception(500, "Unexpected exception encountered.")
    except client.exceptions.UserNotFoundException:
        return wrap_exception(404, "This email is not registered.")
    except client.exceptions.InvalidPasswordException:
        return wrap_exception(message="Invalid password.")
    except client.exceptions.CodeMismatchException:
        return wrap_exception(message="Invalid confirmation code.")
    except client.exceptions.NotAuthorizedException:
        return wrap_exception(message="Password reset has already been confirmed.")
    except Exception:
        return wrap_exception(500, "Unexpected exception encountered.")

    logging.info("Confirm forgot password flow successful.")
    return wrap_response(
        200, success=True, error=False, message="Your password has been successfully reset!"
    )


def handler(e: Serializable, _) -> Response:
    global event
    event = e

    logging.info(
        "\n".join(
            (
                "\nEvent:",
                pformat(event),
                "Environment:",
                pformat(dict(os.environ)),
            )
        )
    )

    valid_operations = {
        "SIGN_UP": sign_up,
        "CONFIRM_SIGN_UP": confirm_sign_up,
        "SIGN_IN": sign_in,
        "REFRESH_ID_TOKEN": refresh_id_token,
        "RESEND_CODE": resend_code,
        "FORGOT_PASSWORD": forgot_password,
        "CONFIRM_FORGOT_PASSWORD": confirm_forgot_password,
    }

    query_params = event["queryStringParameters"]
    try:
        operation_string = query_params["operation"]
    except (KeyError, TypeError):
        return wrap_exception(message="Error: Operation type not specified.")

    try:
        operation = valid_operations[operation_string]
    except KeyError:
        res = wrap_exception(message=f"Error: {operation_string} not one of {[*valid_operations]}")
    else:
        try:
            res = operation()
        except AssertionError as e:
            res = wrap_exception(message=e.args[0])

    return res
