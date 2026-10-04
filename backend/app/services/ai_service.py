import base64
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx
from PIL import Image

from ..config import settings
from ..exceptions import GroqUnavailableError
from ..models.schemas import (
    AIAnalysis,
    AIObservationFinding,
    ChatQueryResponse,
    CleanupVerification,
    MediaAnalysisSummary,
    MediaItem,
    ObservationCreate,
    RiskExplanation,
    RiskFactor,
    Stream,
    VideoAnalysisResult,
    VideoTimelineEvent,
)
from .groq_client import groq_chat
from .media_service import media_service

RESPONSIBLE_AI_RULES = """
You are AquaGuardian, an AI-assisted urban freshwater visual assessment system.

Language rules:
- Use cautious wording: "Potential indicator", "Possible concern", "Visible evidence", "AI-assisted assessment", "Requires verification".
- Do NOT claim that photos/videos prove chemical contamination, toxicity, disease, a specific pollutant identity, or unsafe drinking water unless verified scientific measurements are present in the media (they will not be).
- Do not instruct citizens to handle suspected hazardous material.
- Only report what is visibly present. If uncertain, lower confidence and recommend human review.
- confidence must be your actual estimated confidence as a number between 0 and 1. Do not invent extra decimal precision.
"""

VISION_JSON_SCHEMA = """
Return ONLY valid JSON:
{
  "observations": [
    {
      "category": "water|visible_waste|biological|habitat|anomaly",
      "finding": "short visible finding",
      "confidence": 0.0,
      "evidence": "what is visible"
    }
  ],
  "overall_concern": "low|moderate|high",
  "summary": "concise AI-assisted assessment",
  "recommended_next_step": "practical next step",
  "requires_human_review": true,
  "hazardous_suspicion": false,
  "hazardous_reason": null
}

Look for visible indicators only:
Water: unusual coloration, cloudy/turbid appearance, foam, surface film, visible particles.
Waste: plastic, bottles, bags, cans, floating waste, shoreline litter.
Biological: visible algae, aquatic vegetation, visible organisms, dead fish if clearly visible.
Habitat: erosion, damaged vegetation, disturbed banks, debris, blocked flow.
Other: unusual discharge, visible pollution indicators, construction disturbance.
"""

ALLOWED_CATEGORIES = {"water", "visible_waste", "biological", "habitat", "anomaly"}
ALLOWED_CONCERN = {"low", "moderate", "high"}


def _format_timestamp(seconds: float) -> str:
    total = max(0, int(round(seconds)))
    return f"{total // 60:02d}:{total % 60:02d}"


def _clip_confidence(value: Any) -> Optional[float]:
    try:
        conf = float(value)
    except (TypeError, ValueError):
        return None
    if conf > 1.0 and conf <= 100.0:
        conf = conf / 100.0
    if conf < 0.0 or conf > 1.0:
        return None
    return round(conf, 4)


def validate_structured_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        raise GroqUnavailableError("AI analysis returned invalid JSON. Please retry the assessment.")

    raw_obs = payload.get("observations")
    if not isinstance(raw_obs, list):
        raise GroqUnavailableError("AI analysis returned malformed JSON. Please retry the assessment.")

    findings: List[AIObservationFinding] = []
    for item in raw_obs:
        if not isinstance(item, dict):
            continue
        conf = _clip_confidence(item.get("confidence"))
        if conf is None:
            continue
        category = str(item.get("category") or "anomaly").strip().lower().replace(" ", "_")
        if category not in ALLOWED_CATEGORIES:
            category = "anomaly"
        finding = str(item.get("finding") or "").strip()
        evidence = str(item.get("evidence") or "").strip()
        if not finding or not evidence:
            continue
        findings.append(
            AIObservationFinding(
                category=category,
                finding=finding,
                confidence=conf,
                evidence=evidence,
            )
        )

    concern = str(payload.get("overall_concern") or "").strip().lower()
    if concern not in ALLOWED_CONCERN:
        concern = "moderate" if findings else "low"

    summary = str(payload.get("summary") or "").strip()
    if not summary:
        raise GroqUnavailableError("AI analysis returned incomplete JSON. Please retry the assessment.")

    next_step = str(payload.get("recommended_next_step") or "Requires verification by a human reviewer.").strip()
    requires_review = bool(payload.get("requires_human_review", True))
    hazardous = bool(payload.get("hazardous_suspicion", False))
    hazardous_reason = payload.get("hazardous_reason")
    hazardous_reason = str(hazardous_reason).strip() if hazardous_reason else None

    return {
        "findings": findings,
        "overall_concern": concern,
        "summary": summary,
        "recommended_next_step": next_step,
        "requires_human_review": requires_review,
        "hazardous_suspicion": hazardous,
        "hazardous_reason": hazardous_reason,
    }


