from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user, get_staff_user
from app.models.tag import TagCreate, TagResponse

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("")
async def list_tags_catalog(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # Inventario completo das tags, para a pagina Sobre. Precisa da service key:
    # a RLS tags_select_available esconde tudo que nao for 'disponivel', que e
    # justamente o que a lista precisa mostrar. Devolve so codigo e status --
    # nenhum dado de usuario.
    result = (
        supabase.table("tags")
        .select("id,codigo_nfc,status")
        .order("codigo_nfc")
        .execute()
    )
    return result.data or []


@router.get("/me")
async def my_tags(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("reciclagens")
        .select("tag_id, tags(id, codigo_nfc, status), data_entrega")
        .eq("usuario_id", user["id"])
        .order("data_entrega", desc=True)
        .execute()
    )

    seen = set()
    tags = []
    for entry in result.data:
        tag = entry.get("tags")
        if tag and tag["id"] not in seen:
            seen.add(tag["id"])
            tags.append(
                {
                    "id": tag["id"],
                    "codigo_nfc": tag["codigo_nfc"],
                    "status": tag["status"],
                    "last_used": entry["data_entrega"],
                }
            )
    return tags


@router.get("/{codigo}", response_model=TagResponse)
async def get_tag(codigo: str, user=Depends(get_current_user), supabase: Client = Depends(get_supabase)):
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
    staff=Depends(get_staff_user),
    supabase: Client = Depends(get_supabase),
):
    tag_data = {
        "codigo_nfc": data.codigo_nfc,
        "status": data.status or "disponivel",
    }
    result = supabase.table("tags").insert(tag_data).execute()
    return result.data[0]
