from fastapi import APIRouter
from ..data.db import db
from ..models.schemas import UserEcoProfile

router = APIRouter(prefix="/api/community", tags=["Community & Gamification"])

@router.get("/profile", response_model=UserEcoProfile)
def get_user_profile():
    """Retrieve active citizen scientist profile, streak, points, and earned badges."""
    return db.get_user_profile()
