from typing import Optional
import os

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.auth import get_current_user
from app.database import get_supabase
from app.models.recompensa import RecompensaCreate
from app.services.points_service import get_user_points

router = APIRouter(prefix="/api/rewards", tags=["rewards"])

SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


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
            "reciclagem_id": None,  # Catalog redemption, nao ligada a reciclagem especifica
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
@router.post("/{recompensa_id}/resgate-svc")
async def resgate_recompensa_svc(
    recompensa_id: int,
    supabase: Client = Depends(get_supabase),
):
    """Resgatar uma recompensa usando service key (bypassa RLS).
    Usado pelo frontend sem necessidade de token Supabase no cliente.
    """
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    # Busca a recompensa no catalogo (ativa)
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

    # Busca pontos do usuario 1 (usa service key, bypassa RLS)
    from app.services.points_service import get_user_points
    usuario_id = 1  # usuario admin/teste
    usuario_pontos = get_user_points(supabase, usuario_id)
    if usuario_pontos < custo:
        raise HTTPException(
            status_code=400,
            detail=f"Pontos insuficientes. Usuario 1 tem {usuario_pontos} pontos, custo: {custo}",
        )

    # Insere registro na tabela recompensas
    supabase.table("recompensas").insert(
        {
            "usuario_id": usuario_id,
            "reciclagem_id": None,  # Catalog redemption, nao ligada a reciclagem especifica
            "tipo": "catalogo",
            "valor": custo,
            "status": "resgatada",
            "data_liberacao": now,
        }
    ).execute()

    # Deduz os pontos do usuario
    novo_total = usuario_pontos - custo
    supabase.table("usuarios").update({"pontos": novo_total}).eq("id", usuario_id).execute()

    return {
        "success": True,
        "recompensa": {
            "id": recompensa["id"],
            "titulo": recompensa["titulo"],
            "custo": custo,
        },
        "novo_total": novo_total,
        "usuario_id": usuario_id,
    }
