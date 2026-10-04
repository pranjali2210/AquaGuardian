import httpx
from typing import Dict, Any
from ..config import settings

class WeatherService:
    """Weather and precipitation service with live integration and demo microclimate simulation."""

    @classmethod
    async def get_stream_weather(cls, latitude: float, longitude: float) -> Dict[str, Any]:
        if settings.WEATHER_API_KEY:
            try:
                # Live OpenWeatherMap / OpenMeteo check
                url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,precipitation,weather_code&hourly=precipitation"
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        curr = data.get("current", {})
                        precip = curr.get("precipitation", 0.0)
                        temp = curr.get("temperature_2m", 21.5)
                        return {
                            "source": "Open-Meteo Live API",
                            "temperature_c": temp,
                            "recent_rainfall_mm": precip,
                            "runoff_risk": "HIGH" if precip > 15 else ("MODERATE" if precip > 4 else "LOW"),
                            "is_simulated": False
                        }
            except Exception:
                pass

        # Demo microclimate fallback
        return {
            "source": "Demo Microclimate Service",
            "temperature_c": 22.4,
            "recent_rainfall_mm": 18.5,
            "runoff_risk": "HIGH",
            "condition": "Recent convective shower (increased non-point source runoff)",
            "is_simulated": True
        }

weather_service = WeatherService()
