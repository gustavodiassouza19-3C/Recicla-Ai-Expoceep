import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
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
