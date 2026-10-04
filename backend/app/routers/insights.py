from fastapi import APIRouter
from typing import List, Optional
from ..data.db import db
from ..models.schemas import OneHealthInsight

router = APIRouter(prefix="/api/insights", tags=["One Health Insights"])

@router.get("", response_model=List[OneHealthInsight])
def get_insights(stream_id: Optional[str] = None):
    """
    Retrieve One Health Insights connecting Ecosystem Health, Biodiversity, and Human Wellbeing.
    Strictly avoids unsupported clinical claims; highlights cautious actionable knowledge.
    """
    return db.get_one_health_insights(stream_id=stream_id)
