from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.models.tag import TagCreate, TagResponse

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("/{codigo}", response_model=TagResponse)
async def get_tag(codigo: str, supabase: Client = Depends(get_supabase)):
    result = (
        supabase.table("tags")
        .select("*")
        .eq("codigo_nfc", codigo)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Tag nao encontrada")
    return result.data[0]


@router.post("", response_model=TagResponse)
async def create_tag(
    data: TagCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tag_data = {
        "codigo_nfc": data.codigo_nfc,
        "status": data.status or "ativa",
    }
    result = supabase.table("tags").insert(tag_data).execute()
    return result.data[0]
