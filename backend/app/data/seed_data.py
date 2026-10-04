from datetime import datetime, timedelta
from ..models.schemas import (
    Stream, StreamStatus, StreamIndicators, Observation, AIAnalysis,
    RiskAlert, PollutionCluster, CleanupEvent, CleanupVerification,
    ImpactTrackingRecord, ImpactTimelineEvent, OneHealthInsight, UserEcoProfile,
    MediaItem, VideoAnalysisResult, VideoTimelineEvent
)

SAMPLE_STREAM_VIDEO_1 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
SAMPLE_STREAM_VIDEO_2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"

# Realistic stream coordinates in an urban watershed (Austin / Lady Bird Lake tributaries)
STREAMS_SEED = [
    Stream(
        id="stream-1",
        name="Mill Creek (Reach B)",
        location_name="Eastside Urban Greenbelt",
        latitude=30.2625,
        longitude=-97.7289,
        health_score=52,
        status=StreamStatus.CLEANUP_REQUIRED,
        length_km=4.8,
        catch_basin_desc="Densely populated residential and commercial runoff basin. Subject to frequent stormwater pulse flows.",
        indicators=StreamIndicators(
            water_appearance_score=48,
            biodiversity_score=54,
            pollution_score=45,
            habitat_score=58,
            climate_stress_score=60
        ),
        recent_observations_count=24,
        last_observation_time="2 hours ago",
        cleanup_required=True,
        cleanup_priority=87,
        safe_for_citizen_action=True,
        special_hazard_warning=None,
        recent_media=[
            MediaItem(
                id="med-101",
                type="image",
                url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
                filename="bridge_culvert_plastic_snag.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80"
            ),
            MediaItem(
                id="med-102",
                type="video",
                url=SAMPLE_STREAM_VIDEO_1,
                filename="mill_creek_reach_flow.mp4",
                duration_seconds=15.0,
                thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"
            ),
            MediaItem(
                id="med-103",
                type="image",
                url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
                filename="bank_litter_bottles.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"
            )
        ],
        historical_health_trend=[
            {"month": "May", "score": 70},
            {"month": "Jun", "score": 66},
            {"month": "Jul", "score": 61},
            {"month": "Aug", "score": 58},
            {"month": "Sep", "score": 54},
            {"month": "Oct", "score": 52},
        ]
    ),
    Stream(
        id="stream-2",
        name="Silver Run",
        location_name="Northside Park Corridor",
        latitude=30.2812,
        longitude=-97.7395,
        health_score=68,
        status=StreamStatus.WATCH,
        length_km=3.2,
        catch_basin_desc="Suburban parkway corridor with moderate canopy cover and seasonal nutrient load from landscaped lawns.",
        indicators=StreamIndicators(
            water_appearance_score=65,
            biodiversity_score=72,
            pollution_score=70,
            habitat_score=68,
            climate_stress_score=64
        ),
        recent_observations_count=12,
        last_observation_time="6 hours ago",
        cleanup_required=False,
        cleanup_priority=42,
        safe_for_citizen_action=True,
        special_hazard_warning=None,
        recent_media=[
            MediaItem(
                id="med-201",
                type="image",
                url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                filename="filamentous_algae_rock.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
            )
        ],
        historical_health_trend=[
            {"month": "May", "score": 75},
            {"month": "Jun", "score": 74},
            {"month": "Jul", "score": 71},
            {"month": "Aug", "score": 69},
            {"month": "Sep", "score": 68},
            {"month": "Oct", "score": 68},
        ]
    ),
    Stream(
        id="stream-3",
        name="Willow Brook",
        location_name="Community Nature Preserve",
        latitude=30.2520,
        longitude=-97.7610,
        health_score=74,
        status=StreamStatus.RECENTLY_CLEANED,
        length_km=5.1,
        catch_basin_desc="Historic tributary recently restored via multi-organization volunteer efforts and native revegetation.",
        indicators=StreamIndicators(
            water_appearance_score=76,
            biodiversity_score=78,
            pollution_score=75,
            habitat_score=72,
            climate_stress_score=70
        ),
        recent_observations_count=18,
        last_observation_time="1 day ago",
        cleanup_required=False,
        cleanup_priority=25,
        safe_for_citizen_action=True,
        special_hazard_warning=None,
        recent_media=[
            MediaItem(
                id="med-301",
                type="image",
                url="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
                filename="restored_willow_reach.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80"
            )
        ],
        historical_health_trend=[
            {"month": "May", "score": 55},
            {"month": "Jun", "score": 54},
            {"month": "Jul", "score": 56},
            {"month": "Aug", "score": 68},
            {"month": "Sep", "score": 72},
            {"month": "Oct", "score": 74},
        ]
    ),
    Stream(
        id="stream-4",
        name="Cedar Creek Sanctuary",
        location_name="Barton Foothills Preserve",
        latitude=30.2390,
        longitude=-97.7850,
        health_score=88,
        status=StreamStatus.HEALTHY,
        length_km=7.4,
        catch_basin_desc="Protected karst limestone spring catchment with mature tree canopy and strict buffer protections.",
        indicators=StreamIndicators(
            water_appearance_score=92,
            biodiversity_score=90,
            pollution_score=88,
            habitat_score=86,
            climate_stress_score=84
        ),
        recent_observations_count=9,
        last_observation_time="Yesterday",
        cleanup_required=False,
        cleanup_priority=15,
        safe_for_citizen_action=True,
        special_hazard_warning=None,
        recent_media=[
            MediaItem(
                id="med-401",
                type="image",
                url="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
                filename="pristine_karst_stream.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80"
            )
        ],
        historical_health_trend=[
            {"month": "May", "score": 86},
            {"month": "Jun", "score": 87},
            {"month": "Jul", "score": 89},
            {"month": "Aug", "score": 88},
            {"month": "Sep", "score": 88},
            {"month": "Oct", "score": 88},
        ]
    ),
    Stream(
        id="stream-5",
        name="Industrial Canal Reach",
        location_name="Warehouse Rail District",
        latitude=30.2710,
        longitude=-97.7120,
        health_score=36,
        status=StreamStatus.AT_RISK,
        length_km=2.8,
        catch_basin_desc="Paved industrial catchment prone to point-source stormwater and solvent discharges.",
        indicators=StreamIndicators(
            water_appearance_score=30,
            biodiversity_score=28,
            pollution_score=32,
            habitat_score=40,
            climate_stress_score=50
        ),
        recent_observations_count=16,
        last_observation_time="3 hours ago",
        cleanup_required=True,
        cleanup_priority=94,
        safe_for_citizen_action=False,
        special_hazard_warning="Suspected petrochemical runoff. Do NOT attempt citizen cleanup. Municipal HAZMAT team alerted.",
        recent_media=[
            MediaItem(
                id="med-501",
                type="image",
                url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
                filename="chemical_sheen_outfall.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80"
            )
        ],
        historical_health_trend=[
            {"month": "May", "score": 45},
            {"month": "Jun", "score": 42},
            {"month": "Jul", "score": 40},
            {"month": "Aug", "score": 38},
            {"month": "Sep", "score": 35},
            {"month": "Oct", "score": 36},
        ]
    )
]

