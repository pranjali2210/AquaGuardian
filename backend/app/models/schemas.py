from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class StreamStatus(str, Enum):
    HEALTHY = "Healthy"
    WATCH = "Watch"
    AT_RISK = "At Risk"
    CLEANUP_REQUIRED = "Cleanup Required"
    POTENTIAL_ALERT = "Potential Alert"
    RECENTLY_CLEANED = "Recently Cleaned"

class WaterAppearanceEnum(str, Enum):
    CLEAR = "Normal / Clear"
    CLOUDY = "Cloudy / Turbid"
    BROWN = "Brown / Muddy"
    GREEN = "Green / Algal Tint"
    FOAMY = "Foamy / Frothy"
    UNUSUAL = "Unusual Chemical Sheen / Discolored"

class SmellEnum(str, Enum):
    NONE = "None / Natural Earthy"
    MUSTY = "Musty / Stagnant"
    SEWAGE = "Sewage / Rotten Egg"
    CHEMICAL = "Chemical / Solvent"
    FISHY = "Dead Fish / Decomposing"

class StreamIndicators(BaseModel):
    water_appearance_score: int = Field(default=80, ge=0, le=100)
    biodiversity_score: int = Field(default=75, ge=0, le=100)
    pollution_score: int = Field(default=70, ge=0, le=100) # 100 means zero pollution
    habitat_score: int = Field(default=75, ge=0, le=100)
    climate_stress_score: int = Field(default=80, ge=0, le=100)

class MediaItem(BaseModel):
    id: str
    type: str # 'image' | 'video'
    url: str
    filename: str
    duration_seconds: Optional[float] = None
    thumbnail_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    metadata: Dict[str, Any] = {}

class AIObservationFinding(BaseModel):
    category: str
    finding: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str


class VideoTimelineEvent(BaseModel):
    timestamp_sec: float
    timestamp_str: str
    detected_issue: str
    confidence: Optional[int] = None
    frame_thumbnail_url: Optional[str] = None

class VideoAnalysisResult(BaseModel):
    id: str
    video_id: str
    duration_seconds: float
    frames_analyzed: int
    detected_indicators: Dict[str, Optional[int]] = {}
    overall_assessment: str
    evidence_timeline: List[VideoTimelineEvent] = []
    findings: List[AIObservationFinding] = []
    disclaimer: str = "AI-assisted video assessment from sampled keyframes. Does not replace professional water quality testing."


class MediaAnalysisSummary(BaseModel):
    photos_analyzed: int = 0
    videos_analyzed: int = 0
    frames_analyzed: int = 0
    detected: List[str] = []

class StreamBase(BaseModel):
    id: str
    name: str
    location_name: str
    latitude: float
    longitude: float
    health_score: int = Field(ge=0, le=100)
    status: StreamStatus
    length_km: float
    catch_basin_desc: str
    indicators: StreamIndicators
    recent_observations_count: int
    last_observation_time: str
    cleanup_required: bool
    cleanup_priority: int = 0
    safe_for_citizen_action: bool = True
    special_hazard_warning: Optional[str] = None
    recent_media: List[MediaItem] = []
    previous_health_score: Optional[int] = None
    health_score_reasons: List[str] = []
    follow_up_stage: Optional[str] = None

class Stream(StreamBase):
    historical_health_trend: List[Dict[str, Any]] = []

class AIAnalysis(BaseModel):
    id: str
    observation_id: Optional[str] = None
    timestamp: str
    detected_indicators: List[str]
    observations: List[AIObservationFinding] = []
    overall_concern: Optional[str] = None
    recommended_next_step: Optional[str] = None
    classification: str
    potential_concern: str
    confidence_score: Optional[int] = Field(default=None, ge=0, le=100)
    evidence: List[str]
    human_verification_recommended: bool = True
    rationale: str
    model_used: str
    is_simulated: bool = False
    hazardous_suspicion: bool = False
    safety_notice: Optional[str] = None
    disclaimer: str = "This is an AI-assisted visual estimate and does not replace certified laboratory testing or professional assessment."

class ObservationCreate(BaseModel):
    stream_id: str
    latitude: float
    longitude: float
    water_appearance: WaterAppearanceEnum
    smell: SmellEnum
    visible_litter: bool = False
    litter_type: Optional[str] = None
    algae_present: bool = False
    algae_type: Optional[str] = None
    aquatic_organisms: Optional[str] = None
    vegetation: Optional[str] = None
    unusual_events: Optional[str] = None
    reporter_name: Optional[str] = "Citizen Guardian"
    notes: Optional[str] = None
    photo_base64: Optional[str] = None
    photo_url: Optional[str] = None
    media: List[MediaItem] = []
    is_follow_up: bool = False

class Observation(BaseModel):
    id: str
    stream_id: str
    stream_name: str
    timestamp: str
    latitude: float
    longitude: float
    water_appearance: str
    smell: str
    visible_litter: bool
    litter_type: Optional[str] = None
    algae_present: bool
    algae_type: Optional[str] = None
    aquatic_organisms: Optional[str] = None
    vegetation: Optional[str] = None
    unusual_events: Optional[str] = None
    reporter_name: str
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    media: List[MediaItem] = []
    ai_analysis: Optional[AIAnalysis] = None
    video_analysis: Optional[VideoAnalysisResult] = None
    media_analysis: Optional[MediaAnalysisSummary] = None
    is_follow_up: bool = False

