import logging
from collections import Iterable, Iterator
from itertools import zip_longest
from logging.config import dictConfig
from pprint import pformat as pformat_
from typing import TypeVar

from savethespice.lib.config import logging_config

dictConfig(logging_config)
root_logger = logging.getLogger("SaveTheSpice")
root_logger.setLevel(logging.INFO)

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
#     return ResponseData(message="The token's signature has expired"), 400
# except JWTError:
#     return ResponseData(message="The token's signature is invalid"), 400


def pformat(obj: object) -> str:
    return pformat_(obj, indent=2, width=100)


T = TypeVar("T")


def chunks(iterable: Iterable[T], batch_size: int = 10) -> Iterator[T]:
    """
    Break an iterable up into chunks of `batch_size` size.
    """
    return zip_longest(*[iter(iterable)] * batch_size)
