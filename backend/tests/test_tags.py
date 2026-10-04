from unittest.mock import MagicMock

import pytest
from httpx import AsyncClient

from app.auth import get_current_user
from app.main import app


@pytest.mark.asyncio
async def test_list_tags_requires_login(client: AsyncClient):
    """Sem token o catalogo inteiro nao pode ser lido."""
    response = await client.get("/api/tags")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_tags_returns_full_catalog(
    client: AsyncClient, mock_supabase_dependency: MagicMock
):
    app.dependency_overrides[get_current_user] = lambda: {
        "id": 1,
        "email": "user@test.com",
        "nome": "Usuario",
        "tipo": "cliente",
    }

    # O endpoint faz select().order(), nao select().eq(): o mock padrao do
    # conftest so encadeia eq, entao montamos o retorno aqui.
    execute = MagicMock()
    execute.data = [
        {"id": 1, "codigo_nfc": "A1B2C", "status": "disponivel"},
        {"id": 2, "codigo_nfc": "T3U4V", "status": "em_uso"},
        {"id": 3, "codigo_nfc": "Z9Y8X", "status": "indisponivel"},
    ]
    (
        mock_supabase_dependency.table.return_value.select.return_value.order.return_value.execute
    ).return_value = execute

    response = await client.get("/api/tags")
    assert response.status_code == 200

    data = response.json()
    assert [t["codigo_nfc"] for t in data] == ["A1B2C", "T3U4V", "Z9Y8X"]
    assert [t["status"] for t in data] == ["disponivel", "em_uso", "indisponivel"]
    # Só codigo e status: nenhum campo de usuario pode vazar por aqui.
    assert all(set(t) == {"id", "codigo_nfc", "status"} for t in data)