def mean_confidence_pct(findings: List[AIObservationFinding]) -> Optional[int]:
    if not findings:
        return None
    avg = sum(f.confidence for f in findings) / len(findings)
    return int(round(avg * 100))


def concern_to_classification(concern: str) -> str:
    mapping = {
        "low": "Low visible stress (AI-assisted assessment)",
        "moderate": "Moderate visible concern (AI-assisted assessment)",
        "high": "High visible concern (AI-assisted assessment)",
    }
    return mapping.get(concern, "AI-assisted visual assessment")


def encode_image_path(path: Path) -> str:
    try:
        with Image.open(path) as img:
            img = img.convert("RGB")
            img.thumbnail((1280, 1280))
            buf = BytesIO()
            img.save(buf, format="JPEG", quality=80)
            b64 = base64.b64encode(buf.getvalue()).decode("ascii")
            return f"data:image/jpeg;base64,{b64}"
    except Exception as exc:
        raise GroqUnavailableError("Invalid image. The file could not be prepared for AI analysis.") from exc


async def encode_remote_image(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            res = await client.get(url)
        if res.status_code != 200:
            raise GroqUnavailableError("Invalid image. The remote photo could not be retrieved for AI analysis.")
        try:
            img = Image.open(BytesIO(res.content))
            img = img.convert("RGB")
            img.thumbnail((1280, 1280))
            buf = BytesIO()
            img.save(buf, format="JPEG", quality=80)
        except Exception as exc:
            raise GroqUnavailableError("Invalid image. The file could not be prepared for AI analysis.") from exc
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"
    except GroqUnavailableError:
        raise
    except Exception as exc:
        raise GroqUnavailableError("Invalid image. The remote photo could not be retrieved for AI analysis.") from exc


async def media_to_data_url(item: MediaItem) -> str:
    if item.url.startswith("data:image/"):
        if ";base64," not in item.url:
            raise GroqUnavailableError("Invalid image. The uploaded image data could not be read for AI analysis.")
        return item.url
    local = media_service.get_media_path(item.url)
    if local:
        return encode_image_path(local)
    if item.url.startswith("http://") or item.url.startswith("https://"):
        return await encode_remote_image(item.url)
    raise GroqUnavailableError("Invalid image. No readable media file was found for AI analysis.")


async def path_or_url_to_data_url(url: str) -> str:
    local = media_service.get_media_path(url)
    if local:
        return encode_image_path(local)
    if url.startswith("http://") or url.startswith("https://"):
        return await encode_remote_image(url)
    raise GroqUnavailableError("Invalid image. No readable media file was found for AI analysis.")


def dedupe_findings(findings: List[AIObservationFinding]) -> List[AIObservationFinding]:
    merged: Dict[Tuple[str, str], AIObservationFinding] = {}
    for finding in findings:
        key = (finding.category, finding.finding.strip().lower())
        existing = merged.get(key)
        if existing is None or finding.confidence > existing.confidence:
            merged[key] = finding
    return list(merged.values())


class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.model_name = settings.AI_MODEL_NAME

    def _require_groq(self) -> None:
        if not settings.groq_configured:
            raise GroqUnavailableError()

    async def _vision_call(self, prompt: str, image_data_urls: List[str]) -> Dict[str, Any]:
        self._require_groq()
        if not image_data_urls:
            raise GroqUnavailableError("Invalid image. No media was provided for AI analysis.")

        content: List[Dict[str, Any]] = [{"type": "text", "text": prompt}]
        for url in image_data_urls[: settings.MAX_VISION_IMAGES_PER_CALL]:
            content.append({"type": "image_url", "image_url": {"url": url}})

        return await groq_chat(
            [
                {"role": "system", "content": RESPONSIBLE_AI_RULES},
                {"role": "user", "content": content},
            ]
        )

    def _to_ai_analysis(self, validated: Dict[str, Any], observation_id: Optional[str] = None) -> AIAnalysis:
        findings: List[AIObservationFinding] = validated["findings"]
        concern = validated["overall_concern"]
        hazardous = validated["hazardous_suspicion"]
        safety = None
        if hazardous:
            safety = (
                "Professional/authority assessment recommended. "
                "Do not directly handle suspected hazardous material."
            )

        return AIAnalysis(
            id=f"ai-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            observation_id=observation_id,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            detected_indicators=[f"{f.finding} ({f.category})" for f in findings],
            observations=findings,
            overall_concern=concern,
            recommended_next_step=validated["recommended_next_step"],
            classification=concern_to_classification(concern),
            potential_concern=validated["summary"],
            confidence_score=mean_confidence_pct(findings),
            evidence=[f.evidence for f in findings],
            human_verification_recommended=validated["requires_human_review"] or hazardous,
            rationale=validated["summary"],
            model_used=self.model_name,
            is_simulated=False,
            hazardous_suspicion=hazardous,
            safety_notice=safety,
        )

    async def analyze_observation(self, obs: ObservationCreate, stream_name: str = "Urban Stream") -> AIAnalysis:
        image_items = [m for m in obs.media if m.type == "image"]
        if obs.photo_url and not any(m.url == obs.photo_url for m in image_items):
            image_items.append(
                MediaItem(
                    id="inline-photo",
                    type="image",
                    url=obs.photo_url,
                    filename="observation_photo.jpg",
                )
            )
        if obs.photo_base64 and not any(m.url == obs.photo_base64 for m in image_items):
            image_items.append(
                MediaItem(
                    id="uploaded-photo",
                    type="image",
                    url=obs.photo_base64,
                    filename="uploaded_observation_photo",
                )
            )

        citizen_context = (
            f"Stream: {stream_name}. "
            f"Citizen notes water appearance: {obs.water_appearance.value}. "
            f"Smell: {obs.smell.value}. "
            f"Visible litter: {obs.visible_litter} ({obs.litter_type or 'n/a'}). "
            f"Algae reported: {obs.algae_present} ({obs.algae_type or 'n/a'}). "
            f"Organisms: {obs.aquatic_organisms or 'n/a'}. "
            f"Vegetation: {obs.vegetation or 'n/a'}. "
            f"Unusual events: {obs.unusual_events or 'n/a'}. "
            f"Notes: {obs.notes or 'n/a'}."
        )

        if image_items:
            data_urls = [await media_to_data_url(item) for item in image_items[: settings.MAX_VISION_IMAGES_PER_CALL]]
            prompt = (
                f"{VISION_JSON_SCHEMA}\nAnalyze these citizen stream photographs.\nContext: {citizen_context}"
            )
            raw = await self._vision_call(prompt, data_urls)
        else:
            self._require_groq()
            prompt = (
                f"{VISION_JSON_SCHEMA}\nNo photograph was attached. "
                f"Produce a structured AI-assisted assessment using only the citizen-reported observations. "
                f"Do not invent visual evidence that was not reported.\nContext: {citizen_context}"
            )
            raw = await groq_chat(
                [
                    {"role": "system", "content": RESPONSIBLE_AI_RULES},
                    {"role": "user", "content": prompt},
                ]
            )

        validated = validate_structured_analysis(raw)
        return self._to_ai_analysis(validated)

    async def analyze_video(
        self,
        video_id: str,
        duration_seconds: float,
        sampled_frames: List[Tuple[float, str, str]],
        context: Optional[str] = None,
    ) -> VideoAnalysisResult:
        if not sampled_frames:
            raise GroqUnavailableError(
                "Frame extraction failed. Representative video frames were not available for AI analysis."
            )

        limited = sampled_frames[: settings.MAX_VISION_IMAGES_PER_CALL]
        data_urls: List[str] = []
        labels: List[str] = []
        for idx, (t_sec, frame_url, frame_path) in enumerate(limited, start=1):
            path = Path(frame_path) if frame_path else media_service.get_media_path(frame_url)
            if not path or not Path(path).exists():
                raise GroqUnavailableError(
                    "Frame extraction failed. A representative frame could not be read for AI analysis."
                )
            data_urls.append(encode_image_path(Path(path)))
            labels.append(f"Image {idx} is a video frame at {_format_timestamp(t_sec)} ({t_sec:.1f}s).")

        prompt = (
            f"{VISION_JSON_SCHEMA}\n"
            "These images are representative frames from one short stream video — not independent events. "
            "Also include a 'timeline' array of {timestamp_sec, finding, confidence, evidence} using the labeled timestamps. "
            "Only include timeline entries supported by that frame.\n"
            + "\n".join(labels)
            + f"\nContext: {context or 'Citizen stream video'}"
        )
        raw = await self._vision_call(prompt, data_urls)
        validated = validate_structured_analysis(raw)

        timeline: List[VideoTimelineEvent] = []
        raw_timeline = raw.get("timeline") if isinstance(raw.get("timeline"), list) else []
        for event in raw_timeline:
            if not isinstance(event, dict):
                continue
            try:
                t_sec = float(event.get("timestamp_sec"))
            except (TypeError, ValueError):
                continue
            conf = _clip_confidence(event.get("confidence"))
            finding = str(event.get("finding") or "").strip()
            if not finding:
                continue
            matching = next((fr for fr in limited if abs(fr[0] - t_sec) < 1.5), None)
            timeline.append(
                VideoTimelineEvent(
                    timestamp_sec=t_sec,
                    timestamp_str=_format_timestamp(t_sec),
                    detected_issue=finding,
                    confidence=int(round(conf * 100)) if conf is not None else None,
                    frame_thumbnail_url=matching[1] if matching else None,
                )
            )

        if not timeline:
            for finding in validated["findings"]:
                first = limited[0]
                timeline.append(
                    VideoTimelineEvent(
                        timestamp_sec=first[0],
                        timestamp_str=_format_timestamp(first[0]),
                        detected_issue=finding.finding,
                        confidence=int(round(finding.confidence * 100)),
                        frame_thumbnail_url=first[1],
                    )
                )

        indicators: Dict[str, Optional[int]] = {}
        for finding in validated["findings"]:
            indicators[finding.finding] = int(round(finding.confidence * 100))

        concern = validated["overall_concern"]
        assessment = {
            "low": "Potential low visible stress",
            "moderate": "Potential ecological stress",
            "high": "Potential high ecological stress",
        }.get(concern, "AI-assisted video assessment")

        return VideoAnalysisResult(
            id=f"vid-ai-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            video_id=video_id,
            duration_seconds=duration_seconds,
            frames_analyzed=len(limited),
            detected_indicators=indicators,
            overall_assessment=assessment,
            evidence_timeline=timeline,
            findings=validated["findings"],
        )

    async def analyze_multimedia(
        self,
        obs: ObservationCreate,
        stream_name: str,
        video_frames_by_id: Dict[str, List[Tuple[float, str, str]]],
    ) -> Tuple[AIAnalysis, Optional[VideoAnalysisResult], MediaAnalysisSummary]:
        photos = [m for m in obs.media if m.type == "image"]
        videos = [m for m in obs.media if m.type == "video"]
        if obs.photo_url and not any(m.url == obs.photo_url for m in photos):
            photos.append(
                MediaItem(id="inline-photo", type="image", url=obs.photo_url, filename="observation_photo.jpg")
            )

        photo_analysis = await self.analyze_observation(obs, stream_name=stream_name)

        video_analysis: Optional[VideoAnalysisResult] = None
        frames_analyzed = 0
        video_findings: List[AIObservationFinding] = []
        if videos:
            video = videos[0]
            frames = video_frames_by_id.get(video.id) or media_service.get_sampled_frames(video.id)
            video_analysis = await self.analyze_video(
                video_id=video.id,
                duration_seconds=video.duration_seconds or 0.0,
                sampled_frames=frames,
                context=f"{stream_name}; {obs.notes or ''}",
            )
            frames_analyzed = video_analysis.frames_analyzed
            video_findings = list(video_analysis.findings)

        combined = dedupe_findings(list(photo_analysis.observations) + video_findings)
        if combined:
            photo_analysis.observations = combined
            photo_analysis.detected_indicators = [f"{f.finding} ({f.category})" for f in combined]
            photo_analysis.evidence = [f.evidence for f in combined]
            photo_analysis.confidence_score = mean_confidence_pct(combined)

        detected = []
        seen = set()
        for finding in combined:
            label = finding.finding
            key = label.lower()
            if key not in seen:
                seen.add(key)
                detected.append(label)

        summary = MediaAnalysisSummary(
            photos_analyzed=len(photos),
            videos_analyzed=len(videos),
            frames_analyzed=frames_analyzed,
            detected=detected,
        )
        return photo_analysis, video_analysis, summary

    async def explain_risk(
        self,
        stream: Stream,
        recent_observations_count: int,
        rainfall_data: Dict[str, Any],
        recent_observations: Optional[List[Any]] = None,
    ) -> RiskExplanation:
        health = stream.health_score
        risk_level = (
            "CRITICAL" if health < 45 else ("HIGH" if health < 60 else ("MODERATE" if health < 80 else "LOW"))
        )

        factors: List[RiskFactor] = []
        obs_list = recent_observations or []
        litter_count = sum(1 for o in obs_list if getattr(o, "visible_litter", False))
        appearance_flags = [
            o.water_appearance
            for o in obs_list
            if getattr(o, "water_appearance", "") and "Clear" not in str(o.water_appearance)
        ]

        if recent_observations_count > 0:
            factors.append(
                RiskFactor(
                    factor_name="Recent citizen observations",
                    impact="HIGH" if recent_observations_count >= 8 else "MODERATE",
                    description=f"{recent_observations_count} citizen observations are on record for this reach.",
                    evidence="Observation log counts from AquaGuardian application data.",
                    confidence=90,
                )
            )

        if litter_count:
            factors.append(
                RiskFactor(
                    factor_name="Repeated visible litter",
                    impact="HIGH" if litter_count >= 3 else "MODERATE",
                    description=f"{litter_count} observations report visible litter or waste.",
                    evidence="Citizen observation fields and uploaded media findings stored in the application.",
                    confidence=88,
                )
            )

        if appearance_flags:
            factors.append(
                RiskFactor(
                    factor_name="Unusual water appearance",
                    impact="MODERATE",
                    description="Citizen reports include non-clear water appearance.",
                    evidence="; ".join(sorted(set(appearance_flags))[:4]),
                    confidence=82,
                )
            )

        if stream.indicators.pollution_score < 65:
            factors.append(
                RiskFactor(
                    factor_name="Prototype pollution indicator",
                    impact="HIGH",
                    description=f"Pollution freedom score is {stream.indicators.pollution_score}/100 on the prototype index.",
                    evidence="Derived from stored stream indicators, not a laboratory assay.",
                    confidence=80,
                )
            )

        if rainfall_data.get("runoff_risk") == "HIGH":
            factors.append(
                RiskFactor(
                    factor_name="Meteorological runoff context",
                    impact="MODERATE",
                    description=f"Recent precipitation context: {rainfall_data.get('recent_rainfall_mm', 'n/a')} mm.",
                    evidence="Weather service context attached to this stream location.",
                    confidence=75,
                )
            )

        if stream.special_hazard_warning:
            factors.append(
                RiskFactor(
                    factor_name="Hazard flag on record",
                    impact="HIGH",
                    description="This stream is flagged as not safe for untrained volunteer handling.",
                    evidence=stream.special_hazard_warning,
                    confidence=92,
                )
            )

        summary = (
            f"{stream.name} currently has a prototype health score of {health}/100 "
            f"({stream.status.value if hasattr(stream.status, 'value') else stream.status}). "
            f"This is an AI-assisted synthesis of application records, not an official scientific water-quality index."
        )
        if not stream.safe_for_citizen_action:
            recommended = (
                "Professional/authority assessment recommended. Do not directly handle suspected hazardous material."
            )
        else:
            recommended = (
                "Human verification recommended. Community cleanup should target appropriate visible litter only."
            )

        confidences = [f.confidence for f in factors]
        overall = int(round(sum(confidences) / len(confidences))) if confidences else None

        return RiskExplanation(
            stream_id=stream.id,
            stream_name=stream.name,
            risk_level=risk_level,
            health_score=health,
            summary=summary,
            factors=factors,
            overall_confidence=overall,
            ai_model_note="Explainability is generated from stored AquaGuardian application data.",
            recommended_action=recommended,
        )

    async def compare_cleanup_images(
        self,
        before_photo_url: str,
        after_photo_url: str,
        notes: Optional[str] = None,
        before_media: Optional[List[MediaItem]] = None,
        after_media: Optional[List[MediaItem]] = None,
    ) -> CleanupVerification:
        before_urls = [m.url for m in (before_media or []) if m.type == "image"]
        after_urls = [m.url for m in (after_media or []) if m.type == "image"]
        if before_photo_url:
            before_urls = [before_photo_url] + before_urls
        if after_photo_url:
            after_urls = [after_photo_url] + after_urls
        if not before_urls or not after_urls:
            raise GroqUnavailableError("Cleanup verification requires before and after media.")

        before_data = [await path_or_url_to_data_url(u) for u in before_urls[:4]]
        after_data = [await path_or_url_to_data_url(u) for u in after_urls[:4]]

        prompt = f"""
Compare BEFORE then AFTER cleanup media of the same stream reach.
{RESPONSIBLE_AI_RULES}
Return ONLY JSON:
{{
  "findings": [{{"category": "visible_waste", "finding": "", "confidence": 0.0, "evidence": ""}}],
  "before_litter_level": "",
  "after_litter_level": "",
  "estimated_visual_improvement_pct": 0,
  "status": "Visible improvement detected|Needs additional pass|Uncertain",
  "ai_summary": "",
  "limitations": "Images cannot prove ecosystem restoration.",
  "follow_up_recommendation": "",
  "confidence": 0.0
}}
Do NOT claim the ecosystem was restored. Describe only visible change such as reduced litter or bank appearance.
Volunteer notes: {notes or "n/a"}
The first {len(before_data)} image(s) are BEFORE. The remaining {len(after_data)} image(s) are AFTER.
"""
        raw = await self._vision_call(prompt, before_data + after_data)
        conf = _clip_confidence(raw.get("confidence"))
        pct_raw = raw.get("estimated_visual_improvement_pct")
        try:
            pct = int(pct_raw) if pct_raw is not None else None
            if pct is not None:
                pct = max(0, min(100, pct))
        except (TypeError, ValueError):
            pct = None

        findings: List[AIObservationFinding] = []
        for item in raw.get("findings") or []:
            if not isinstance(item, dict):
                continue
            c = _clip_confidence(item.get("confidence"))
            if c is None:
                continue
            finding = str(item.get("finding") or "").strip()
            evidence = str(item.get("evidence") or "").strip()
            if finding and evidence:
                findings.append(
                    AIObservationFinding(
                        category=str(item.get("category") or "visible_waste"),
                        finding=finding,
                        confidence=c,
                        evidence=evidence,
                    )
                )

        status = str(raw.get("status") or "Uncertain").strip()
        if "restored" in status.lower():
            status = "Visible improvement detected"

        summary = str(raw.get("ai_summary") or "").strip()
        if not summary:
            raise GroqUnavailableError("AI analysis returned incomplete JSON. Please retry the assessment.")

        return CleanupVerification(
            id=f"verif-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            cleanup_id="",
            stream_id="",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            before_photo_url=before_urls[0],
            after_photo_url=after_urls[0],
            before_media=before_media or [],
            after_media=after_media or [],
            before_litter_level=str(raw.get("before_litter_level") or "Not specified by model"),
            after_litter_level=str(raw.get("after_litter_level") or "Not specified by model"),
            estimated_visual_improvement_pct=pct,
            status=status,
            ai_summary=summary,
            confidence=int(round(conf * 100)) if conf is not None else mean_confidence_pct(findings),
            follow_up_recommended=str(
                raw.get("follow_up_recommendation")
                or "Schedule a follow-up citizen observation to monitor whether visible conditions persist."
            ),
            findings=findings,
            limitations=str(
                raw.get("limitations")
                or "Visible change in photos is not proof of chemical improvement or ecosystem restoration."
            ),
        )

    async def answer_assistant_query(self, message: str, context_data: Dict[str, Any]) -> ChatQueryResponse:
        self._require_groq()
        system_prompt = (
            "You are AquaGuardian's grounded assistant. Answer only from the provided application records. "
            "Never invent laboratory measurements. Use cautious language. "
            "Return JSON {reply, evidence_citations:[{source,timestamp,confidence}], suggested_followups:[]}."
        )
        raw = await groq_chat(
            [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Question: {message}\nApplication data: {str(context_data)[:6000]}",
                },
            ]
        )
        reply = str(raw.get("reply") or "").strip()
        if not reply:
            raise GroqUnavailableError("AI analysis returned incomplete JSON. Please retry the assessment.")
        citations = raw.get("evidence_citations") if isinstance(raw.get("evidence_citations"), list) else []
        followups = raw.get("suggested_followups") if isinstance(raw.get("suggested_followups"), list) else []
        conf = _clip_confidence(raw.get("confidence"))
        return ChatQueryResponse(
            reply=reply,
            evidence_citations=citations,
            confidence=int(round(conf * 100)) if conf is not None else None,
            suggested_followups=[str(x) for x in followups][:4],
        )


ai_service = AIService()
