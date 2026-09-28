from pydantic import BaseModel
from typing import Optional


class TagCreate(BaseModel):
    codigo_nfc: str
    status: Optional[str] = "disponivel"


class TagResponse(BaseModel):
    id: int
    codigo_nfc: str
    status: str


class TagValidate(BaseModel):
    tag_code: str
