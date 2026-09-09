from fastapi import APIRouter

router = APIRouter(prefix="/api/eco-points", tags=["eco-points"])


@router.get("")
async def list_eco_points():
    return {"message": "EcoPoints ainda nao disponiveis — tabela nao criada"}


@router.get("/nearby")
async def nearby_eco_points():
    return {"message": "EcoPoints ainda nao disponiveis — tabela nao criada"}


@router.post("")
async def create_eco_point():
    return {"message": "EcoPoints ainda nao disponiveis — tabela nao criada"}
