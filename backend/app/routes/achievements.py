from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.services.achievement_service import (
    get_user_achievements,
    get_user_achievement_progress,
    get_pending_achievements,
    check_achievements,
)
from app.services.points_service import claim_achievement_points

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


@router.get("/user")
async def list_user_achievements(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    achievements = get_user_achievements(supabase, user["id"])
    return {"achievements": achievements}


@router.get("/progress")
async def get_achievements_progress(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    progress = get_user_achievement_progress(supabase, user["id"])
    return {"progress": progress}


@router.get("/pending")
async def list_pending_achievements(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    pending = get_pending_achievements(supabase, user["id"])
    return {"pending": pending, "count": len(pending)}


@router.post("/check")
async def check_and_grant_achievements(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = check_achievements(supabase, user["id"])
    pending = get_pending_achievements(supabase, user["id"])
    result["pending"] = pending
    result["pending_count"] = len(pending)
    return result


@router.post("/{codigo}/claim")
async def claim_achievement(
    codigo: str,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    try:
        claimed = claim_achievement_points(supabase, user["id"], codigo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    pending = get_pending_achievements(supabase, user["id"])
    return {
        "success": True,
        "claimed": claimed,
        "pending": pending,
        "pending_count": len(pending),
    }


@router.post("/claim-all")
async def claim_all_achievements(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    pending = get_pending_achievements(supabase, user["id"])
    if not pending:
        return {
            "success": True,
            "claimed": [],
            "pontos_ganhos": 0,
            "pending": [],
            "pending_count": 0,
        }

    claimed = []
    pontos_ganhos = 0
    errors = []
    for item in pending:
        try:
            result = claim_achievement_points(
                supabase, user["id"], item["codigo"]
            )
            claimed.append(result)
            pontos_ganhos += result["pontos"]
        except ValueError as e:
            errors.append({"codigo": item["codigo"], "erro": str(e)})

    remaining = get_pending_achievements(supabase, user["id"])
    return {
        "success": True,
        "claimed": claimed,
        "pontos_ganhos": pontos_ganhos,
        "errors": errors,
        "pending": remaining,
        "pending_count": len(remaining),
    }
