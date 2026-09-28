import pytest
from httpx import AsyncClient
from app.auth import get_admin_user
from app.main import app


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    app.dependency_overrides[get_admin_user] = lambda: {
        "id": 1,
        "email": "admin@test.com",
        "nome": "Admin",
        "tipo": "admin",
    }
    response = await client.post(
        "/api/users",
        json={
            "nome": "Joao",
            "email": "joao@test.com",
            "cpf": "12345678900",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nome"] == "Joao"
    assert data["pontos"] == 0
