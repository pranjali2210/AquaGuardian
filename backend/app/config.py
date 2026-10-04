import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_paths = [
    BASE_DIR / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    Path(".env")
]

for p in env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p, override=False)
        break

class Settings:
    APP_NAME: str = "AquaGuardian"
    APP_VERSION: str = "1.2.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")

    _groq_key: str = os.getenv("GROQ_API_KEY", "").strip()
    _groq_model_name: str = os.getenv("GROQ_MODEL_NAME", "").strip()
    _groq_model: str = os.getenv("GROQ_MODEL", "").strip()

    _ai_key: str = os.getenv("AI_API_KEY", "").strip()
    _ai_model: str = os.getenv("AI_MODEL_NAME", "").strip()
    _ai_provider: str = os.getenv("AI_PROVIDER", "").strip().lower()

    if _groq_key:
        AI_PROVIDER: str = "groq"
        AI_API_KEY: str = _groq_key
        AI_MODEL_NAME: str = _groq_model_name or _groq_model
    elif _ai_key:
        AI_PROVIDER: str = _ai_provider or "groq"
        AI_API_KEY: str = _ai_key
        AI_MODEL_NAME: str = _ai_model or _groq_model_name or _groq_model
    else:
        AI_PROVIDER: str = _ai_provider or "groq"
        AI_API_KEY: str = ""
        AI_MODEL_NAME: str = _ai_model or _groq_model_name or _groq_model

    SECONDARY_AI_PROVIDER: str = os.getenv("SECONDARY_AI_PROVIDER", "").lower()
    SECONDARY_AI_API_KEY: str = os.getenv("SECONDARY_AI_API_KEY", "").strip()
    SECONDARY_AI_MODEL_NAME: str = os.getenv("SECONDARY_AI_MODEL_NAME", "").strip()

    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "").strip()
    MAPS_API_KEY: str = os.getenv("MAPS_API_KEY", "").strip()
    DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
    STORAGE_API_KEY: str = os.getenv("STORAGE_API_KEY", "").strip()

    UPLOAD_DIR: Path = BASE_DIR / "backend" / "uploads"
    MAX_IMAGE_SIZE_MB: int = 20
    MAX_VIDEO_SIZE_MB: int = 150
    ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm"}
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    GROQ_TIMEOUT_SECONDS: float = 90.0
    MAX_VISION_IMAGES_PER_CALL: int = 8

    @property
    def groq_configured(self) -> bool:
        return bool(self.AI_API_KEY) and bool(self.AI_MODEL_NAME)

    @property
    def is_ai_demo_mode(self) -> bool:
        """True only when Groq is not configured. The app never fabricates AI output."""
        return not self.groq_configured

    @property
    def is_weather_demo_mode(self) -> bool:
        return not bool(self.WEATHER_API_KEY)

    @property
    def is_maps_demo_mode(self) -> bool:
        return not bool(self.MAPS_API_KEY)

    def get_public_status(self) -> Dict[str, Any]:
        configured = self.groq_configured
        return {
            "app_name": self.APP_NAME,
            "version": self.APP_VERSION,
            "environment": self.APP_ENV,
            "ai_service": {
                "provider": self.AI_PROVIDER if configured else "unconfigured",
                "configured": configured,
                "model": self.AI_MODEL_NAME if configured else "",
                "mode": "Live Groq" if configured else "Unavailable — Groq not configured"
            },
            "weather_service": {
                "configured": bool(self.WEATHER_API_KEY),
                "mode": "Live Weather API" if self.WEATHER_API_KEY else "Open-Meteo fallback"
            },
            "maps_service": {
                "configured": bool(self.MAPS_API_KEY),
                "mode": "OpenStreetMap / Leaflet (Native)" if not self.MAPS_API_KEY else "Commercial Satellite Hybrid"
            },
            "database": {
                "configured": bool(self.DATABASE_URL),
                "type": "PostgreSQL / Remote" if self.DATABASE_URL else "In-Memory / Local Seeded Store"
            },
            "media_service": {
                "storage": "Local Secure Volume",
                "supported_images": list(self.ALLOWED_IMAGE_EXTENSIONS),
                "supported_videos": list(self.ALLOWED_VIDEO_EXTENSIONS),
                "max_image_mb": self.MAX_IMAGE_SIZE_MB,
                "max_video_mb": self.MAX_VIDEO_SIZE_MB
            }
        }

settings = Settings()
