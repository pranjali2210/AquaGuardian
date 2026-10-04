from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .config import settings
from .routers import (
    streams, observations, ai, alerts, cleanup, 
    impact, insights, community, dashboard, settings as settings_router,
    media
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AquaGuardian - AI-Powered Urban Freshwater Monitoring, Early Warning & Community Cleanup Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads Directory
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Mount API Routers
app.include_router(dashboard.router)
app.include_router(streams.router)
app.include_router(observations.router)
app.include_router(media.router)
app.include_router(ai.router)
app.include_router(alerts.router)
app.include_router(cleanup.router)
app.include_router(impact.router)
app.include_router(insights.router)
app.include_router(community.router)
app.include_router(settings_router.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AquaGuardian Core API",
        "version": settings.APP_VERSION,
        "demo_mode": settings.is_ai_demo_mode,
        "provider": settings.AI_PROVIDER,
        "model": settings.AI_MODEL_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
