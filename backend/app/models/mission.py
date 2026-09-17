from pydantic import BaseModel
from typing import Optional


class MissionCreate(BaseModel):
    titulo: str
    descricao: str
    meta: int
    recompensa_pontos: int


class MissionResponse(BaseModel):
    id: int
    titulo: str
    descricao: str
    meta: int
    recompensa_pontos: int
    ativa: bool = True
    criado_em: Optional[str] = None


class UserMissionResponse(BaseModel):
    mission: MissionResponse
    progress: int
    completed: bool
