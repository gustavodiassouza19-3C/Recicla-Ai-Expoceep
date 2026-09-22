from typing import Optional

from fastapi import APIRouter, Depends, Query
from supabase import Client
from app.database import get_supabase
from app.models.user import UserCreate, UserResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
async def get_users(
    sexo: Optional[str] = Query(None),
    idade_min: Optional[int] = Query(None),
    idade_max: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("usuarios").select("*").order("criado_em", desc=True)

    if sexo:
        query = query.eq("sexo", sexo)
    if idade_min is not None:
        query = query.gte("idade", idade_min)
    if idade_max is not None:
        query = query.lte("idade", idade_max)

    query = query.range((page - 1) * limit, page * limit - 1)
    result = query.execute()

    total_result = supabase.table("usuarios").select("*", count="exact").execute()

    return {
        "data": result.data,
        "total": total_result.count,
        "page": page,
        "limit": limit,
    }


@router.get("/stats")
async def get_stats(
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("usuarios").select("*").execute()
    users = result.data

    total = len(users)

    sexo_count = {"masculino": 0, "feminino": 0, "outro": 0, "nao_informado": 0}
    for u in users:
        s = (u.get("sexo") or "").lower()
        if s == "masculino":
            sexo_count["masculino"] += 1
        elif s == "feminino":
            sexo_count["feminino"] += 1
        elif s == "outro":
            sexo_count["outro"] += 1
        else:
            sexo_count["nao_informado"] += 1

    age_ranges = {"18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0}
    for u in users:
        idade = u.get("idade")
        if idade:
            if 18 <= idade <= 25:
                age_ranges["18-25"] += 1
            elif 26 <= idade <= 35:
                age_ranges["26-35"] += 1
            elif 36 <= idade <= 45:
                age_ranges["36-45"] += 1
            elif 46 <= idade <= 55:
                age_ranges["46-55"] += 1
            elif idade >= 56:
                age_ranges["56+"] += 1

    total_pontos = sum(u.get("pontos", 0) for u in users)

    return {
        "total_usuarios": total,
        "total_pontos": total_pontos,
        "por_sexo": sexo_count,
        "por_faixa_etaria": age_ranges,
    }

