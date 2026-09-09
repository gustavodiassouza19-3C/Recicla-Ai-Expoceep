from pydantic import BaseModel
from typing import Optional


class EcoPointCreate(BaseModel):
    name: str
    address: str
    lat: float
    lng: float


class EcoPointResponse(BaseModel):
    id: int
    name: str
    address: str
    lat: float
    lng: float
    created_at: Optional[str] = None


class EcoPointNearby(EcoPointResponse):
    distance_km: float
