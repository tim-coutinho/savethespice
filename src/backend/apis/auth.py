from flask import request
from flask_restx import Namespace, Resource

from core.auth import (
    confirm_forgot_password,
    confirm_sign_up,
    forgot_password,
    refresh_id_token,
    resend_code,
    sign_in,
    sign_up,
)
from models import (
    confirm_forgot_password_model,
    confirm_sign_up_model,
    default_response_model,
    forgot_password_model,
    refresh_id_token_model,
    refresh_id_token_response_model,
    register_auth_request_models,
    register_auth_response_models,
    resend_code_model,
    sign_in_model,
    sign_in_token_response_model,
    sign_up_model,
)

api = Namespace("auth", description="Auth related operations.")
register_auth_request_models(api)
register_auth_response_models(api)


@api.route("/signup")
class SignUp(Resource):
    @api.expect(sign_up_model)
    @api.marshal_with(default_response_model, skip_none=True)
    def post(self):
        """Sign up using email and password, sending a confirmation code to the email."""
        body = request.json
        return sign_up(body)


@api.route("/confirmsignup")
class ConfirmSignUp(Resource):
    @api.expect(confirm_sign_up_model)
    @api.marshal_with(default_response_model, skip_none=True)
    def post(self):
        """Confirm sign up using a confirmation code."""
        body = request.json
        return confirm_sign_up(body)


@api.route("/signin")
class SignIn(Resource):
    @api.expect(sign_in_model)
    @api.marshal_with(sign_in_token_response_model)
    def post(self):
        """
        Sign in using email and password, returning an id token, refresh token, and user string.
        """
        body = request.json
        return sign_in(body)


@api.route("/refreshidtoken")
class RefreshIdToken(Resource):
    @api.expect(refresh_id_token_model)
    @api.marshal_with(refresh_id_token_response_model)
    def post(self):
        """
        Refresh a user's ID token using a refresh token, returning an id token and user string.
        """
        body = request.json
        return refresh_id_token(body)


@api.route("/resendcode")
class ResendCode(Resource):
    @api.expect(resend_code_model)
    @api.marshal_with(default_response_model, skip_none=True)
    def post(self):
        """Resend a confirmation code to a user's email."""
        body = request.json
        return resend_code(body)


@api.route("/forgotpassword")
class ForgotPassword(Resource):
    @api.expect(forgot_password_model)
    @api.marshal_with(default_response_model, skip_none=True)
    def post(self):
        """Send a forgot password email to a user."""
        body = request.json
        return forgot_password(body)


@api.route("/confirmforgotpassword")
class ConfirmForgotPassword(Resource):
    @api.expect(confirm_forgot_password_model)
    @api.marshal_with(default_response_model, skip_none=True)
    def post(self):
        """Reset a user's password using a confirmation code and a new password."""
        body = request.json
        return confirm_forgot_password(body)
