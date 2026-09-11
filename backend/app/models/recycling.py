from pydantic import BaseModel
from typing import Optional


class RecyclingCreate(BaseModel):
    tag_code: str


class RecyclingResponse(BaseModel):
    id: int
    usuario_id: int
    tag_id: int
    funcionario_id: Optional[int] = None
    data_entrega: Optional[str] = None
    status: str
    data_confirmacao: Optional[str] = None


class RecyclingValidate(BaseModel):
    success: bool
    pontos_ganhos: int
    novo_total: int
    message: str
    conquistas_novas: list[dict] = []
    pontos_conquistas: int = 0
