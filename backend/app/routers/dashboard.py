from fastapi import APIRouter
from ..data.db import db
from ..models.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardStats)
def get_dashboard_summary():
    """Retrieve holistic dashboard metrics: streams status breakdown, alerts, cleanups, volunteers."""
    return db.get_dashboard_stats()
