from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database import get_supabase

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> dict:
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalido",
            )

        email = response.user.email
        result = (
            supabase.table("usuarios")
            .select("*")
            .eq("email", email)
            .execute()
        )

        if result.data:
            return {
                "id": result.data[0]["id"],
                "email": email,
                "nome": result.data[0]["nome"],
            }

        insert = (
            supabase.table("usuarios")
            .insert(
                {
                    "nome": response.user.user_metadata.get(
                        "nome", email.split("@")[0]
                    ),
                    "email": email,
                    "senha": "",
                    "tipo": "cidadao",
                    "sexo": response.user.user_metadata.get("sexo"),
                    "idade": response.user.user_metadata.get("idade"),
                }
            )
            .execute()
        )

        return {
            "id": insert.data[0]["id"],
            "email": email,
            "nome": insert.data[0]["nome"],
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido ou expirado",
        )
