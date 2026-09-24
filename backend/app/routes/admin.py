from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
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

    count_query = supabase.table("usuarios").select("*", count="exact")
    if sexo:
        count_query = count_query.eq("sexo", sexo)
    if idade_min is not None:
        count_query = count_query.gte("idade", idade_min)
    if idade_max is not None:
        count_query = count_query.lte("idade", idade_max)

    query = query.range((page - 1) * limit, page * limit - 1)
    result = query.execute()
    total_result = count_query.execute()

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
        .select("usuario_id")
        .eq("status", "validada")
        .execute()
    )
    validadas = reciclagens_result.data
    total_tags_validadas = len(validadas)

    tags_by_user: dict = {}
    for r in validadas:
        uid = r.get("usuario_id")
        tags_by_user[uid] = tags_by_user.get(uid, 0) + 1

    sexo_count = {"masculino": 0, "feminino": 0, "outro": 0, "nao_informado": 0}
    age_ranges = {"18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0}
    total_pontos = 0

    for u in users:
        n = tags_by_user.get(u["id"], 0)
        s = (u.get("sexo") or "").lower()
        if s in ("masculino", "feminino", "outro"):
            sexo_count[s] += n
        else:
            sexo_count["nao_informado"] += n

        idade = u.get("idade")
        if idade:
            if 18 <= idade <= 25:
                age_ranges["18-25"] += n
            elif 26 <= idade <= 35:
                age_ranges["26-35"] += n
            elif 36 <= idade <= 45:
                age_ranges["36-45"] += n
            elif 46 <= idade <= 55:
                age_ranges["46-55"] += n
            elif idade >= 56:
                age_ranges["56+"] += n

        total_pontos += u.get("pontos", 0)

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

    count_query = supabase.table("usuarios").select("*", count="exact")
    if sexo:
        count_query = count_query.eq("sexo", sexo)
    if idade_min is not None:
        count_query = count_query.gte("idade", idade_min)
    if idade_max is not None:
        count_query = count_query.lte("idade", idade_max)

    result = query.execute()
    total_result = count_query.execute()

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


@router.post("/validate-tag")
async def validate_tag(
    payload: dict,
    supabase: Client = Depends(get_supabase),
):
    """Valida a tag: confirma reciclagens em aberto e devolve a tag ao usuario (status ativa)."""
    codigo = payload.get("codigo_nfc", "").strip().upper()
    if not codigo:
        raise HTTPException(status_code=400, detail="codigo_nfc e obrigatorio")

    result = (
        supabase.table("tags")
        .select("*")
        .eq("codigo_nfc", codigo)
        .execute()
    )

    if not result.data:
        return {"valid": False, "message": "Tag nao encontrada"}

    tag = result.data[0]

    reciclagens = (
        supabase.table("reciclagens")
        .select("id, status")
        .eq("tag_id", tag["id"])
        .neq("status", "validada")
        .execute()
    )
    now = datetime.now(timezone.utc).isoformat()
    for r in reciclagens.data or []:
        supabase.table("reciclagens").update(
            {
                "status": "validada",
                "data_confirmacao": now,
            }
        ).eq("id", r["id"]).execute()

    if tag.get("status") != "ativa":
        supabase.table("tags").update({"status": "ativa"}).eq("id", tag["id"]).execute()
        tag["status"] = "ativa"

    return {
        "valid": True,
        "tag": tag,
        "message": "Tag validada e liberada do usuario",
        "reciclagens_validadas": len(reciclagens.data or []),
    }
