from fastapi import APIRouter

router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.get("")
async def list_missions():
    return {"message": "Missoes ainda nao disponiveis — tabela nao criada"}


@router.get("/me")
async def my_missions():
    return {"message": "Missoes ainda nao disponiveis — tabela nao criada"}


@router.post("/{mission_id}/complete")
async def complete_mission(mission_id: str):
    return {"message": "Missoes ainda nao disponiveis — tabela nao criada"}
