from fastapi import APIRouter, Depends
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.services.achievement_service import (
    get_user_achievements,
    get_user_achievement_progress,
    check_achievements,
)

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


@router.post("/check")
async def check_and_grant_achievements(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = check_achievements(supabase, user["id"])
    return result
