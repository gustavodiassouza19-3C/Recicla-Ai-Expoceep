from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.models.recycling import RecyclingCreate, RecyclingValidate
from app.services.tag_service import validate_tag_code
from app.services.points_service import get_user_points
from app.services.achievement_service import check_achievements
from datetime import datetime, timezone

router = APIRouter(prefix="/api/recycle", tags=["recycling"])

PONTOS_POR_RECICLAGEM = 10
LIMITE_MENSAL = 5


def _count_monthly_recycles(supabase: Client, usuario_id: int) -> int:
    now = datetime.now(timezone.utc)
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .gte("data_entrega", start.isoformat())
        .execute()
    )
    return result.count or 0


@router.post("", response_model=RecyclingValidate)
async def register_recycling(
    data: RecyclingCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tag = validate_tag_code(supabase, data.tag_code)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag invalida ou inativa")

    monthly_count = _count_monthly_recycles(supabase, user["id"])
    if monthly_count >= LIMITE_MENSAL:
        raise HTTPException(
            status_code=429,
            detail=f"Limite mensal de {LIMITE_MENSAL} reciclagens atingido",
        )

    supabase.table("tags").update({"status": "em_uso"}).eq("id", tag["id"]).execute()

    recycling_data = {
        "usuario_id": user["id"],
        "tag_id": tag["id"],
        "data_entrega": datetime.now(timezone.utc).isoformat(),
        "status": "registrada",
    }
    result = supabase.table("reciclagens").insert(recycling_data).execute()
    reciclagem_id = result.data[0]["id"]

    supabase.table("recompensas").insert(
        {
            "reciclagem_id": reciclagem_id,
            "tipo": "pontos",
            "valor": PONTOS_POR_RECICLAGEM,
            "status": "liberada",
        }
    ).execute()

    supabase.table("tags").update({"status": "ativa"}).eq("id", tag["id"]).execute()

    novo_total = get_user_points(supabase, user["id"])
    achievement_result = check_achievements(supabase, user["id"])

    return RecyclingValidate(
        success=True,
        pontos_ganhos=PONTOS_POR_RECICLAGEM,
        novo_total=novo_total,
        message="Reciclagem registrada com sucesso!",
        conquistas_novas=achievement_result["novas_conquistas"],
        pontos_conquistas=achievement_result["pontos_ganhos_total"],
    )


@router.get("/history")
async def get_history(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("reciclagens")
        .select("*, tags(codigo_nfc, status)")
        .eq("usuario_id", user["id"])
        .order("data_entrega", desc=True)
        .limit(50)
        .execute()
    )
    return result.data


@router.get("/score-history")
async def get_score_history(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", user["id"])
        .order("data_entrega", asc=True)
        .execute()
    )

    monthly: dict[str, int] = {}
    for entry in result.data:
        dt = datetime.fromisoformat(entry["data_entrega"].replace("Z", "+00:00"))
        key = dt.strftime("%b")
        monthly[key] = monthly.get(key, 0) + PONTOS_POR_RECICLAGEM

    month_order = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    return [{"month": m, "score": monthly.get(m, 0)} for m in month_order if monthly.get(m, 0) > 0]


@router.get("/impact")
async def get_impact(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", user["id"])
        .eq("status", "validada")
        .execute()
    )
    count = result.count or 0
    trees = round(count * 0.004, 4)
    water = count * 8
    return {"validated_count": count, "trees": trees, "water_liters": water}
