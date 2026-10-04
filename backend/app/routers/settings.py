from fastapi import APIRouter
from typing import Dict, Any
from ..config import settings

router = APIRouter(prefix="/api/settings", tags=["Configuration & Environment"])

@router.get("", response_model=Dict[str, Any])
def get_settings_status():
    """Retrieve non-sensitive configuration state and demo status."""
    return settings.get_public_status()
