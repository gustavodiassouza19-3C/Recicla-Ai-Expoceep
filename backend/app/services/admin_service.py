import httpx
from supabase import Client

from app.config import settings


class AdminCreationError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _auth_admin_headers() -> dict:
    return {
        "apikey": settings.supabase_service_key,
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "Content-Type": "application/json",
    }


def email_auth_exists(email: str) -> bool:
    response = httpx.get(
        f"{settings.supabase_url}/auth/v1/admin/users",
        headers=_auth_admin_headers(),
        params={"page": 1, "per_page": 1000},
        timeout=15,
    )
    if response.status_code >= 400:
        return False

    payload = response.json()
    users = payload.get("users", payload) if isinstance(payload, dict) else payload
    return any((u.get("email") or "").lower() == email.lower() for u in users or [])


def create_auth_user(email: str, senha: str) -> str:
    response = httpx.post(
        f"{settings.supabase_url}/auth/v1/admin/users",
        headers=_auth_admin_headers(),
        json={
            "email": email,
            "password": senha,
            "email_confirm": True,
        },
        timeout=20,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = {}

        msg = str(detail.get("msg") or detail.get("message") or detail.get("error_description") or "")
        if "already" in msg.lower() or "registered" in msg.lower():
            raise AdminCreationError("Ja existe uma conta com este e-mail", status_code=409)
        raise AdminCreationError("Nao foi possivel criar a conta de acesso")

    return response.json()["id"]


def create_admin_usuario(
    supabase: Client,
    nome: str,
    email: str,
    senha: str,
) -> dict:
    email = email.strip().lower()

    existente = supabase.table("usuarios").select("id").eq("email", email).limit(1).execute()
    if existente.data:
        raise AdminCreationError("Ja existe um usuario com este e-mail", status_code=409)

    if email_auth_exists(email):
        raise AdminCreationError("Ja existe uma conta com este e-mail", status_code=409)

    create_auth_user(email, senha)

    inserted = (
        supabase.table("usuarios")
        .insert(
            {
                "nome": nome.strip(),
                "email": email,
                "senha": "",
                "tipo": "admin",
                "household_size": 1,
            }
        )
        .execute()
    )

    if not inserted.data:
        raise AdminCreationError("Nao foi possivel criar o perfil do administrador", status_code=500)

    return inserted.data[0]
