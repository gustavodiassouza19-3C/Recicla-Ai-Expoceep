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
    usuarios_result = supabase.table("usuarios").select("*").execute()
    users = usuarios_result.data

    total_usuarios = len(users)

    reciclagens_result = (
        supabase.table("reciclagens")
        .select("usuario_id, status")
        .eq("status", "validada")
        .execute()
    )
    validadas = reciclagens_result.data
    total_tags_validadas = len(validadas)

    usuarios_ids = set(u["id"] for u in users)
    for u in users:
        u["_tags_validadas"] = 0

    for r in validadas:
        uid = r.get("usuario_id")
        if uid in usuarios_ids:
            for u in users:
                if u["id"] == uid:
                    u["_tags_validadas"] += 1
                    break

    sexo_count = {"masculino": 0, "feminino": 0, "outro": 0, "nao_informado": 0}
    for u in users:
        s = (u.get("sexo") or "").lower()
        if s == "masculino":
            sexo_count["masculino"] += u["_tags_validadas"]
        elif s == "feminino":
            sexo_count["feminino"] += u["_tags_validadas"]
        elif s == "outro":
            sexo_count["outro"] += u["_tags_validadas"]
        else:
            sexo_count["nao_informado"] += u["_tags_validadas"]

    age_ranges = {"18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0}
    for u in users:
        idade = u.get("idade")
        if idade:
            if 18 <= idade <= 25:
                age_ranges["18-25"] += u["_tags_validadas"]
            elif 26 <= idade <= 35:
                age_ranges["26-35"] += u["_tags_validadas"]
            elif 36 <= idade <= 45:
                age_ranges["36-45"] += u["_tags_validadas"]
            elif 46 <= idade <= 55:
                age_ranges["46-55"] += u["_tags_validadas"]
            elif idade >= 56:
                age_ranges["56+"] += u["_tags_validadas"]

    total_pontos = sum(u.get("pontos", 0) for u in users)

    return {
        "total_usuarios": total_usuarios,
        "total_tags_validadas": total_tags_validadas,
        "total_pontos": total_pontos,
        "por_sexo": sexo_count,
        "por_faixa_etaria": age_ranges,
    }


@router.get("/users/tags")
async def get_users_tags(
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

    usuarios_ids = set(u["id"] for u in (result.data or []))
    reciclagens_result = (
        supabase.table("reciclagens")
        .select("usuario_id")
        .eq("status", "validada")
        .in_("usuario_id", list(usuarios_ids))
        .execute()
    )

    tags_count: dict[int, int] = {}
    for r in reciclagens_result.data:
        uid = r.get("usuario_id")
        tags_count[uid] = tags_count.get(uid, 0) + 1

    for u in result.data:
        u["tags_validadas"] = tags_count.get(u["id"], 0)

    return {
        "data": result.data,
        "total": total_result.count,
        "page": page,
        "limit": limit,
    }
