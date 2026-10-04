"""
Comprehensive E2E demo scenario verification script (Prompt Section 27)
Tests the complete 5-minute hackathon demo story.
"""
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.data.db import db

client = TestClient(app)

def test_full_hackathon_demo_story():
    db.reset()
    # 1. Open AquaGuardian -> inspect dashboard
    dash_res = client.get("/api/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_streams"] >= 5
    assert dash_data["healthy_count"] >= 1
    assert dash_data["cleanup_required_count"] >= 1

    # 2. Explore Streams -> find Mill Creek
    streams_res = client.get("/api/streams")
    assert streams_res.status_code == 200
    streams = streams_res.json()
    mill_creek = next((s for s in streams if "Mill Creek" in s["name"]), None)
    assert mill_creek is not None
    assert mill_creek["cleanup_required"] is True
    initial_health = mill_creek["health_score"]

    # 3. Explain Risk: "Why is this stream at risk?"
    explain_res = client.get(f"/api/streams/{mill_creek['id']}/explain-risk")
    assert explain_res.status_code == 200
    explain_data = explain_res.json()
    assert len(explain_data["factors"]) > 0
    assert explain_data["overall_confidence"] >= 75
    assert "disclaimer" in explain_data

    # 4. Citizen clicks "Report Observation" & submits photo + indicators
    new_obs_payload = {
        "stream_id": mill_creek["id"],
        "latitude": mill_creek["latitude"] + 0.0002,
        "longitude": mill_creek["longitude"] + 0.0002,
        "water_appearance": "Brown / Muddy",
        "smell": "Musty / Stagnant",
        "visible_litter": True,
        "litter_type": "Floating single-use plastic bottles, wrappers, cups",
        "algae_present": True,
        "algae_type": "Green surface scum",
        "reporter_name": "Hackathon Demo User",
        "notes": "Trash is blocking the pedestrian bridge culvert.",
        "photo_url": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
    }
    obs_res = client.post("/api/observations", json=new_obs_payload)
    assert obs_res.status_code == 200
    obs_data = obs_res.json()
    assert obs_data["ai_analysis"] is not None
    assert obs_data["ai_analysis"]["confidence_score"] >= 75
    assert obs_data["ai_analysis"]["human_verification_recommended"] is True

    # 5. Check Spatial Clustering & Early Warning Alerts
    clusters_res = client.get("/api/alerts/clusters/spatial")
    assert clusters_res.status_code == 200
    clusters = clusters_res.json()
    assert len(clusters) >= 1

    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert any("Mill Creek" in a["stream_name"] for a in alerts)

    # 6. Check Cleanup Prioritization & RSVP
    cleanups_res = client.get("/api/cleanup")
    assert cleanups_res.status_code == 200
    cleanups = cleanups_res.json()
    target_cleanup = next((c for c in cleanups if "Mill Creek" in c["stream_name"]), None)
    assert target_cleanup is not None
    assert target_cleanup["priority_score"] >= 70

    # Join cleanup
    join_res = client.post(f"/api/cleanup/{target_cleanup['id']}/join")
    assert join_res.status_code == 200
    assert join_res.json()["participants_count"] >= 1

    # 7. Cleanup Verification: Upload Before & After photos
    verif_payload = {
        "cleanup_id": target_cleanup["id"],
        "before_photo_url": "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
        "after_photo_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
        "volunteer_notes": "Volunteers collected 14 bags of consumer debris; shoreline restored"
    }
    verif_res = client.post(f"/api/cleanup/{target_cleanup['id']}/verify", json=verif_payload)
    assert verif_res.status_code == 200
    verif_data = verif_res.json()
    assert verif_data["estimated_visual_improvement_pct"] >= 70
    assert "Verified" in verif_data["status"]
    assert "disclaimer" in verif_data

    # 8. Check Stream Recovery: status updated to Recently Cleaned
    updated_stream_res = client.get(f"/api/streams/{mill_creek['id']}")
    assert updated_stream_res.status_code == 200
    updated_stream = updated_stream_res.json()
    assert updated_stream["status"] == "Recently Cleaned"
    assert updated_stream["health_score"] >= initial_health

    # 9. Verify Grounded AI Assistant can answer questions on this stream
    chat_res = client.post("/api/ai/query", json={"message": "Why is Mill Creek at risk?"})
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert len(chat_data["reply"]) > 0
    assert len(chat_data["evidence_citations"]) > 0

    # 10. Verify User Eco Points and Community Profile
    profile_res = client.get("/api/community/profile")
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert profile_data["eco_points"] > 400
    assert len(profile_data["badges"]) >= 4

    print("✅ All 10 steps of the complete hackathon demo scenario passed successfully!")