OBSERVATIONS_SEED = [
    Observation(
        id="obs-1",
        stream_id="stream-1",
        stream_name="Mill Creek (Reach B)",
        timestamp="2 hours ago",
        latitude=30.2631,
        longitude=-97.7285,
        water_appearance="Brown / Muddy",
        smell="Musty / Stagnant",
        visible_litter=True,
        litter_type="Plastic bottles, packaging, styrofoam food containers",
        algae_present=True,
        algae_type="Greenish surface scum near eddy",
        aquatic_organisms="No fish observed; two dead minnows on shoreline",
        vegetation="Eroded bank with exposed roots",
        unusual_events="Storm drain culvert overflowing with cloudy silt",
        reporter_name="Elena Rostova (Stream Scout)",
        notes="Trash is caught in fallen branches right below the pedestrian footbridge.",
        photo_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        media=[
            MediaItem(
                id="med-obs-1a",
                type="image",
                url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
                filename="creek_culvert_debris.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80"
            ),
            MediaItem(
                id="med-obs-1b",
                type="video",
                url=SAMPLE_STREAM_VIDEO_1,
                filename="stream_debris_sweep.mp4",
                duration_seconds=15.0,
                thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"
            )
        ],
        ai_analysis=AIAnalysis(
            id="ai-1",
            observation_id="obs-1",
            timestamp="2 hours ago",
            detected_indicators=["Floating plastic waste (91%)", "Elevated turbidity (Brown/Muddy - 76%)", "Algal biofilm (64%)"],
            classification="Moderate-to-High Ecological Stress",
            potential_concern="Hydraulic blockage, microplastic fragmentation, localized dissolved oxygen depletion.",
            confidence_score=82,
            evidence=["High density of visible plastic debris", "Suspended sediment coloration", "Video survey confirms trapped debris dam"],
            human_verification_recommended=True,
            rationale="Visual surface debris trapped in branch dam; combined with turbidity indicates recent urban runoff.",
            model_used="AquaGuardian AI Vision v1.4",
            is_simulated=True
        ),
        video_analysis=VideoAnalysisResult(
            id="vid-ai-1",
            video_id="med-obs-1b",
            duration_seconds=15.0,
            frames_analyzed=8,
            detected_indicators={
                "Plastic waste": 88,
                "Unusual water coloration": 73,
                "Possible algae": 61,
                "Habitat disturbance": 42
            },
            overall_assessment="MODERATE CONCERN",
            evidence_timeline=[
                VideoTimelineEvent(timestamp_sec=2.0, timestamp_str="00:02", detected_issue="Floating plastic waste detected near culvert", confidence=88),
                VideoTimelineEvent(timestamp_sec=6.0, timestamp_str="00:06", detected_issue="Unusual brownish turbidity surge visible", confidence=74),
                VideoTimelineEvent(timestamp_sec=10.0, timestamp_str="00:10", detected_issue="Bank root snag trapping consumer packaging", confidence=83),
                VideoTimelineEvent(timestamp_sec=14.0, timestamp_str="00:14", detected_issue="Stagnant algal film near shoreline eddy", confidence=62)
            ]
        )
    ),
    Observation(
        id="obs-2",
        stream_id="stream-1",
        stream_name="Mill Creek (Reach B)",
        timestamp="4 hours ago",
        latitude=30.2621,
        longitude=-97.7292,
        water_appearance="Cloudy / Turbid",
        smell="None / Natural Earthy",
        visible_litter=True,
        litter_type="Plastic shopping bags, beverage cans",
        algae_present=False,
        aquatic_organisms="Several water striders observed",
        vegetation="Dense reed growth",
        unusual_events="None",
        reporter_name="Marcus Vance",
        notes="Litter accumulating along the south bank bend.",
        photo_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        media=[
            MediaItem(
                id="med-obs-2",
                type="image",
                url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
                filename="south_bank_plastics.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"
            )
        ],
        ai_analysis=AIAnalysis(
            id="ai-2",
            observation_id="obs-2",
            timestamp="4 hours ago",
            detected_indicators=["Single-use packaging litter", "Mild cloudiness"],
            classification="Riparian Litter Accumulation",
            potential_concern="Entanglement risk for local waterfowl; microplastic breakdown.",
            confidence_score=84,
            evidence=["Photographic record of stranded polymer bags", "Cloudy water tint"],
            human_verification_recommended=True,
            rationale="Visible plastic items match standard consumer packaging categories.",
            model_used="AquaGuardian AI Vision v1.4",
            is_simulated=True
        )
    ),
    Observation(
        id="obs-3",
        stream_id="stream-2",
        stream_name="Silver Run",
        timestamp="6 hours ago",
        latitude=30.2818,
        longitude=-97.7390,
        water_appearance="Green / Algal Tint",
        smell="Musty / Stagnant",
        visible_litter=False,
        algae_present=True,
        algae_type="Filamentous green algae along shallow rocks",
        aquatic_organisms="Small sunfish active in deeper pool",
        vegetation="Healthy cattails and willow saplings",
        unusual_events=None,
        reporter_name="Dr. Maya Patel",
        notes="Algal cover seems higher than last week, likely from sunny weather and fertilizer runoff.",
        photo_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        media=[
            MediaItem(
                id="med-obs-3",
                type="image",
                url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                filename="silver_run_algae.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
            )
        ],
        ai_analysis=AIAnalysis(
            id="ai-3",
            observation_id="obs-3",
            timestamp="6 hours ago",
            detected_indicators=["Filamentous algae growth", "Greenish optical reflectance"],
            classification="Mild Eutrophication Watch",
            potential_concern="Potential nighttime dissolved oxygen sag if bloom expands.",
            confidence_score=79,
            evidence=["Green hue spectrum match", "Reported seasonal fertilizer context"],
            human_verification_recommended=True,
            rationale="Elevated sun exposure and ambient temperature fostering benthic algae mats.",
            model_used="AquaGuardian AI Vision v1.4",
            is_simulated=True
        )
    ),
    Observation(
        id="obs-4",
        stream_id="stream-5",
        stream_name="Industrial Canal Reach",
        timestamp="3 hours ago",
        latitude=30.2714,
        longitude=-97.7125,
        water_appearance="Unusual Chemical Sheen / Discolored",
        smell="Chemical / Solvent",
        visible_litter=False,
        algae_present=False,
        aquatic_organisms="Zero visible fauna",
        vegetation="Yellowed and dying bank grass",
        unusual_events="Rainbow sheen drifting from storm outlet pipe",
        reporter_name="Samir Khan",
        notes="Strong kerosene or solvent smell near the culvert. Water has rainbow swirls.",
        photo_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        media=[
            MediaItem(
                id="med-obs-4",
                type="image",
                url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
                filename="hydrocarbon_film_culvert.jpg",
                thumbnail_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80"
            )
        ],
        ai_analysis=AIAnalysis(
            id="ai-4",
            observation_id="obs-4",
            timestamp="3 hours ago",
            detected_indicators=["Thin-film hydrocarbon iridescence", "Solvent sensory warning", "Riparian phytotoxicity"],
            classification="Suspected Hazardous Contaminant / Industrial Discharge",
            potential_concern="Acute aquatic toxicity. Volatile organic compounds. Fire and inhalation risk.",
            confidence_score=88,
            evidence=["Rainbow optical diffraction typical of petroleum hydrocarbons", "Strong solvent odor logged by citizen"],
            human_verification_recommended=True,
            rationale="CRITICAL WARNING: Hydrocarbon sheen requires municipal HAZMAT remediation. Citizen volunteers strictly barred.",
            model_used="AquaGuardian AI Vision v1.4",
            is_simulated=True
        )
    )
]

