import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException, UploadFile
from PIL import Image

from ..config import settings
from ..models.schemas import MediaItem

try:
    import cv2
except Exception:  # pragma: no cover
    cv2 = None


class MediaService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.images_dir = self.upload_dir / "images"
        self.videos_dir = self.upload_dir / "videos"
        self.thumbs_dir = self.upload_dir / "thumbnails"
        self.frames_dir = self.upload_dir / "frames"
        self._video_frames: Dict[str, List[Tuple[float, str, str]]] = {}

        for d in [self.images_dir, self.videos_dir, self.thumbs_dir, self.frames_dir]:
            d.mkdir(parents=True, exist_ok=True)

    def _sanitize_extension(self, filename: str) -> str:
        ext = Path(filename).suffix.lower()
        dangerous = {".exe", ".bat", ".cmd", ".sh", ".py", ".js", ".vbs", ".msi", ".jar", ".ps1"}
        if ext in dangerous:
            raise HTTPException(status_code=400, detail="Executable or script uploads are strictly prohibited.")
        return ext

    async def upload_image(self, file: UploadFile) -> MediaItem:
        ext = self._sanitize_extension(file.filename or "")
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image format '{ext}'. Allowed: {', '.join(sorted(settings.ALLOWED_IMAGE_EXTENSIONS))}",
            )

        file_id = f"img_{uuid.uuid4().hex[:12]}"
        dest_filename = f"{file_id}{ext}"
        dest_path = self.images_dir / dest_filename

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Invalid image. The uploaded file is empty.")
        if len(content) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"Image exceeds maximum size of {settings.MAX_IMAGE_SIZE_MB}MB.",
            )

        dest_path.write_bytes(content)

        try:
            with Image.open(dest_path) as img:
                img.verify()
            with Image.open(dest_path) as img:
                img.thumbnail((320, 240))
                thumb_filename = f"{file_id}_thumb.webp"
                thumb_path = self.thumbs_dir / thumb_filename
                img.convert("RGB").save(thumb_path, "WEBP", quality=85)
            thumbnail_url = f"/uploads/thumbnails/{thumb_filename}"
        except Exception as exc:
            dest_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="Invalid image. The file could not be decoded.") from exc

        return MediaItem(
            id=file_id,
            type="image",
            url=f"/uploads/images/{dest_filename}",
            filename=file.filename or dest_filename,
            thumbnail_url=thumbnail_url,
            file_size_bytes=len(content),
            metadata={"format": ext.replace(".", "").upper()},
        )

    async def upload_video(self, file: UploadFile) -> Tuple[MediaItem, List[Tuple[float, str, str]]]:
        if cv2 is None:
            raise HTTPException(
                status_code=500,
                detail="Frame extraction failed. OpenCV is not installed on the server.",
            )

        ext = self._sanitize_extension(file.filename or "")
        if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported video format '{ext}'. Allowed: {', '.join(sorted(settings.ALLOWED_VIDEO_EXTENSIONS))}",
            )

        file_id = f"vid_{uuid.uuid4().hex[:12]}"
        dest_filename = f"{file_id}{ext}"
        dest_path = self.videos_dir / dest_filename

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Invalid video. The uploaded file is empty.")
        if len(content) > settings.MAX_VIDEO_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"Video exceeds maximum size of {settings.MAX_VIDEO_SIZE_MB}MB.",
            )

        dest_path.write_bytes(content)

        duration_sec = 0.0
        sampled_frames: List[Tuple[float, str, str]] = []
        thumbnail_url = None

        try:
            cap = cv2.VideoCapture(str(dest_path))
            if not cap.isOpened():
                dest_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="Invalid video. The file could not be opened.")

            fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
            if fps <= 0 or frame_count <= 0:
                cap.release()
                dest_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=400,
                    detail="Frame extraction failed. Video duration or frames could not be read.",
                )

            duration_sec = round(frame_count / fps, 2)
            if duration_sec <= 30:
                num_samples = min(10, max(6, int(duration_sec / 3) or 6))
            else:
                num_samples = 10

            interval = max(1, int(frame_count / (num_samples + 1)))
            for i in range(1, num_samples + 1):
                target_frame_idx = min(int(frame_count - 1), i * interval)
                cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame_idx)
                ret, frame = cap.read()
                if not ret:
                    continue
                t_sec = round(target_frame_idx / fps, 2)
                frame_filename = f"{file_id}_f{i}.jpg"
                frame_path = self.frames_dir / frame_filename
                cv2.imwrite(str(frame_path), frame)
                frame_url = f"/uploads/frames/{frame_filename}"
                sampled_frames.append((t_sec, frame_url, str(frame_path)))
                if thumbnail_url is None:
                    thumbnail_url = frame_url
            cap.release()
        except HTTPException:
            raise
        except Exception as exc:
            dest_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="Frame extraction failed. The video could not be processed.") from exc

        if not sampled_frames:
            dest_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="Frame extraction failed. No representative frames were produced.")

        item = MediaItem(
            id=file_id,
            type="video",
            url=f"/uploads/videos/{dest_filename}",
            filename=file.filename or dest_filename,
            duration_seconds=duration_sec,
            thumbnail_url=thumbnail_url,
            file_size_bytes=len(content),
            metadata={"duration": duration_sec, "frames_extracted": len(sampled_frames)},
        )
        self._video_frames[file_id] = sampled_frames
        return item, sampled_frames

    def get_sampled_frames(self, video_id: str) -> List[Tuple[float, str, str]]:
        return list(self._video_frames.get(video_id, []))

    def get_media_path(self, relative_url: str) -> Optional[Path]:
        if not relative_url or not relative_url.startswith("/uploads/"):
            return None
        clean_rel = relative_url.replace("/uploads/", "")
        p = (self.upload_dir / clean_rel).resolve()
        try:
            p.relative_to(self.upload_dir.resolve())
        except ValueError:
            return None
        return p if p.exists() else None


media_service = MediaService()
