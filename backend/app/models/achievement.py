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


class AchievementCheckResult(BaseModel):
    novas_conquistas: list[dict]
    pontos_ganhos_total: int


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
