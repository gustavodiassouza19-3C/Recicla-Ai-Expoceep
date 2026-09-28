from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    nome: str
    email: str
    senha: str = ""
    cpf: Optional[str] = None
    sexo: Optional[str] = None
    idade: Optional[int] = None


class UserUpdate(BaseModel):
    nome: Optional[str] = None
    cpf: Optional[str] = None
    sexo: Optional[str] = None
    idade: Optional[int] = None
    household_size: Optional[int] = None


class AdminCreate(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    email: str = Field(min_length=5, max_length=255)
    senha: str = Field(min_length=8, max_length=72)


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    cpf: Optional[str] = None
    sexo: Optional[str] = None
    idade: Optional[int] = None
    tipo: str
    criado_em: Optional[str] = None
    pontos: int = 0
    household_size: int = 1
