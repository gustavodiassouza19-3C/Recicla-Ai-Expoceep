from datetime import datetime, timezone
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database import get_supabase
from app.services.points_service import get_user_points

security = HTTPBearer()

# Supabase.auth.get_user e uma ida a rede, e toda pagina autenticada bate no
# /api/users/me pelo menos duas vezes (auth + pontos). Guardamos o resultado ja
# validado por 60s: em vez de 2 validacoes por carga de pagina, vira uma.
# O custo e atrasar em ate 60s a propagacao de um token revogado.
_TOKEN_TTL_SECONDS = 60.0
_TOKEN_CACHE_LIMIT = 512
_token_cache: dict[str, tuple[float, dict]] = {}


def clear_token_cache() -> None:
    """Invalida tudo. Chamado quando o perfil muda, para nao servir dado velho."""
    _token_cache.clear()


def _remember_token(token: str, payload: dict) -> None:
    if len(_token_cache) >= _TOKEN_CACHE_LIMIT:
        _token_cache.clear()
    _token_cache[token] = (time.monotonic(), payload)


def grant_welcome_achievement(supabase: Client, usuario_id: int) -> None:
    try:
        achievement = (
            supabase.table("conquistas")
            .select("id, pontos")
            .eq("codigo", "boas_vindas")
            .maybe_single()
            .execute()
        )
        if not achievement.data:
            return

        now = datetime.now(timezone.utc).isoformat()
        supabase.table("usuario_conquistas").upsert(
            {
                "usuario_id": usuario_id,
                "conquista_id": achievement.data["id"],
                "conquista_codigo": "boas_vindas",
                "pontos_ganhos": achievement.data["pontos"],
                "concedida_em": now,
                "resgatada_em": now,
            },
            on_conflict="usuario_id,conquista_codigo",
        ).execute()

        total = get_user_points(supabase, usuario_id)
    except Exception:
        return


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> dict:
    token = credentials.credentials

    agora = time.monotonic()
    hit = _token_cache.get(token)
    if hit and agora - hit[0] < _TOKEN_TTL_SECONDS:
        return hit[1]

    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalido",
            )

        email = response.user.email
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token sem email",
            )

        result = (
            supabase.table("usuarios")
            .select("*")
            .eq("email", email)
            .limit(1)
            .execute()
        )

        if result.data:
            profile = result.data[0]
        else:
            metadata = response.user.user_metadata or {}
            insert = (
                supabase.table("usuarios")
                .insert(
                    {
                        "nome": metadata.get("nome", email.split("@")[0]),
                        "email": email,
                        "senha": "",
                        "tipo": "cliente",
                        "cpf": metadata.get("cpf"),
                        "sexo": metadata.get("sexo"),
                        "idade": metadata.get("idade"),
                        "household_size": metadata.get("household_size", 1),
                    }
                )
                .execute()
            )
            if not insert.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Nao foi possivel criar o perfil",
                )
            profile = insert.data[0]
            grant_welcome_achievement(supabase, profile["id"])

        payload = {
            "id": profile["id"],
            "email": email,
            "nome": profile["nome"],
            "tipo": profile.get("tipo", "cliente"),
            "household_size": profile.get("household_size", 1),
            # Linha completa em memoria: /api/users/me reusava em vez de
            # consultar a tabela de novo.
            "profile": profile,
        }
        _remember_token(token, payload)
        return payload

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido ou expirado",
        )


async def get_admin_user(user=Depends(get_current_user)) -> dict:
    if user.get("tipo") not in {"admin", "administrador"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return user


async def get_staff_user(user=Depends(get_current_user)) -> dict:
    if user.get("tipo") not in {"admin", "administrador", "funcionario"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a funcionarios",
        )
    return user
