from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import (
    admin_router,
    users_router,
    tags_router,
    recycling_router,
    eco_points_router,
    achievements_router,
    rewards_router,
    config_router,
)

app = FastAPI(
    title="Recicla Ai API",
    description="Backend para o sistema de reciclagem urbana",
    version="0.1.0",
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(users_router)
app.include_router(tags_router)
app.include_router(recycling_router)
app.include_router(eco_points_router)
app.include_router(achievements_router)
app.include_router(rewards_router)
app.include_router(config_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
