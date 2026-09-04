# ml-service/main.py
import os
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from recommend_service import RECOMMENDER
from forecast_service import get_precomputed_forecast

app = FastAPI(title="SIH ML Service")

# Service token for simple auth between services (set same value in backend env)
ML_TOKEN = os.getenv("ML_SERVICE_TOKEN", "super-secret-ml-token")

def auth_check(auth_header: Optional[str]):
    if auth_header is None or auth_header != f"Bearer {ML_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")

# ---- Pydantic payloads ----
class RecommendPayload(BaseModel):
    request_id: Optional[str]
    farm_id: str
    geom: Optional[Dict[str, Any]] = None
    soil: Optional[Dict[str, Any]] = None
    weather_forecast: Optional[Dict[str, Any]] = None
    market_prices: Optional[Dict[str, float]] = None
    user_prefs: Optional[Dict[str, Any]] = {}

class ForecastPayload(BaseModel):
    crop_name: str
    days: Optional[int] = 7

class VoiceAnalysisPayload(BaseModel):
    query: str
    farm_data: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = {}

class CropAdvicePayload(BaseModel):
    query: str
    crop: Optional[str] = None
    soil_type: Optional[str] = None
    season: Optional[str] = None
    location: Optional[Dict[str, Any]] = None

# ---- Endpoints ----
@app.post("/v1/predict/recommend")
def recommend(payload: RecommendPayload, authorization: Optional[str] = Header(None)):
    auth_check(authorization)
    # minimal validation
    if not payload.farm_id:
        raise HTTPException(status_code=400, detail="farm_id required")
    recs = RECOMMENDER.recommend(payload.dict(), top_k=3)
    return {
        "request_id": payload.request_id or "rid-auto",
        "pred_ts": None,
        "recommendations": recs,
        "explainability": { r["crop"]: {"score": r["score"], "reasons": r.get("reasons", [])} for r in recs }
    }

@app.post("/v1/forecast/price")
def forecast_price(payload: ForecastPayload, authorization: Optional[str] = Header(None)):
    auth_check(authorization)
    res = get_precomputed_forecast(payload.crop_name, days=payload.days or 7)
    return {"request_id": None, "pred_ts": None, "forecast": res}

@app.post("/v1/voice/analyze")
def analyze_voice_query(payload: VoiceAnalysisPayload, authorization: Optional[str] = Header(None)):
    auth_check(authorization)
    
    query = payload.query.lower()
    farm_data = payload.farm_data or {}
    context = payload.context or {}
    
    # Extract crop recommendations based on query
    if any(word in query for word in ["recommend", "suggest", "grow", "plant", "crop"]):
        if farm_data.get("farm_id"):
            try:
                recs = RECOMMENDER.recommend(farm_data, top_k=3)
                crops = [r["crop"] for r in recs]
                scores = [r["score"] for r in recs]
                
                response = f"Based on your farm's conditions, I recommend growing {', '.join(crops[:2])}. "
                response += f"{crops[0]} has the highest suitability score of {scores[0]:.2f}. "
                response += "These recommendations consider soil type, weather patterns, and market prices."
                
                return {
                    "response": response,
                    "recommendations": recs,
                    "confidence": max(scores) if scores else 0.5
                }
            except Exception as e:
                return {
                    "response": "I can provide crop recommendations based on your farm's soil type, location, and current market conditions. Please ensure your farm data is complete for better recommendations.",
                    "recommendations": [],
                    "confidence": 0.3
                }
    
    # Weather-related queries
    elif any(word in query for word in ["weather", "rain", "temperature", "forecast"]):
        response = "Current weather conditions are favorable for most crops. I recommend checking the detailed weather forecast for your specific location to make informed planting decisions."
        return {
            "response": response,
            "weather_insights": {
                "season": "Current season conditions",
                "recommendation": "Suitable for planting"
            },
            "confidence": 0.7
        }
    
    # Soil analysis queries
    elif any(word in query for word in ["soil", "fertility", "ph", "nutrition"]):
        soil_type = farm_data.get("soil", {}).get("type", "mixed")
        response = f"Your {soil_type} soil type is suitable for various crops. "
        response += "I recommend testing soil pH and nutrient levels for optimal crop selection. "
        response += "Consider organic fertilizers to improve soil health and long-term productivity."
        
        return {
            "response": response,
            "soil_insights": {
                "soil_type": soil_type,
                "recommendations": ["pH testing", "nutrient analysis", "organic fertilizers"]
            },
            "confidence": 0.8
        }
    
    # Market and profit queries
    elif any(word in query for word in ["profit", "income", "market", "price", "money"]):
        response = "For maximum profitability, consider high-value crops like cotton, sugarcane, or cash crops. "
        response += "Market prices fluctuate seasonally, so timing your harvest is crucial. "
        response += "I can help you analyze current market trends and price forecasts."
        
        return {
            "response": response,
            "market_insights": {
                "high_value_crops": ["cotton", "sugarcane", "vegetables"],
                "timing_important": True
            },
            "confidence": 0.6
        }
    
    # General farming advice
    else:
        response = "I can help you with crop recommendations, weather analysis, soil assessment, market insights, and farming best practices. "
        response += "Please ask specific questions about your farming needs for detailed guidance."
        
        return {
            "response": response,
            "general_advice": True,
            "confidence": 0.5
        }

@app.post("/v1/voice/crop-advice")
def get_crop_advice(payload: CropAdvicePayload, authorization: Optional[str] = Header(None)):
    auth_check(authorization)
    
    query = payload.query.lower()
    crop = payload.crop
    soil_type = payload.soil_type or "mixed"
    season = payload.season or "current"
    
    # Generate crop-specific advice
    crop_advice = {
        "rice": "Rice grows best in flooded fields with clayey soil. Plant during monsoon season for optimal water availability.",
        "wheat": "Wheat prefers well-drained loamy soil and cool weather. Plant in winter (October-December) for best yield.",
        "maize": "Maize needs well-drained soil and moderate rainfall. Can be grown in both kharif and rabi seasons.",
        "cotton": "Cotton requires deep, well-drained soil and warm climate. Plant during early monsoon for maximum fiber quality.",
        "sugarcane": "Sugarcane needs rich, well-drained soil and consistent water supply. Plant during spring for best results."
    }
    
    if crop and crop.lower() in crop_advice:
        specific_advice = crop_advice[crop.lower()]
        response = f"For {crop.title()}: {specific_advice} "
        response += f"Your {soil_type} soil is {'well-suited' if soil_type in ['loamy', 'clayey'] else 'suitable with proper management'} for this crop."
    else:
        response = f"For your {soil_type} soil type in {season} season, I recommend considering multiple crop options. "
        response += "Factors like rainfall, temperature, and market demand are important for crop selection."
    
    return {
        "response": response,
        "crop": crop,
        "soil_suitability": "good" if soil_type in ["loamy", "clayey"] else "moderate",
        "season_advice": f"Current {season} season conditions",
        "confidence": 0.8 if crop else 0.6
    }
