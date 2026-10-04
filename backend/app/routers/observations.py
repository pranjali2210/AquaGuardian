from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from ..data.db import db
from ..models.schemas import Observation, ObservationCreate, AIAnalysis, MediaItem, VideoAnalysisResult
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/observations", tags=["Citizen Observations"])

@router.get("", response_model=List[Observation])
def get_observations(stream_id: Optional[str] = None):
    """Retrieve citizen observations, optionally filtered by stream."""
    return db.get_all_observations(stream_id=stream_id)

@router.post("", response_model=Observation)
async def submit_observation(obs_in: ObservationCreate):
    """
    Submit a citizen observation with guided options, media (photos/videos), and instant AI assessment.
    """
    stream = db.get_stream(obs_in.stream_id)
    stream_name = stream.name if stream else "Urban Stream"

    # Default fallback demo photo if user didn't provide one
    photo_url = obs_in.photo_url or obs_in.photo_base64
    media_items = list(obs_in.media)

    if not photo_url and not media_items:
        if obs_in.visible_litter:
            photo_url = "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
        elif "Green" in obs_in.water_appearance:
            photo_url = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        else:
            photo_url = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80"

    # If photo_url provided but not in media_items, add it as a MediaItem
    if photo_url and not any(m.url == photo_url for m in media_items):
        media_items.append(MediaItem(
            id=f"media-{datetime.now().strftime('%Y%m%d%H%M%S')}-1",
            type="image",
            url=photo_url,
            filename="observation_photo.jpg",
            thumbnail_url=photo_url
        ))

    # Run primary AI multimodal evaluation
    ai_result = await ai_service.analyze_observation(obs_in, stream_name=stream_name)

    # Check for video media and run representative keyframe video analysis
    video_item = next((m for m in media_items if m.type == "video"), None)
    video_analysis = None
    if video_item:
        video_analysis = await ai_service.analyze_video(
            video_id=video_item.id,
            duration_seconds=video_item.duration_seconds or 24.0,
            sampled_frames=[],
            context=f"{obs_in.water_appearance}, {obs_in.litter_type or 'None'}"
        )

    obs_id = f"obs-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    ai_result.observation_id = obs_id

    new_obs = Observation(
        id=obs_id,
        stream_id=obs_in.stream_id,
        stream_name=stream_name,
        timestamp="Just now",
        latitude=obs_in.latitude,
        longitude=obs_in.longitude,
        water_appearance=obs_in.water_appearance.value,
        smell=obs_in.smell.value,
        visible_litter=obs_in.visible_litter,
        litter_type=obs_in.litter_type,
        algae_present=obs_in.algae_present,
        algae_type=obs_in.algae_type,
        aquatic_organisms=obs_in.aquatic_organisms,
        vegetation=obs_in.vegetation,
        unusual_events=obs_in.unusual_events,
        reporter_name=obs_in.reporter_name or "Citizen Guardian",
        notes=obs_in.notes,
        photo_url=photo_url or (media_items[0].url if media_items else None),
        media=media_items,
        ai_analysis=ai_result,
        video_analysis=video_analysis
    )

    saved_obs = db.add_observation(new_obs)
    return saved_obs
