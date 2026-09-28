from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.auth import get_current_user
from app.database import get_supabase
from app.models.recompensa import RecompensaCreate

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


@router.get("")
async def listar_recompensas(
    incluir_inativas: bool = False,
    supabase: Client = Depends(get_supabase),
):
    """Catalogo de recompensas.

    Por devolve so as ativas. `incluir_inativas` existe para o painel admin
    passar a listar o catalogo completo, incluindo o que esta pausado.
    """
    query = supabase.table("catalogo_recompensas").select(
        "id, titulo, descricao, custo_pontos, categoria, icone, ativa, criado_em"
    )
    if not incluir_inativas:
        query = query.eq("ativa", True)
    result = query.order("custo_pontos").execute()

    return {"recompensas": result.data or []}


@router.get("/{recompensa_id}")
async def detalhe_recompensa(
    recompensa_id: int,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("catalogo_recompensas")
        .select("id, titulo, descricao, custo_pontos, categoria, icone, ativa")
        .eq("id", recompensa_id)
        .eq("ativa", True)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Recompensa nao encontrada")
    return result.data[0]
