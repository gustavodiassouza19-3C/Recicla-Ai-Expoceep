from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import clear_token_cache, get_admin_user, get_current_user
from app.models.user import UserCreate, UserResponse, UserUpdate
from app.services.points_service import get_user_points

router = APIRouter(prefix="/api/users", tags=["users"])


def _to_response(data: dict, pontos: int) -> UserResponse:
    # A tabela usuarios possui a coluna `pontos` (migration 004), mas a
    # fonte da verdade e o calculo dinamico feito por get_user_points.
    payload = {**data, "pontos": pontos}
    return UserResponse(**payload)


@router.get("/me", response_model=UserResponse)
async def get_me(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    # O get_current_user ja leu a linha; consultar de novo era uma ida a rede
    # a mais no caminho mais quente do app.
    data = user.get("profile")
    if not data:
        result = supabase.table("usuarios").select("*").eq("id", user["id"]).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        data = result.data[0]
    pontos = get_user_points(supabase, data["id"])
    return _to_response(data, pontos)


@router.post("", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    user_data = {
        "nome": data.nome,
        "email": data.email,
        "cpf": data.cpf,
        "sexo": data.sexo,
        "idade": data.idade,
        "senha": "",
        "tipo": "cliente",
    }
    result = supabase.table("usuarios").insert(user_data).execute()
    return _to_response(result.data[0], 0)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
    result = (
        supabase.table("usuarios")
        .update(update_data)
        .eq("id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    # Perfil mudou: o cache de token passaria a devolver os dados antigos.
    clear_token_cache()
    pontos = get_user_points(supabase, user["id"])
    return _to_response(result.data[0], pontos)
