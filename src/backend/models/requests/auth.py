from flask_restx import Model
from flask_restx.fields import String

_email = {"email": String(required=True)}
_password = {"password": String(required=True)}
_confirmation_code = {"confirmationCode": String(required=True)}
_refresh_token = {"refreshToken": String(required=True)}

sign_up_model = Model("SignUp", {**_email, **_password})

confirm_sign_up_model = Model("ConfirmSignUp", _confirmation_code)

sign_in_model = sign_up_model.clone("SignIn")

refresh_id_token_model = Model("RefreshIdToken", _refresh_token)

resend_code_model = Model("ResendCode", _email)

forgot_password_model = Model("ForgotPassword", _email)

confirm_forgot_password_model = Model(
    "ConfirmForgotPassword", {**_email, **_password, **_confirmation_code}
)
