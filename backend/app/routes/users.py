from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.models.user import UserCreate, UserResponse
from app.services.points_service import get_user_points

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("usuarios").select("*").eq("id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    data = result.data[0]
    pontos = get_user_points(supabase, data["id"])
    return UserResponse(**data, pontos=pontos)


@router.post("", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    supabase: Client = Depends(get_supabase),
):
    user_data = {
        "nome": data.nome,
        "email": data.email,
        "cpf": data.cpf,
        "senha": "",
        "tipo": data.tipo or "cidadao",
    }
    result = supabase.table("usuarios").insert(user_data).execute()
    return UserResponse(**result.data[0], pontos=0)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    update_data = data.model_dump(exclude_unset=True)
    result = (
        supabase.table("usuarios")
        .update(update_data)
        .eq("id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    pontos = get_user_points(supabase, user["id"])
    return UserResponse(**result.data[0], pontos=pontos)
