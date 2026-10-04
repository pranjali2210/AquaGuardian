from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..data.db import db
from ..models.schemas import RiskAlert, PollutionCluster

router = APIRouter(prefix="/api/alerts", tags=["Early Warning & Alerts"])

@router.get("", response_model=List[RiskAlert])
def get_alerts(stream_id: Optional[str] = None):
    """Retrieve all active early warning environmental alerts."""
    return db.get_alerts(stream_id=stream_id)

@router.post("/{alert_id}/resolve", response_model=RiskAlert)
def resolve_alert(alert_id: str):
    """Mark an early warning alert as inspected and resolved."""
    alerts = db.get_alerts()
    for a in alerts:
        if a.id == alert_id:
            a.is_resolved = True
            return a
    raise HTTPException(status_code=404, detail="Alert not found")

@router.get("/clusters/spatial", response_model=List[PollutionCluster])
def get_pollution_clusters():
    """Retrieve spatial clusters of correlated citizen reports."""
    return db.get_clusters()
