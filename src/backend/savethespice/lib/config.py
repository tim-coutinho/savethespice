from pydantic import BaseSettings


class Environment(BaseSettings):
    client_id: str
    user_pool_id: str
    recipes_table_name: str
    categories_table_name: str
    meta_table_name: str
    images_bucket_name: str


environment = Environment()

logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s %(asctime)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
    },
    "loggers": {
        "SaveTheSpice": {"handlers": ["default"], "level": "INFO"},
    },
}