ALERTS_SEED = [
    RiskAlert(
        id="alert-1",
        stream_id="stream-1",
        stream_name="Mill Creek (Reach B)",
        title="POTENTIAL POLLUTION EVENT — Clustered Solid Waste & Runoff",
        severity="HIGH",
        timestamp="Today at 10:15 AM",
        location_desc="Zone B (Footbridge to 12th St. Culvert)",
        latitude=30.2625,
        longitude=-97.7289,
        observation_count=17,
        radius_km=1.2,
        detected_indicators=[
            "Unusual water appearance (Turbid brown)",
            "Accumulated consumer plastics and styrofoam",
            "Musty stagnant odor"
        ],
        confidence=82,
        recommended_next_step="Human verification and community cleanup mobilization recommended. No chemical hazard flags.",
        is_resolved=False,
        is_hazardous=False,
        media_count_photos=12,
        media_count_videos=4,
        media_evidence=[
            MediaItem(id="med-alt-1", type="image", url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80", filename="plastic_snag_1.jpg", thumbnail_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80"),
            MediaItem(id="med-alt-2", type="image", url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80", filename="plastic_snag_2.jpg", thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"),
            MediaItem(id="med-alt-3", type="video", url=SAMPLE_STREAM_VIDEO_1, filename="cluster_debris_pan.mp4", duration_seconds=15.0, thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80")
        ]
    ),
    RiskAlert(
        id="alert-2",
        stream_id="stream-5",
        stream_name="Industrial Canal Reach",
        title="HAZARDOUS CONTAMINATION DETECTED — Volatile Chemical Sheen",
        severity="CRITICAL",
        timestamp="Today at 11:45 AM",
        location_desc="Culvert Discharge Point #4",
        latitude=30.2710,
        longitude=-97.7120,
        observation_count=6,
        radius_km=0.6,
        detected_indicators=[
            "Petroleum hydrocarbon rainbow sheen",
            "Chemical/solvent vapor odor",
            "Riparian vegetation chlorosis"
        ],
        confidence=88,
        recommended_next_step="Municipal Environmental Protection Division dispatch requested. Citizen entry PROHIBITED.",
        is_resolved=False,
        is_hazardous=True,
        media_count_photos=5,
        media_count_videos=1,
        media_evidence=[
            MediaItem(id="med-alt-4", type="image", url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80", filename="petroleum_sheen.jpg", thumbnail_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80")
        ]
    ),
    RiskAlert(
        id="alert-3",
        stream_id="stream-2",
        stream_name="Silver Run",
        title="MICROCLIMATE RUNOFF ADVISORY — Elevated Turbidity",
        severity="MEDIUM",
        timestamp="Yesterday at 4:30 PM",
        location_desc="North Parkway Reach",
        latitude=30.2812,
        longitude=-97.7395,
        observation_count=8,
        radius_km=0.9,
        detected_indicators=[
            "Suspended sediment wash-off",
            "Localized benthic algal patches"
        ],
        confidence=74,
        recommended_next_step="Continue routine passive monitoring. Check water clarity in 48 hours.",
        is_resolved=False,
        is_hazardous=False,
        media_count_photos=7,
        media_count_videos=2,
        media_evidence=[
            MediaItem(id="med-alt-5", type="image", url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", filename="algae_run.jpg", thumbnail_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80")
        ]
    )
]

CLUSTERS_SEED = [
    PollutionCluster(
        id="cluster-1",
        stream_id="stream-1",
        stream_name="Mill Creek (Reach B)",
        title="Dense Riparian Litter & Sediment Cluster",
        latitude=30.2628,
        longitude=-97.7288,
        radius_meters=350,
        observation_count=17,
        timeline_desc="17 corroborating citizen observations logged within 72 hours",
        primary_issues=["Single-use plastics", "Styrofoam debris", "Culvert sediment runoff", "Branch dam snag"],
        severity="HIGH",
        confidence=84,
        affected_area_sqm=450,
        suggested_cleanup_zone="150m upstream and downstream of pedestrian footbridge",
        media_count_photos=12,
        media_count_videos=4
    ),
    PollutionCluster(
        id="cluster-2",
        stream_id="stream-5",
        stream_name="Industrial Canal Reach",
        title="Petrochemical Outfall Cluster (HAZMAT Alert)",
        latitude=30.2712,
        longitude=-97.7122,
        radius_meters=200,
        observation_count=6,
        timeline_desc="6 urgent reports logged since 9:00 AM",
        primary_issues=["Chemical sheen", "Solvent odor", "Dead aquatic vegetation"],
        severity="CRITICAL",
        confidence=89,
        affected_area_sqm=300,
        suggested_cleanup_zone="Requires certified hazardous materials remediation contractor",
        media_count_photos=5,
        media_count_videos=1
    )
]

CLEANUP_EVENTS_SEED = [
    CleanupEvent(
        id="cleanup-1",
        stream_id="stream-1",
        stream_name="Mill Creek (Reach B)",
        title="Saturday Mill Creek Community Stream Action",
        location_desc="Mill Creek Reach B (Meet at Greenbelt Trailhead)",
        latitude=30.2625,
        longitude=-97.7289,
        date_str="This Saturday, Oct 11",
        time_str="09:00 AM - 11:30 AM",
        status="Upcoming",
        priority_score=87,
        priority_level="HIGH PRIORITY",
        participants_count=8,
        max_participants=15,
        target_issue="Dense floating plastic packaging, bottles, and foam trapped in branch snags.",
        estimated_duration_hours=2.5,
        equipment_needed=["Thick puncture-resistant gloves", "Heavy-duty biodegradable bags", "Reach litter grabbers", "Rubber waders (optional)"],
        safety_guidelines=[
            "Do NOT enter water above knee height or fast-moving currents.",
            "Wear heavy-duty puncture-resistant gloves at all times.",
            "If any sharps, chemical containers, or sealed barrels are spotted, tag them and notify event leads immediately.",
            "Stay hydrated and apply sun protection."
        ],
        is_hazardous_warning=False,
        before_photo_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        after_photo_url=None,
        before_media=[
            MediaItem(id="med-cl-1", type="image", url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80", filename="before_mill_creek.jpg", thumbnail_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80"),
            MediaItem(id="med-cl-1v", type="video", url=SAMPLE_STREAM_VIDEO_1, filename="before_survey.mp4", duration_seconds=15.0, thumbnail_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80")
        ],
        after_media=[],
        verification_summary=None,
        visual_improvement_pct=None
    ),
    CleanupEvent(
        id="cleanup-2",
        stream_id="stream-3",
        stream_name="Willow Brook",
        title="Willow Brook Riparian Restoration & Snag Removal",
        location_desc="Willow Brook Nature Preserve Crossing",
        latitude=30.2520,
        longitude=-97.7610,
        date_str="Completed Last Weekend",
        time_str="08:30 AM - 11:00 AM",
        status="Completed",
        priority_score=25,
        priority_level="COMPLETED",
        participants_count=14,
        max_participants=15,
        target_issue="Accumulated park litter and plastic wrappers along 200m reach.",
        estimated_duration_hours=2.5,
        equipment_needed=["Gloves", "Bags", "Trash pickers"],
        safety_guidelines=["Completed safely with zero injuries."],
        is_hazardous_warning=False,
        before_photo_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        after_photo_url="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
        before_media=[
            MediaItem(id="med-cl-2b", type="image", url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80", filename="willow_before.jpg", thumbnail_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80")
        ],
        after_media=[
            MediaItem(id="med-cl-2a", type="image", url="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", filename="willow_after.jpg", thumbnail_url="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80")
        ],
        verification_summary="Verified by AI Visual Differential Analysis: 78% reduction in visible anthropogenic litter.",
        visual_improvement_pct=78
    )
]

CLEANUP_VERIFICATIONS_SEED = [
    CleanupVerification(
        id="verif-1",
        cleanup_id="cleanup-2",
        stream_id="stream-3",
        timestamp="3 days ago",
        before_photo_url="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        after_photo_url="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
        before_litter_level="High visible litter (Bottles, bags, cans snagged across rocks)",
        after_litter_level="Clear shoreline, native riparian grasses unobstructed, unobstructed streamflow",
        estimated_visual_improvement_pct=78,
        status="Verified Improvement",
        ai_summary="AI comparison detects a 78% reduction in visible anthropogenic debris. Channel hydraulics improved with zero plastic obstructions noted.",
        confidence=86,
        follow_up_recommended="Passive photo check in 7 days to observe post-cleanup vegetation re-emergence.",
        disclaimer="This is an AI-assisted visual estimate and does not replace professional environmental assessment."
    )
]

IMPACT_RECORDS_SEED = [
    ImpactTrackingRecord(
        stream_id="stream-3",
        stream_name="Willow Brook",
        initial_detection_score=54,
        post_cleanup_score=68,
        current_recovered_score=74,
        improvement_points=20,
        timeline=[
            ImpactTimelineEvent(
                stage="Detection",
                date_str="Sep 12",
                health_score=54,
                summary="Citizen observations with photo/video evidence identified severe litter accumulation and stagnation.",
                status_badge="Alert Triggered"
            ),
            ImpactTimelineEvent(
                stage="Cleanup",
                date_str="Sep 20",
                health_score=60,
                summary="14 community volunteers mobilized; removed ~180 kg of solid plastic waste.",
                status_badge="Action Completed"
            ),
            ImpactTimelineEvent(
                stage="Verification",
                date_str="Sep 21",
                health_score=68,
                summary="AI visual differential confirmed 78% debris removal from shoreline.",
                status_badge="AI Verified"
            ),
            ImpactTimelineEvent(
                stage="Follow-up",
                date_str="Sep 28",
                health_score=71,
                summary="Citizen follow-up observation logged return of dragonfly nymphs and minnows.",
                status_badge="Monitoring Active"
            ),
            ImpactTimelineEvent(
                stage="Recovery",
                date_str="Oct 02",
                health_score=74,
                summary="Water appearance normal; biodiversity index showing steady recovery trajectory.",
                status_badge="Sustained Health"
            )
        ],
        ecological_observations="Riparian vegetative buffer recovering. Biofilm and water clarity improved significantly after removing stagnant waste dams."
    )
]

ONE_HEALTH_INSIGHTS_SEED = [
    OneHealthInsight(
        id="oh-1",
        stream_id="stream-1",
        stream_name="Mill Creek (Reach B)",
        title="Urban Watershed Microplastics & Riparian Nexus",
        ecosystem_health="Plastic accumulation physically chokes shallow riffles, reducing natural re-aeration and altering sediment microbial communities.",
        biodiversity_nexus="Macroinvertebrate surveys indicate absence of sensitive ephemeroptera (mayflies); microplastic ingestion risk elevated for urban waterfowl.",
        human_wellbeing_link="Mill Creek runs through a high-density community park. Stagnant litter pockets generate odor complaints and increase disease-vector mosquito breeding habitats.",
        cautious_statement="Observational evidence indicates ecological stress. While elevated mosquito presence is noted, direct public health disease transmission has not been clinically confirmed.",
        recommended_action="Execute volunteer cleanup this Saturday; install upstream gross pollutant traps; expand community awareness on stormwater runoff.",
        timestamp="Generated Today"
    ),
    OneHealthInsight(
        id="oh-2",
        stream_id="stream-3",
        stream_name="Willow Brook",
        title="Community Restoration & Recreational Wellbeing",
        ecosystem_health="Clearing solid waste obstructions restored natural hydraulic riffle-pool sequences and re-established native stream aeration.",
        biodiversity_nexus="Post-cleanup monitoring documented return of native dragonfly larvae (sentinel ecological indicator) within 14 days.",
        human_wellbeing_link="Revitalized trail corridor reported a 40% increase in weekly walking and outdoor recreation among local families and senior residents.",
        cautious_statement="Improvements reflect visual and macroinvertebrate indicators; ongoing chemical baseline sampling is scheduled with municipal partners.",
        recommended_action="Maintain monthly citizen monitoring rounds; plant native willow cuttings along destabilized bank sections.",
        timestamp="Updated 2 days ago"
    )
]

CURRENT_USER_PROFILE = UserEcoProfile(
    user_id="user-current",
    name="Alex Rivera",
    eco_points=420,
    streak_days=6,
    badges=[
        {"name": "First Observation", "icon": "🌱", "desc": "Submitted first verified citizen stream observation"},
        {"name": "Stream Guardian", "icon": "🛡️", "desc": "Monitored a stream reach continuously for 5+ days"},
        {"name": "Cleanup Champion", "icon": "🧹", "desc": "Participated in a verified community waterway cleanup"},
        {"name": "Citizen Scientist", "icon": "🔬", "desc": "Contributed 10+ corroborating environmental reports"}
    ],
    observations_count=14,
    cleanups_attended=2
)
