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


@router.post("", response_model=RecyclingValidate)
async def register_recycling(
    data: RecyclingCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tag = validate_tag_code(supabase, data.tag_code)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag invalida ou inativa")

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
