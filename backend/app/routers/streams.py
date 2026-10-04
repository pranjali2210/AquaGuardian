from fastapi import APIRouter, HTTPException
from typing import List
from ..data.db import db
from ..models.schemas import Stream, RiskExplanation
from ..services.ai_service import ai_service
from ..services.weather_service import weather_service

router = APIRouter(prefix="/api/streams", tags=["Streams"])

@router.get("", response_model=List[Stream])
def get_streams():
    """Retrieve all monitored urban streams with real-time indicators and statuses."""
    return db.get_all_streams()

@router.get("/{stream_id}", response_model=Stream)
def get_stream(stream_id: str):
    """Retrieve detailed stream health card and indicators by ID."""
    stream = db.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    return stream

@router.get("/{stream_id}/explain-risk", response_model=RiskExplanation)
async def explain_stream_risk(stream_id: str):
    """
    Explainable AI endpoint: 'Why is this stream at risk?'
    Returns decomposed risk factors, evidence, confidence, and responsible AI labels.
    """
    stream = db.get_stream(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    observations = db.get_all_observations(stream_id=stream_id)
    weather_data = await weather_service.get_stream_weather(stream.latitude, stream.longitude)

    explanation = await ai_service.explain_risk(
        stream=stream,
        recent_observations_count=len(observations),
        rainfall_data=weather_data
    )
    return explanation
