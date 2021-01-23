import logging
import os

import boto3

from common import wrap_response

# jwks = requests.get(
#     f"https://cognito-idp.{os.environ['AWS_REGION']}.amazonaws.com"
#     f"/{USER_POOL_ID}/.well-known/jwks.json"
# ).json()
#
# try:
#     id_token = jwt.decode(
#         res["IdToken"], key=jwks, access_token=res["AccessToken"], audience=CLIENT_ID
#     )
# except ExpiredSignatureError:
#     return wrap_exception(400, "The token's signature has expired")
# except JWTError:
#     return wrap_exception(400, "The token's signature is invalid")


def handler(event, context):
    logging.getLogger().setLevel(logging.INFO)
    logging.info(f"Event: {event}\nContext: {context}\nEnvironment: {os.environ}")
    dynamodb = boto3.resource("dynamodb").Table(os.environ["recipes_table_name"])
    return wrap_response(200, error=False, success=True, message="Success!")
