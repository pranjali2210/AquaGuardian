import asyncio
import pytest
from backend.app.models.schemas import ObservationCreate, WaterAppearanceEnum, SmellEnum
from backend.app.services.ai_service import ai_service
from backend.app.services.scoring_service import scoring_service, StreamIndicators

def test_ai_observation_synthesis():
    obs = ObservationCreate(
        stream_id="stream-1",
        latitude=30.26,
        longitude=-97.72,
        water_appearance=WaterAppearanceEnum.UNUSUAL,
        smell=SmellEnum.CHEMICAL,
        visible_litter=True,
        litter_type="Drums / Cans",
        unusual_events="Chemical sheen"
    )
    result = asyncio.run(ai_service.analyze_observation(obs, "Test Stream"))
    assert "Chemical" in result.classification or "Hazard" in result.classification
    assert result.human_verification_recommended is True
    assert "laboratory" in result.disclaimer.lower()


def test_scoring_service():
    indicators = StreamIndicators(
        water_appearance_score=80,
        biodiversity_score=80,
        pollution_score=80,
        habitat_score=80,
        climate_stress_score=80
    )
    score = scoring_service.calculate_stream_health(indicators)
    assert score == 80

    priority = scoring_service.calculate_cleanup_priority(
        severity_weight=0.9,
        observation_count=12,
        persistence_days=6,
        affected_area_sqm=500,
        ecological_sensitivity=0.8,
        community_proximity=0.9
    )
    assert priority >= 70
