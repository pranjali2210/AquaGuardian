from fastapi import APIRouter
from typing import Dict, Any
from ..data.db import db
from ..models.schemas import (
    ObservationCreate, AIAnalysis, CleanupVerificationRequest, 
    CleanupVerification, ChatQueryRequest, ChatQueryResponse
)
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Services"])

@router.post("/analyze-observation", response_model=AIAnalysis)
async def analyze_observation(obs: ObservationCreate):
    """Run visual and sensory AI inference on raw citizen report data."""
    stream = db.get_stream(obs.stream_id)
    stream_name = stream.name if stream else "Urban Stream"
    return await ai_service.analyze_observation(obs, stream_name=stream_name)

@router.post("/compare-cleanup", response_model=CleanupVerification)
async def compare_cleanup(req: CleanupVerificationRequest):
    """Perform AI visual differential analysis between Before & After cleanup photos."""
    before_url = req.before_photo_url or "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
    after_url = req.after_photo_url or "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"
    
    verif = await ai_service.compare_cleanup_images(
        before_photo_url=before_url,
        after_photo_url=after_url,
        notes=req.volunteer_notes
    )
    verif.cleanup_id = req.cleanup_id
    return verif

@router.post("/query", response_model=ChatQueryResponse)
async def chat_query(req: ChatQueryRequest):
    """
    Grounded Environmental AI Assistant. Answers questions regarding stream risks,
    cleanups, alerts, and time trends strictly utilizing application database facts.
    """
    context_data = {
        "streams": [s.model_dump() for s in db.get_all_streams()],
        "alerts": [a.model_dump() for a in db.get_alerts()],
        "cleanups": [c.model_dump() for c in db.get_all_cleanups()],
        "observations_count": len(db.get_all_observations())
    }
    return await ai_service.answer_assistant_query(req.message, context_data)
