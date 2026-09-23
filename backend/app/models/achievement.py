from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AchievementBase(BaseModel):
    codigo: str
    nome: str
    descricao: str
    icone: str
    pontos: int
    categoria: str


class AchievementResponse(AchievementBase):
    id: int
    condicao_tipo: str
    condicao_valor: int
    ativa: bool = True


class UserAchievementResponse(BaseModel):
    id: int
    conquista_codigo: str
    conquista_nome: str
    conquista_descricao: str
    conquista_icone: str
    pontos_ganhos: int
    concedida_em: str
    resgatada_em: Optional[str] = None


class AchievementCheckResult(BaseModel):
    novas_conquistas: list[dict]
    pontos_ganhos_total: int
    pending: list[dict] = []
    pending_count: int = 0


class PendingAchievement(BaseModel):
    usuario_conquista_id: int
    codigo: str
    nome: str
    descricao: str
    icone: str
    pontos: int
    categoria: Optional[str] = None
    concedida_em: Optional[str] = None


class AchievementClaimResult(BaseModel):
    success: bool
    claimed: dict
    pending: list[dict]
    pending_count: int


class AchievementClaimAllResult(BaseModel):
    success: bool
    claimed: list[dict]
    pontos_ganhos: int
    errors: list[dict] = []
    pending: list[dict]
    pending_count: int


class AchievementProgress(BaseModel):
    conquista_codigo: str
    conquista_nome: str
    conquista_descricao: str
    conquista_icone: str
    conquista_pontos: int
    conquista_categoria: str
    condicao_tipo: str
    condicao_valor: int
    progresso_atual: int
    desbloqueada: bool
    data_concessao: Optional[str] = None
    resgatada: bool = False
    pendente_resgate: bool = False
