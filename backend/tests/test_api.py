import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "demo_mode" in data

def test_get_dashboard():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "healthy_count" in data
    assert "total_streams" in data
    assert data["total_streams"] > 0

def test_get_streams():
    res = client.get("/api/streams")
    assert res.status_code == 200
    streams = res.json()
    assert len(streams) >= 5
    first = streams[0]
    assert "health_score" in first
    assert "status" in first
    assert "indicators" in first

def test_explain_stream_risk():
    res = client.get("/api/streams/stream-1/explain-risk")
    assert res.status_code == 200
    data = res.json()
    assert "risk_level" in data
    assert "factors" in data
    assert len(data["factors"]) > 0
    assert "overall_confidence" in data
    assert "disclaimer" in data

def test_submit_observation_and_ai_assessment():
    payload = {
        "stream_id": "stream-1",
        "latitude": 30.2625,
        "longitude": -97.7289,
        "water_appearance": "Brown / Muddy",
        "smell": "Musty / Stagnant",
        "visible_litter": True,
        "litter_type": "Plastic bottles and food packaging",
        "algae_present": True,
        "algae_type": "Green surface scum",
        "notes": "Testing automated citizen report submission",
        "reporter_name": "Test Citizen"
    }
    res = client.post("/api/observations", json=payload)
    assert res.status_code == 200
    obs = res.json()
    assert obs["stream_id"] == "stream-1"
    assert obs["ai_analysis"] is not None
    assert obs["ai_analysis"]["confidence_score"] > 50
    assert obs["ai_analysis"]["human_verification_recommended"] is True

def test_cleanup_and_verification_flow():
    # 1. Get cleanups
    res = client.get("/api/cleanup")
    assert res.status_code == 200
    cleanups = res.json()
    assert len(cleanups) > 0

    # 2. Join cleanup
    cl_id = cleanups[0]["id"]
    join_res = client.post(f"/api/cleanup/{cl_id}/join")
    assert join_res.status_code == 200
    assert join_res.json()["participants_count"] >= 1

    # 3. Verify cleanup with AI before/after
    verif_payload = {
        "cleanup_id": cl_id,
        "before_photo_url": "https://example.com/before.jpg",
        "after_photo_url": "https://example.com/after.jpg",
        "volunteer_notes": "Heavy volunteer turnout cleared all bank plastics"
    }
    verif_res = client.post(f"/api/cleanup/{cl_id}/verify", json=verif_payload)
    assert verif_res.status_code == 200
    verif_data = verif_res.json()
    assert "estimated_visual_improvement_pct" in verif_data
    assert verif_data["estimated_visual_improvement_pct"] > 50
    assert "disclaimer" in verif_data

def test_grounded_ai_assistant_query():
    query_payload = {
        "message": "Why is this stream at risk?",
        "stream_id": "stream-1"
    }
    res = client.post("/api/ai/query", json=query_payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["reply"]) > 20
    assert "evidence_citations" in data
    assert len(data["evidence_citations"]) > 0

def test_settings_public_status():
    res = client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert "ai_service" in data
    assert data["ai_service"]["mode"] is not None
    # Verify no secret leaked
    assert "AI_API_KEY" not in str(data)
