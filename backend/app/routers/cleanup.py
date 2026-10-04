from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from ..data.db import db
from ..models.schemas import (
    CleanupEvent, CleanupEventCreate, CleanupVerificationRequest, 
    CleanupVerification
)
from ..services.ai_service import ai_service
from ..services.scoring_service import scoring_service

router = APIRouter(prefix="/api/cleanup", tags=["Cleanup Hub & Verification"])

@router.get("", response_model=List[CleanupEvent])
def get_cleanups():
    """Retrieve all upcoming, active, and completed community cleanup events."""
    return db.get_all_cleanups()

@router.get("/{cleanup_id}", response_model=CleanupEvent)
def get_cleanup(cleanup_id: str):
    cl = db.get_cleanup(cleanup_id)
    if not cl:
        raise HTTPException(status_code=404, detail="Cleanup event not found")
    return cl

@router.post("", response_model=CleanupEvent)
def create_cleanup(c_in: CleanupEventCreate):
    """Create a new community cleanup mobilization event with automated priority score."""
    stream = db.get_stream(c_in.stream_id)
    stream_name = stream.name if stream else "Urban Stream"

    # Compute priority score
    priority_score = scoring_service.calculate_cleanup_priority(
        severity_weight=0.8,
        observation_count=stream.recent_observations_count if stream else 10,
        persistence_days=5,
        affected_area_sqm=400,
        ecological_sensitivity=0.8,
        community_proximity=0.9
    )

    priority_level = "HIGH PRIORITY" if priority_score >= 70 else ("MEDIUM PRIORITY" if priority_score >= 40 else "LOW PRIORITY")

    event = CleanupEvent(
        id=f"cleanup-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        stream_id=c_in.stream_id,
        stream_name=stream_name,
        title=c_in.title,
        location_desc=c_in.location_desc,
        latitude=c_in.latitude,
        longitude=c_in.longitude,
        date_str=c_in.date_str,
        time_str=c_in.time_str,
        status="Upcoming",
        priority_score=priority_score,
        priority_level=priority_level,
        participants_count=1,
        max_participants=c_in.max_participants,
        target_issue=c_in.target_issue,
        estimated_duration_hours=c_in.estimated_duration_hours,
        equipment_needed=c_in.equipment_needed,
        safety_guidelines=[
            "Wear heavy-duty puncture-resistant gloves at all times.",
            "Do NOT touch chemical containers, hypodermic needles, or unknown liquids. Tag for municipal HAZMAT.",
            "Do not wade in water deeper than knee-level.",
            "Stay hydrated and work in buddy pairs."
        ],
        is_hazardous_warning=not (stream.safe_for_citizen_action if stream else True)
    )

    return db.add_cleanup(event)

@router.post("/{cleanup_id}/join", response_model=CleanupEvent)
def join_cleanup(cleanup_id: str):
    """Citizen RSVP to join a scheduled stream cleanup; awards community eco points."""
    event = db.join_cleanup(cleanup_id)
    if not event:
        raise HTTPException(status_code=404, detail="Cleanup event not found or full")
    return event

@router.post("/{cleanup_id}/verify", response_model=CleanupVerification)
async def verify_cleanup(cleanup_id: str, req: CleanupVerificationRequest):
    """
    Submit Before & After cleanup photos for AI visual differential verification.
    Quantifies visible improvement % and logs impact recovery.
    """
    event = db.get_cleanup(cleanup_id)
    if not event:
        raise HTTPException(status_code=404, detail="Cleanup event not found")

    before_url = req.before_photo_url or event.before_photo_url or "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
    after_url = req.after_photo_url or "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"

    # AI comparison
    verif = await ai_service.compare_cleanup_images(
        before_photo_url=before_url,
        after_photo_url=after_url,
        notes=req.volunteer_notes
    )
    verif.cleanup_id = cleanup_id
    verif.stream_id = event.stream_id

    # Persist verification
    saved_verif = db.save_verification(verif)
    return saved_verif

@router.get("/verifications/list", response_model=List[CleanupVerification])
def list_verifications():
    """List all verified cleanup records."""
    return db.verifications
