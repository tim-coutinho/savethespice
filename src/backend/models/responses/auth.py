from flask_restx.fields import Boolean, String

from models.common import _make_response_data_model

refresh_id_token_response_data, refresh_id_token_response_model = _make_response_data_model(
    "RefreshIdToken",
    {"idToken": String(), "user": String(), "refreshTokenExpired": Boolean()},
    skip_none=True,
)

sign_in_token_response_data, sign_in_token_response_model = _make_response_data_model(
    "SignIn", {"idToken": String(), "user": String(), "refreshToken": String()}, skip_none=True
)
