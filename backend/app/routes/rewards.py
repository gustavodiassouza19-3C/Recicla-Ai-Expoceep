from typing import Optional
import os

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.auth import get_current_user
from app.database import get_supabase
from app.models.recompensa import RecompensaCreate
from app.services.points_service import get_user_points

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
        "id, titulo, descricao, custo_pontos, categoria, icone, ativa"
    )
    if not incluir_inativas:
        query = query.eq("ativa", True)
    result = query.order("custo_pontos").execute()

    return {"recompensas": result.data or []}


@router.get("/history")
async def reward_history(
    supabase: Client = Depends(get_supabase),
    user=Depends(get_current_user),
):
    """Histórico de recompensas resgatadas pelo usuário.
    
    Retorna todas as recompensas que o usuário já resgatou do catálogo,
    ordenadas pela data de liberação (mais recentes primeiro).
    """
    result = (
        supabase.table("recompensas")
        .select("id, valor, tipo, status, data_liberacao, usuario_id")
        .eq("usuario_id", user["id"])
        .order("data_liberacao", desc=True)
        .execute()
    )
    
    history = []
    for r in result.data or []:
        history.append({
            "id": r["id"],
            "valor": r["valor"],
            "tipo": r["tipo"],
            "status": r["status"],
            "data_liberacao": r["data_liberacao"],
            "usuario_id": r["usuario_id"],
        })
    
    return {"historico": history}


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


@router.post("/{recompensa_id}/resgate")
async def resgate_recompensa(
    recompensa_id: int,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Resgatar uma recompensa do catalogo.
    - Verifica se o usuario tem pontos suficientes
    - Insere registro na tabela recompensas com status 'resgatada'
    - Deduz o custo dos pontos do usuario
    """
    # Busca a recompensa no catalogo
    catalogo = (
        supabase.table("catalogo_recompensas")
        .select("id, titulo, descricao, custo_pontos, categoria, icone, ativa")
        .eq("id", recompensa_id)
        .eq("ativa", True)
        .execute()
    )
    if not catalogo.data:
        raise HTTPException(status_code=404, detail="Recompensa nao encontrada ou inativa")
    recompensa = catalogo.data[0]
    custo = recompensa["custo_pontos"]

    # Verifica se o usuario tem pontos suficientes
    usuario_pontos = get_user_points(supabase, user["id"])
    if usuario_pontos < custo:
        raise HTTPException(
            status_code=400,
            detail=f"Pontos insuficientes. Voce tem {usuario_pontos} pontos, custo: {custo}",
        )

    # Insere registro na tabela recompensas (usuario reward)
    # reciclagem_id = NULL pois esta e do catalogo, nao ligada a uma reciclagem especifica
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    supabase.table("recompensas").insert(
        {
            "usuario_id": user["id"],
            "reciclagem_id": None,  # Catalog redemption, nao ligada a uma reciclagem especifica
            "tipo": "catalogo",
            "valor": custo,
            "status": "resgatada",
            "data_liberacao": now,
        }
    ).execute()

    # Deduz os pontos do usuario
    novo_total = usuario_pontos - custo
    supabase.table("usuarios").update({"pontos": novo_total}).eq("id", user["id"]).execute()

    return {
        "success": True,
        "recompensa": {
            "id": recompensa["id"],
            "titulo": recompensa["titulo"],
            "custo": custo,
        },
    "novo_total": novo_total,
}
