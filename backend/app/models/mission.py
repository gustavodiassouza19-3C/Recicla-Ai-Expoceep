from pydantic import BaseModel
from typing import Optional


class MissionCreate(BaseModel):
    title: str
    description: str
    target_count: int
    reward_points: int


class MissionResponse(BaseModel):
    id: int
    title: str
    description: str
    target_count: int
    reward_points: int
    created_at: Optional[str] = None


class UserMissionResponse(BaseModel):
    mission: MissionResponse
    progress: int
    completed: bool
