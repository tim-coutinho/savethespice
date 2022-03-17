import os
from collections import Callable

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from werkzeug.exceptions import MethodNotAllowed

from savethespice.lib.common import root_logger as logging
from savethespice.routes.auth import api as auth
from savethespice.routes.categories import api as categories
from savethespice.routes.recipes import api as recipes
from savethespice.routes.share import api as share
from savethespice.routes.shopping_list import api as shopping_list

app = FastAPI(
    title="SaveTheSpice",
    version="0.1.0",
    description="Recipe saver.",
    openapi_tags=[
        {"name": "auth", "description": "Authentication related operations."},
        {"name": "recipes", "description": "Recipe related operations."},
        {"name": "categories", "description": "Category related operations."},
        {"name": "shoppinglist", "description": "Shopping list related operations."},
    ],
)
app.include_router(auth)
app.include_router(categories)
app.include_router(recipes)
app.include_router(share)
app.include_router(shopping_list)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:5001",
        f"http://localhost:{os.environ['UVICORN_PORT']}",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)


@app.middleware("http")
async def add_user_id(req: Request, call_next: Callable):
    event = req.scope.get("aws.event")
    req.scope["USER_ID"] = (
        event["requestContext"].get("authorizer", {}).get("claims", {}).get("sub", "None")
        if event
        else "00000000-0000-0000-0000-000000000000"
    )
    return await call_next(req)


@app.exception_handler(Exception)
def base_exception_handler(req: Request, e: Exception):
    message = "Unexpected exception occured."
    logging.exception(message)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": message}
    )


@app.exception_handler(MethodNotAllowed)
def method_not_allowed_handler(req: Request, e: MethodNotAllowed):
    return JSONResponse(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        content={"message": "Unsupported HTTP method."},
    )


@app.exception_handler(NotImplementedError)
async def method_not_implemented_handler(req: Request, e: NotImplementedError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND, content={"message": "Method not implemented."}
    )


@app.exception_handler(AssertionError)
def assertion_error_handler(req: Request, e: AssertionError):
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": e.args[0]})


handler = Mangum(app)
