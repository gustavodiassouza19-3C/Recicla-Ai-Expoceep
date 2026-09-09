from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    nome: str
    email: str
    cpf: Optional[str] = None
    tipo: Optional[str] = "cidadao"


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    cpf: Optional[str] = None
    tipo: str
    criado_em: Optional[str] = None
    pontos: int = 0
