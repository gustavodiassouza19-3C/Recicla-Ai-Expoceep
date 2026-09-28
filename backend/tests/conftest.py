import pytest
import pytest_asyncio
from unittest.mock import MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_supabase

pytest_plugins = ["pytest_asyncio"]


@pytest.fixture(autouse=True)
def mock_supabase_dependency():
    mock_client = MagicMock()
    mock_execute = MagicMock()
    mock_execute.data = [
        {
            "id": "1",
            "nome": "Joao",
            "email": "joao@test.com",
            "cpf": "12345678900",
            "tipo": "cliente",
        }
    ]
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = mock_execute
    mock_table.select.return_value.eq.return_value.execute.return_value = mock_execute
    mock_table.update.return_value.eq.return_value.execute.return_value = mock_execute
    mock_client.table.return_value = mock_table

    mock_auth = MagicMock()
    mock_auth.get_user.side_effect = Exception("Invalid token")
    mock_client.auth = mock_auth

    app.dependency_overrides[get_supabase] = lambda: mock_client
    yield mock_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
