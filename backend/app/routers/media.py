from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..exceptions import GroqUnavailableError
from ..services.media_service import media_service
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/media", tags=["Media Upload & Video AI"])


class AnalyzeVideoRequest(BaseModel):
    video_id: str
    duration_seconds: float = 0.0
    context: Optional[str] = None


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    return await media_service.upload_image(file)


@router.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    media_item, sampled_frames = await media_service.upload_video(file)
    return {
        "media_item": media_item,
        "sampled_frames_count": len(sampled_frames),
        "sampled_frames": [
            {"timestamp_sec": t, "frame_url": url} for t, url, _ in sampled_frames
        ],
    }


@router.post("/analyze-video")
async def analyze_video(req: AnalyzeVideoRequest):
    frames = media_service.get_sampled_frames(req.video_id)
    if not frames:
        raise HTTPException(
            status_code=400,
            detail="Frame extraction failed. Upload the video first so representative frames can be analyzed.",
        )
    duration = req.duration_seconds or (frames[-1][0] if frames else 0.0)
    try:
        return await ai_service.analyze_video(
            video_id=req.video_id,
            duration_seconds=duration,
            sampled_frames=frames,
            context=req.context,
        )
    except GroqUnavailableError as exc:
        raise HTTPException(status_code=503, detail=exc.detail) from exc
