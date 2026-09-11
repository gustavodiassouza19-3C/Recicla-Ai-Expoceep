from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    users_router,
    tags_router,
    recycling_router,
    eco_points_router,
    missions_router,
    achievements_router,
)

app = FastAPI(
    title="Recicla Ai API",
    description="Backend para o sistema de reciclagem urbana",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(tags_router)
app.include_router(recycling_router)
app.include_router(eco_points_router)
app.include_router(missions_router)
app.include_router(achievements_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
