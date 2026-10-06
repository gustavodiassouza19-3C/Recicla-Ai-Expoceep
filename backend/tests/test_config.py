import pytest
from httpx import AsyncClient

from app.auth import get_admin_user
from app.main import app

LINK = "https://forms.gle/exemplo-de-votacao"


@pytest.fixture(autouse=True)
def admin_logado():
    app.dependency_overrides[get_admin_user] = lambda: {
        "id": 1,
        "email": "admin@test.com",
        "nome": "Admin",
        "tipo": "admin",
    }
    yield


@pytest.mark.asyncio
async def test_get_publico(client: AsyncClient):
    response = await client.get("/api/config")
    assert response.status_code == 200
    assert set(response.json()) == {"link_votacao"}
    assert isinstance(response.json()["link_votacao"], str)


@pytest.mark.asyncio
async def test_get_admin(client: AsyncClient):
    response = await client.get("/api/admin/config")
    assert response.status_code == 200
    assert set(response.json()) == {"link_votacao"}


@pytest.mark.asyncio
async def test_patch_grava_o_link(client: AsyncClient, mock_supabase_dependency):
    response = await client.patch("/api/admin/config", json={"link_votacao": LINK})
    assert response.status_code == 200
    assert response.json() == {"link_votacao": LINK}

    tabela = mock_supabase_dependency.table.return_value
    gravado = tabela.update.call_args[0][0]
    assert gravado["valor"] == LINK
    assert gravado["atualizado_em"]


@pytest.mark.asyncio
async def test_patch_string_vazia_limpa(client: AsyncClient, mock_supabase_dependency):
    response = await client.patch("/api/admin/config", json={"link_votacao": "   "})
    assert response.status_code == 200
    assert response.json() == {"link_votacao": ""}

    tabela = mock_supabase_dependency.table.return_value
    assert tabela.update.call_args[0][0]["valor"] == ""


@pytest.mark.asyncio
@pytest.mark.parametrize("link", ["forms.gle/abc", "javascript:alert(1)", "ftp://x/1"])
async def test_patch_rejeita_link_nao_http(client: AsyncClient, link: str):
    response = await client.patch("/api/admin/config", json={"link_votacao": link})
    assert response.status_code == 422
