from pydantic import BaseModel


class DBItem(BaseModel):
    createTime: str
    updateTime: str
