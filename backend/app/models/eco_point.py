from pydantic import BaseModel
from typing import Optional


class EcoPointCreate(BaseModel):
    nome: str
    endereco: str
    lat: float
    lng: float


class EcoPointResponse(BaseModel):
    id: int
    nome: str
    endereco: str
    lat: float
    lng: float
    status: Optional[str] = None
    criado_em: Optional[str] = None


class EcoPointNearby(EcoPointResponse):
    distance_km: float
