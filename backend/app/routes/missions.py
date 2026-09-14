from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.models.mission import MissionResponse, UserMissionResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.get("", response_model=list[MissionResponse])
async def list_missions(supabase: Client = Depends(get_supabase)):
    result = (
        supabase.table("missoes")
        .select("*")
        .eq("ativa", True)
        .order("id")
        .execute()
    )
    return result.data


@router.get("/me", response_model=list[UserMissionResponse])
async def my_missions(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    missoes = (
        supabase.table("missoes")
        .select("*")
        .eq("ativa", True)
        .order("id")
        .execute()
    )

    user_progress = (
        supabase.table("missoes_usuario")
        .select("*")
        .eq("usuario_id", user["id"])
        .execute()
    )
    progress_map = {p["missao_id"]: p for p in user_progress.data}

    result = []
    for m in missoes.data:
        prog = progress_map.get(m["id"])
        result.append(
            {
                "mission": m,
                "progress": prog["progresso"] if prog else 0,
                "completed": prog["concluida"] if prog else False,
            }
        )
    return result


@router.post("/{mission_id}/complete")
async def complete_mission(
    mission_id: int,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    missao = (
        supabase.table("missoes")
        .select("*")
        .eq("id", mission_id)
        .eq("ativa", True)
        .execute()
    )
    if not missao.data:
        raise HTTPException(status_code=404, detail="Missao nao encontrada")

    existing = (
        supabase.table("missoes_usuario")
        .select("*")
        .eq("usuario_id", user["id"])
        .eq("missao_id", mission_id)
        .execute()
    )

    if existing.data and existing.data[0]["concluida"]:
        raise HTTPException(status_code=400, detail="Missao ja concluida")

    if existing.data:
        supabase.table("missoes_usuario").update(
            {
                "concluida": True,
                "concluida_em": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", existing.data[0]["id"]).execute()
    else:
        supabase.table("missoes_usuario").insert(
            {
                "usuario_id": user["id"],
                "missao_id": mission_id,
                "progresso": missao.data[0]["meta"],
                "concluida": True,
                "concluida_em": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()

    reward = missao.data[0]["recompensa_pontos"]
    supabase.table("recompensas").insert(
        {
            "reciclagem_id": 0,
            "tipo": "missao",
            "valor": reward,
            "status": "liberada",
        }
    ).execute()

    return {"success": True, "message": "Missao concluida!", "pontos_ganhos": reward}
