import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_recycling_invalid_tag(client: AsyncClient):
    response = await client.post(
        "/api/recycle",
        json={"tag_code": "TAG-INVALIDA"},
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code in [401, 404]
