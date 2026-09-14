import math
from fastapi import APIRouter, Depends, Query
from supabase import Client
from app.database import get_supabase
from app.models.eco_point import EcoPointCreate, EcoPointResponse, EcoPointNearby

router = APIRouter(prefix="/api/eco-points", tags=["eco-points"])


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("", response_model=list[EcoPointResponse])
async def list_eco_points(supabase: Client = Depends(get_supabase)):
    result = supabase.table("eco_pontos").select("*").order("nome").execute()
    return result.data


@router.get("/nearby", response_model=list[EcoPointNearby])
async def nearby_eco_points(
    lat: float = Query(...),
    lng: float = Query(...),
    limit: int = Query(10, ge=1, le=50),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("eco_pontos").select("*").execute()
    points = []
    for p in result.data:
        dist = _haversine(lat, lng, p["lat"], p["lng"])
        points.append({**p, "distance_km": round(dist, 2)})
    points.sort(key=lambda x: x["distance_km"])
    return points[:limit]


@router.post("", response_model=EcoPointResponse)
async def create_eco_point(
    data: EcoPointCreate,
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("eco_pontos")
        .insert(
            {
                "nome": data.name,
                "endereco": data.address,
                "lat": data.lat,
                "lng": data.lng,
            }
        )
        .execute()
    )
    return result.data[0]
