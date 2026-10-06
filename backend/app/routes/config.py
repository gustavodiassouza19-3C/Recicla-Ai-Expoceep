from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from supabase import Client

from app.auth import get_admin_user
from app.database import get_supabase

router = APIRouter(prefix="/api", tags=["config"])

CHAVE_LINK_VOTACAO = "link_votacao"


class LinkVotacaoUpdate(BaseModel):
    link_votacao: str

    @field_validator("link_votacao")
    @classmethod
    def _link_valido(cls, valor: str) -> str:
        link = valor.strip()
        if not link:
            return ""
        if not link.lower().startswith(("http://", "https://")):
            raise ValueError("O link precisa comecar com http:// ou https://")
        return link


def _ler_link(supabase: Client) -> str:
    """Devolve '' tambem quando a tabela ainda nao existe.

    O banner do dashboard e opcional: se a migration 019 nao tiver rodado, a
    pagina tem que continuar carregando em vez de quebrar com 500. Quem salva
    (PATCH) recebe o erro de verdade e sabe que falta aplicar a migration.
    """
    try:
        result = (
            supabase.table("site_config")
            .select("valor")
            .eq("chave", CHAVE_LINK_VOTACAO)
            .execute()
        )
    except Exception:
        return ""
    if not result.data:
        return ""
    return (result.data[0].get("valor") or "").strip()


@router.get("/config")
async def obter_config(supabase: Client = Depends(get_supabase)):
    """Configuracoes publicas do site, lidas pelo dashboard do usuario."""
    return {"link_votacao": _ler_link(supabase)}


@router.get("/admin/config")
async def admin_obter_config(
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    """Mesmo valor, para o painel admin carregar o campo ja preenchido."""
    return {"link_votacao": _ler_link(supabase)}


@router.patch("/admin/config")
async def admin_atualizar_config(
    data: LinkVotacaoUpdate,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    """Grava o link da votacao. String vazia limpa e esconde o banner."""
    agora = datetime.now(timezone.utc).isoformat()
    try:
        existe = (
            supabase.table("site_config")
            .select("chave")
            .eq("chave", CHAVE_LINK_VOTACAO)
            .execute()
        )
        if existe.data:
            supabase.table("site_config").update(
                {"valor": data.link_votacao, "atualizado_em": agora}
            ).eq("chave", CHAVE_LINK_VOTACAO).execute()
        else:
            supabase.table("site_config").insert(
                {
                    "chave": CHAVE_LINK_VOTACAO,
                    "valor": data.link_votacao,
                    "atualizado_em": agora,
                }
            ).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Nao foi possivel salvar. Confira se a migration "
                "019_site_config foi aplicada no Supabase."
            ),
        ) from exc

    return {"link_votacao": data.link_votacao}
