import pytest
from httpx import AsyncClient

from app.auth import get_current_user
from app.main import app
from app.services.impact_service import calculate_impact


def test_sem_entregas():
    assert calculate_impact(0) == {
        "validated_count": 0,
        "trees": 0.0,
        "water_liters": 0.0,
        "co2_kg": 0.0,
        "kg_reciclado": 0.0,
    }


def test_dez_entregas():
    assert calculate_impact(10) == {
        "validated_count": 10,
        "trees": 0.04,
        "water_liters": 80.0,
        "co2_kg": 15.0,
        "kg_reciclado": 10.0,
    }


def test_duzentas_cinquenta_entregas_e_uma_arvore():
    assert calculate_impact(250)["trees"] == 1.0


def test_contagem_negativa_ou_none_vira_zero():
    assert calculate_impact(-5)["validated_count"] == 0
    assert calculate_impact(None)["validated_count"] == 0


@pytest.mark.asyncio
async def test_rota_devolve_todos_os_campos(
    client: AsyncClient, mock_supabase_dependency
):
    app.dependency_overrides[get_current_user] = lambda: {
        "id": 7,
        "email": "x@test.com",
        "nome": "X",
        "tipo": "cliente",
    }
    # A rota encadeia select -> eq -> eq -> execute; o conftest fixa o mock so
    # no primeiro eq, entao o count tem que ser setado no fim da corrente.
    mock_supabase_dependency.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.count = 10

    response = await client.get("/api/recycle/impact")
    assert response.status_code == 200
    assert response.json() == calculate_impact(10)
    app.dependency_overrides.clear()