class RiskFactor(BaseModel):
    factor_name: str
    impact: str
    description: str
    evidence: str
    confidence: int

class RiskExplanation(BaseModel):
    stream_id: str
    stream_name: str
    risk_level: str
    health_score: int
    summary: str
    factors: List[RiskFactor]
    overall_confidence: Optional[int] = None
    ai_model_note: str
    recommended_action: str
    disclaimer: str = "AI-assisted risk synthesis. Environmental claims require professional verification."

class RiskAlert(BaseModel):
    id: str
    stream_id: str
    stream_name: str
    title: str
    severity: str # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    timestamp: str
    location_desc: str
    latitude: float
    longitude: float
    observation_count: int
    radius_km: float
    detected_indicators: List[str]
    confidence: int
    recommended_next_step: str
    is_resolved: bool = False
    is_hazardous: bool = False
    media_evidence: List[MediaItem] = []
    media_count_photos: int = 0
    media_count_videos: int = 0

class PollutionCluster(BaseModel):
    id: str
    stream_id: str
    stream_name: str
    title: str
    latitude: float
    longitude: float
    radius_meters: int
    observation_count: int
    timeline_desc: str
    primary_issues: List[str]
    severity: str
    confidence: int
    affected_area_sqm: int
    suggested_cleanup_zone: str
    media_count_photos: int = 0
    media_count_videos: int = 0
    supporting_media: List[MediaItem] = []
    detected_indicators: List[str] = []

class CleanupEventCreate(BaseModel):
    stream_id: str
    title: str
    location_desc: str
    latitude: float
    longitude: float
    date_str: str
    time_str: str
    target_issue: str
    estimated_duration_hours: float
    max_participants: int = 15
    equipment_needed: List[str] = ["Heavy-duty gloves", "Trash bags", "Litter pickers"]
    safety_notes: Optional[str] = None

class CleanupEvent(BaseModel):
    id: str
    stream_id: str
    stream_name: str
    title: str
    location_desc: str
    latitude: float
    longitude: float
    date_str: str
    time_str: str
    status: str # "Upcoming", "Active", "Completed"
    priority_score: int
    priority_level: str
    participants_count: int
    max_participants: int
    target_issue: str
    estimated_duration_hours: float
    equipment_needed: List[str]
    safety_guidelines: List[str]
    is_hazardous_warning: bool = False
    before_photo_url: Optional[str] = None
    after_photo_url: Optional[str] = None
    before_media: List[MediaItem] = []
    after_media: List[MediaItem] = []
    verification_summary: Optional[str] = None
    visual_improvement_pct: Optional[int] = None
    participants: List[str] = []
    priority_evidence: List[str] = []

class CleanupVerificationRequest(BaseModel):
    cleanup_id: str
    before_photo_base64: Optional[str] = None
    after_photo_base64: Optional[str] = None
    before_photo_url: Optional[str] = None
    after_photo_url: Optional[str] = None
    before_media: List[MediaItem] = []
    after_media: List[MediaItem] = []
    volunteer_notes: Optional[str] = None

class CleanupVerification(BaseModel):
    id: str
    cleanup_id: str
    stream_id: str
    timestamp: str
    before_photo_url: str
    after_photo_url: str
    before_media: List[MediaItem] = []
    after_media: List[MediaItem] = []
    before_litter_level: str
    after_litter_level: str
    estimated_visual_improvement_pct: Optional[int] = None
    status: str # "Verified Improvement", "Needs Additional Pass", "Uncertain"
    ai_summary: str
    confidence: Optional[int] = None
    follow_up_recommended: str
    findings: List[AIObservationFinding] = []
    limitations: Optional[str] = None
    disclaimer: str = "This is an AI-assisted visual estimate and does not replace professional environmental assessment."

class ImpactTimelineEvent(BaseModel):
    stage: str
    date_str: str
    health_score: int
    summary: str
    status_badge: str

class ImpactTrackingRecord(BaseModel):
    stream_id: str
    stream_name: str
    initial_detection_score: int
    post_cleanup_score: int
    current_recovered_score: int
    improvement_points: int
    timeline: List[ImpactTimelineEvent]
    ecological_observations: str

class OneHealthInsight(BaseModel):
    id: str
    stream_id: str
    stream_name: str
    title: str
    ecosystem_health: str
    biodiversity_nexus: str
    human_wellbeing_link: str
    cautious_statement: str
    recommended_action: str
    timestamp: str

class UserEcoProfile(BaseModel):
    user_id: str
    name: str
    eco_points: int
    streak_days: int
    badges: List[Dict[str, str]]
    observations_count: int
    cleanups_attended: int

class ChatQueryRequest(BaseModel):
    message: str
    stream_id: Optional[str] = None

class ChatQueryResponse(BaseModel):
    reply: str
    evidence_citations: List[Dict[str, Any]]
    confidence: Optional[int] = None
    suggested_followups: List[str]

class DashboardStats(BaseModel):
    healthy_count: int
    watch_count: int
    at_risk_count: int
    cleanup_required_count: int
    total_streams: int
    total_observations: int
    active_alerts_count: int
    upcoming_cleanups_count: int
    verified_improvements_count: int
    community_volunteers_count: int
    avg_health_score: int
