from fastapi import APIRouter, HTTPException
from typing import List
from ..data.db import db
from ..models.schemas import ImpactTrackingRecord

router = APIRouter(prefix="/api/impact", tags=["Impact Tracking"])

@router.get("", response_model=List[ImpactTrackingRecord])
def get_all_impact_records():
    """Retrieve multi-stage timeline records showing intervention impact over time."""
    return db.get_impact_records()

@router.get("/{stream_id}", response_model=ImpactTrackingRecord)
def get_stream_impact(stream_id: str):
    record = db.get_stream_impact(stream_id)
    if not record:
        raise HTTPException(status_code=404, detail="Impact tracking record not found for this stream")
    return record
