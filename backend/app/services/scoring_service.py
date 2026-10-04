from typing import Dict, Any, List
from ..models.schemas import StreamIndicators, StreamStatus

class ScoringService:
    """
    Transparent scoring system for Stream Health and Community Cleanup Prioritization.
    Not an official laboratory metric — clearly designated as a Prototype Indicator.
    """

    # Configurable weighting scheme for Stream Health Score (sum to 1.0)
    DEFAULT_WEIGHTS = {
        "water_appearance": 0.25,
        "pollution": 0.25,
        "biodiversity": 0.20,
        "habitat": 0.15,
        "climate_stress": 0.15
    }

    @classmethod
    def calculate_stream_health(cls, indicators: StreamIndicators, weights: Dict[str, float] = None) -> int:
        """
        Computes composite health score 0-100 based on visible and reported indicators.
        """
        w = weights or cls.DEFAULT_WEIGHTS
        score = (
            indicators.water_appearance_score * w.get("water_appearance", 0.25) +
            indicators.pollution_score * w.get("pollution", 0.25) +
            indicators.biodiversity_score * w.get("biodiversity", 0.20) +
            indicators.habitat_score * w.get("habitat", 0.15) +
            indicators.climate_stress_score * w.get("climate_stress", 0.15)
        )
        return int(max(0, min(100, round(score))))

    @classmethod
    def determine_status(cls, health_score: int, cleanup_needed: bool = False, recently_cleaned: bool = False) -> StreamStatus:
        if recently_cleaned:
            return StreamStatus.RECENTLY_CLEANED
        if cleanup_needed and health_score < 70:
            return StreamStatus.CLEANUP_REQUIRED
        if health_score >= 80:
            return StreamStatus.HEALTHY
        elif health_score >= 60:
            return StreamStatus.WATCH
        else:
            return StreamStatus.AT_RISK

    @classmethod
    def calculate_cleanup_priority(
        cls,
        severity_weight: float,       # 0.0 - 1.0 (e.g. hazardous vs plastics)
        observation_count: int,       # number of clustered reports
        persistence_days: int,        # how many days report has persisted
        affected_area_sqm: int,       # estimated area
        ecological_sensitivity: float,# 0.0 - 1.0 (near spawning zones / wetlands)
        community_proximity: float    # 0.0 - 1.0 (near public trails, schools, parks)
    ) -> int:
        """
        Calculates Cleanup Priority Score (0-100).
        Higher score means urgent community intervention is recommended.
        """
        norm_count = min(1.0, observation_count / 10.0)
        norm_persistence = min(1.0, persistence_days / 14.0)
        norm_area = min(1.0, affected_area_sqm / 1000.0)

        raw = (
            severity_weight * 0.30 +
            norm_count * 0.25 +
            norm_persistence * 0.15 +
            norm_area * 0.10 +
            ecological_sensitivity * 0.10 +
            community_proximity * 0.10
        ) * 100

        return int(max(10, min(100, round(raw))))

scoring_service = ScoringService()
