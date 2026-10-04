import copy
import threading
from typing import List, Optional, Dict, Any
from datetime import datetime

from .seed_data import (
    STREAMS_SEED, OBSERVATIONS_SEED, ALERTS_SEED, CLUSTERS_SEED,
    CLEANUP_EVENTS_SEED, CLEANUP_VERIFICATIONS_SEED, IMPACT_RECORDS_SEED,
    ONE_HEALTH_INSIGHTS_SEED, CURRENT_USER_PROFILE
)
from ..models.schemas import (
    Stream, Observation, RiskAlert, PollutionCluster, CleanupEvent,
    CleanupVerification, ImpactTrackingRecord, OneHealthInsight,
    UserEcoProfile, DashboardStats, AIAnalysis, StreamStatus
)
from ..services.cluster_service import cluster_service
from ..services.scoring_service import scoring_service

class Database:
    """Thread-safe in-memory database with realistic seed state and live dynamic updating."""

    def __init__(self):
        self._lock = threading.Lock()
        self.reset()

    def reset(self):
        with getattr(self, '_lock', threading.Lock()):
            self.streams: Dict[str, Stream] = {s.id: copy.deepcopy(s) for s in STREAMS_SEED}
            self.observations: List[Observation] = [copy.deepcopy(o) for o in OBSERVATIONS_SEED]
            self.alerts: List[RiskAlert] = [copy.deepcopy(a) for a in ALERTS_SEED]
            self.clusters: List[PollutionCluster] = [copy.deepcopy(c) for c in CLUSTERS_SEED]
            self.cleanups: Dict[str, CleanupEvent] = {c.id: copy.deepcopy(c) for c in CLEANUP_EVENTS_SEED}
            self.verifications: List[CleanupVerification] = [copy.deepcopy(v) for v in CLEANUP_VERIFICATIONS_SEED]
            self.impact_records: Dict[str, ImpactTrackingRecord] = {r.stream_id: copy.deepcopy(r) for r in IMPACT_RECORDS_SEED}
            self.one_health_insights: List[OneHealthInsight] = [copy.deepcopy(h) for h in ONE_HEALTH_INSIGHTS_SEED]
            self.user_profile: UserEcoProfile = copy.deepcopy(CURRENT_USER_PROFILE)


    # Streams
    def get_all_streams(self) -> List[Stream]:
        with self._lock:
            return list(self.streams.values())

    def get_stream(self, stream_id: str) -> Optional[Stream]:
        with self._lock:
            return self.streams.get(stream_id)

    # Observations
    def get_all_observations(self, stream_id: Optional[str] = None) -> List[Observation]:
        with self._lock:
            if stream_id:
                return [o for o in self.observations if o.stream_id == stream_id]
            return list(self.observations)

    def add_observation(self, obs: Observation) -> Observation:
        with self._lock:
            self.observations.insert(0, obs)
            # Update stream stats
            if obs.stream_id in self.streams:
                st = self.streams[obs.stream_id]
                st.recent_observations_count += 1
                st.last_observation_time = "Just now"

                # Update stream indicators slightly based on report
                if obs.visible_litter:
                    st.indicators.pollution_score = max(20, st.indicators.pollution_score - 4)
                if "Clear" not in obs.water_appearance:
                    st.indicators.water_appearance_score = max(20, st.indicators.water_appearance_score - 5)
                
                # Recalculate health score
                st.health_score = scoring_service.calculate_stream_health(st.indicators)
                st.status = scoring_service.determine_status(st.health_score, st.cleanup_required)

            # Award Eco Points to current user
            self.user_profile.eco_points += 25
            self.user_profile.observations_count += 1

            # Check for new clusters
            new_clusters = cluster_service.detect_clusters(self.observations)
            if new_clusters:
                self.clusters = new_clusters

            return obs

    # Alerts
    def get_alerts(self, stream_id: Optional[str] = None) -> List[RiskAlert]:
        with self._lock:
            if stream_id:
                return [a for a in self.alerts if a.stream_id == stream_id]
            return list(self.alerts)

    def add_alert(self, alert: RiskAlert) -> RiskAlert:
        with self._lock:
            self.alerts.insert(0, alert)
            return alert

    # Clusters
    def get_clusters(self) -> List[PollutionCluster]:
        with self._lock:
            return list(self.clusters)

    # Cleanups
    def get_all_cleanups(self) -> List[CleanupEvent]:
        with self._lock:
            return list(self.cleanups.values())

    def get_cleanup(self, cleanup_id: str) -> Optional[CleanupEvent]:
        with self._lock:
            return self.cleanups.get(cleanup_id)

    def join_cleanup(self, cleanup_id: str) -> Optional[CleanupEvent]:
        with self._lock:
            if cleanup_id in self.cleanups:
                event = self.cleanups[cleanup_id]
                if event.participants_count < event.max_participants:
                    event.participants_count += 1
                    self.user_profile.eco_points += 50
                    self.user_profile.cleanups_attended += 1
                return event
            return None

    def add_cleanup(self, event: CleanupEvent) -> CleanupEvent:
        with self._lock:
            self.cleanups[event.id] = event
            return event

    def save_verification(self, verif: CleanupVerification) -> CleanupVerification:
        with self._lock:
            self.verifications.insert(0, verif)
            if verif.cleanup_id in self.cleanups:
                cl = self.cleanups[verif.cleanup_id]
                cl.status = "Completed"
                cl.after_photo_url = verif.after_photo_url
                cl.verification_summary = verif.ai_summary
                cl.visual_improvement_pct = verif.estimated_visual_improvement_pct

                # Update stream status to Recently Cleaned and boost health score
                if cl.stream_id in self.streams:
                    st = self.streams[cl.stream_id]
                    st.status = StreamStatus.RECENTLY_CLEANED
                    st.indicators.pollution_score = min(95, st.indicators.pollution_score + 25)
                    st.indicators.water_appearance_score = min(95, st.indicators.water_appearance_score + 15)
                    st.health_score = scoring_service.calculate_stream_health(st.indicators)
                    st.cleanup_required = False

            self.user_profile.eco_points += 100
            return verif

    # Impact Tracking
    def get_impact_records(self) -> List[ImpactTrackingRecord]:
        with self._lock:
            return list(self.impact_records.values())

    def get_stream_impact(self, stream_id: str) -> Optional[ImpactTrackingRecord]:
        with self._lock:
            return self.impact_records.get(stream_id)

    # One Health
    def get_one_health_insights(self, stream_id: Optional[str] = None) -> List[OneHealthInsight]:
        with self._lock:
            if stream_id:
                return [h for h in self.one_health_insights if h.stream_id == stream_id]
            return list(self.one_health_insights)

    # User Profile
    def get_user_profile(self) -> UserEcoProfile:
        with self._lock:
            return copy.deepcopy(self.user_profile)

    # Dashboard Statistics
    def get_dashboard_stats(self) -> DashboardStats:
        with self._lock:
            all_streams = list(self.streams.values())
            healthy = sum(1 for s in all_streams if s.status == StreamStatus.HEALTHY)
            watch = sum(1 for s in all_streams if s.status == StreamStatus.WATCH)
            at_risk = sum(1 for s in all_streams if s.status == StreamStatus.AT_RISK)
            cleanup_req = sum(1 for s in all_streams if s.status == StreamStatus.CLEANUP_REQUIRED)
            
            avg_score = int(sum(s.health_score for s in all_streams) / len(all_streams)) if all_streams else 0
            active_alerts = sum(1 for a in self.alerts if not a.is_resolved)
            upcoming = sum(1 for c in self.cleanups.values() if c.status == "Upcoming")

            return DashboardStats(
                healthy_count=healthy,
                watch_count=watch,
                at_risk_count=at_risk,
                cleanup_required_count=cleanup_req,
                total_streams=len(all_streams),
                total_observations=len(self.observations),
                active_alerts_count=active_alerts,
                upcoming_cleanups_count=upcoming,
                verified_improvements_count=len(self.verifications),
                community_volunteers_count=84,
                avg_health_score=avg_score
            )

db = Database()
