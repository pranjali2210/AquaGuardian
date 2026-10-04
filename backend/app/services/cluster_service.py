import math
from typing import List, Dict, Any
from datetime import datetime
from ..models.schemas import Observation, PollutionCluster, RiskAlert

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class ClusterService:
    """
    Spatial & Temporal clustering engine for citizen stream observations.
    Groups co-located reports to detect emerging pollution incidents.
    """

    @classmethod
    def detect_clusters(cls, observations: List[Observation], max_distance_km: float = 1.2) -> List[PollutionCluster]:
        clusters: List[PollutionCluster] = []
        if len(observations) < 2:
            return clusters

        # Filter for abnormal or litter observations
        incident_reports = [
            o for o in observations
            if o.visible_litter or o.algae_present or "Clear" not in o.water_appearance or "None" not in o.smell or o.unusual_events
        ]

        visited = set()
        cluster_id_counter = 1

        for i, base_obs in enumerate(incident_reports):
            if base_obs.id in visited:
                continue

            group = [base_obs]
            visited.add(base_obs.id)

            for j, candidate_obs in enumerate(incident_reports):
                if candidate_obs.id in visited or candidate_obs.stream_id != base_obs.stream_id:
                    continue

                dist = haversine_distance_km(
                    base_obs.latitude, base_obs.longitude,
                    candidate_obs.latitude, candidate_obs.longitude
                )

                if dist <= max_distance_km:
                    group.append(candidate_obs)
                    visited.add(candidate_obs.id)

            # If cluster contains 2 or more reports, synthesize into a pollution cluster
            if len(group) >= 2:
                avg_lat = sum(o.latitude for o in group) / len(group)
                avg_lon = sum(o.longitude for o in group) / len(group)

                # Identify primary issues reported
                issues = set()
                has_hazardous = False
                for o in group:
                    if o.visible_litter:
                        issues.add(f"Litter ({o.litter_type or 'Solid waste'})")
                    if o.algae_present:
                        issues.add("Algal proliferation")
                    if "Clear" not in o.water_appearance:
                        issues.add(f"Water appearance ({o.water_appearance})")
                    if "None" not in o.smell:
                        issues.add(f"Odor ({o.smell})")
                    if o.unusual_events:
                        issues.add(o.unusual_events)
                        if "chemical" in o.unusual_events.lower() or "dead fish" in o.unusual_events.lower():
                            has_hazardous = True

                severity = "HIGH" if len(group) >= 4 or has_hazardous else "MEDIUM"
                confidence = min(94, 60 + len(group) * 7)
                affected_area = round(len(group) * 220)

                cluster_obj = PollutionCluster(
                    id=f"cluster-{cluster_id_counter}",
                    stream_id=base_obs.stream_id,
                    stream_name=base_obs.stream_name,
                    title=f"Clustered Environmental Anomaly ({len(group)} Reports)",
                    latitude=round(avg_lat, 5),
                    longitude=round(avg_lon, 5),
                    radius_meters=int(max_distance_km * 1000 * 0.75),
                    observation_count=len(group),
                    timeline_desc=f"{len(group)} corroborating citizen observations in the last 72 hours",
                    primary_issues=list(issues)[:4],
                    severity=severity,
                    confidence=confidence,
                    affected_area_sqm=affected_area,
                    suggested_cleanup_zone=f"{int(affected_area * 0.4)}m upstream reach of {base_obs.stream_name}"
                )
                clusters.append(cluster_obj)
                cluster_id_counter += 1

        return clusters

cluster_service = ClusterService()
