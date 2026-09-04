# ml-service/recommend_service.py
import os
import joblib
import numpy as np
from typing import Dict, Any, List

# Path to saved model (joblib). Set via env var CROP_MODEL_PATH or default location.
MODEL_PATH = os.getenv("CROP_MODEL_PATH", "models/crop_classifier.joblib")

# Candidate crops / metadata — extend for your region
CANDIDATE_CROPS = [
    {"crop": "Rice", "water_pref": "high"},
    {"crop": "Maize", "water_pref": "medium"},
    {"crop": "Millet", "water_pref": "low"},
    {"crop": "Pulses", "water_pref": "low"}
]

class CropRecommender:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        if os.path.exists(MODEL_PATH):
            try:
                loaded = joblib.load(MODEL_PATH)
                # Expect saved dict: {'model': clf, 'le': label_encoder}
                if isinstance(loaded, dict):
                    self.model = loaded.get('model')
                    self.label_encoder = loaded.get('le')
                else:
                    # backward compatibility: model only
                    self.model = loaded
                print("✅ Loaded crop classifier model from", MODEL_PATH)
            except Exception as e:
                print("⚠️ Failed to load crop model:", e)
                self.model = None
        else:
            print("ℹ️ No crop model file found at", MODEL_PATH, "- using rule-based fallback")

    def featurize(self, payload: Dict[str, Any]) -> np.ndarray:
        """
        Build feature vector in the same order used during training.
        Expected features (example): Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH, Rainfall
        """
        soil = (payload.get("soil") or {}) or {}
        weather = (payload.get("weather_forecast") or {}) or {}

        # Robust extraction with defaults
        N = float(soil.get("Nitrogen") or soil.get("n") or 0.0)
        P = float(soil.get("Phosphorus") or soil.get("p") or 0.0)
        K = float(soil.get("Potassium") or soil.get("k") or 0.0)
        temp = float(weather.get("temperature") or payload.get("temperature") or 0.0)
        hum = float(weather.get("humidity") or payload.get("humidity") or 0.0)
        ph = float(soil.get("pH_Value") or soil.get("ph") or 6.5)
        rainfall = float(weather.get("rainfall_mm") or payload.get("rainfall") or 0.0)

        feat = np.array([N, P, K, temp, hum, ph, rainfall], dtype=float).reshape(1, -1)
        return feat

    def _rule_score_for_crop(self, crop: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
        # simple heuristic scoring: start at 0.5, add bonuses for matching conditions
        soil = (payload.get("soil") or {}) or {}
        weather = (payload.get("weather_forecast") or {}) or {}

        soil_ph = float(soil.get("pH_Value") or soil.get("ph") or 6.5)
        rainfall = float(weather.get("rainfall_mm") or payload.get("rainfall") or 0)
        market_prices = (payload.get("market_prices") or {}) or {}
        price = float(market_prices.get(crop["crop"].lower(), 0) or 0)

        score = 0.5
        reasons = []

        # ph preference heuristic
        if 6.0 <= soil_ph <= 7.5:
            score += 0.12
            reasons.append(f"soil pH {soil_ph}")

        # rainfall preference
        if crop.get("water_pref") == "high" and rainfall >= 800:
            score += 0.18
            reasons.append(f"adequate rainfall {rainfall}mm")
        elif crop.get("water_pref") == "low" and rainfall < 600:
            score += 0.12
            reasons.append(f"low rainfall {rainfall}mm")

        # market price heuristic
        if price and price > 10000:
            score += 0.15
            reasons.append(f"market price ₹{int(price)}")

        # expected yield baseline
        base_yield_map = {"Rice": 2000, "Maize": 1500, "Millet": 900, "Pulses": 800}
        base_yield = base_yield_map.get(crop["crop"], 1000)
        expected_yield = base_yield * (1 + (score - 0.5))  # scale yield by score

        expected_profit = expected_yield * (price * 0.001 if price else 10)

        return {
            "crop": crop["crop"],
            "expected_yield": round(expected_yield, 1),
            "expected_profit": round(expected_profit, 1),
            "score": round(min(0.999, score), 3),
            "reasons": reasons or ["rule-based default"]
        }

    def predict_for_crop(self, crop: Dict[str, Any], payload: Dict[str, Any]) -> Dict[str, Any]:
        # if model exists, use model to produce probabilities and map to crops
        if self.model is not None and self.label_encoder is not None:
            try:
                X = self.featurize(payload)  # shape (1, n_features)
                probs = self.model.predict_proba(X)[0]  # (n_classes,)
                # map label_encoder classes to probs
                class_labels = list(self.label_encoder.classes_)
                # If the crop is present in classes, get its prob
                crop_key = crop["crop"]
                if crop_key in class_labels:
                    prob = float(probs[class_labels.index(crop_key)])
                else:
                    # if not present, fallback to average small prob
                    prob = float(max(0.001, probs.max() * 0.5))
                # Estimate yield using a simple linear relation or model.predict (if trained that way)
                # Here we don't have yield regressor; use prob to scale a baseline yield
                baseline_yields = {"Rice": 2000, "Maize": 1500, "Millet": 900, "Pulses": 800}
                baseline = baseline_yields.get(crop_key, 1000)
                expected_yield = baseline * (0.5 + prob)  # heuristic
                market_prices = (payload.get("market_prices") or {}) or {}
                price = float(market_prices.get(crop_key.lower(), 0) or 0)
                expected_profit = expected_yield * (price * 0.001 if price else 10)
                reasons = [f"model confidence {round(prob,3)}"]
                return {
                    "crop": crop_key,
                    "expected_yield": round(expected_yield, 1),
                    "expected_profit": round(expected_profit, 1),
                    "score": round(min(0.999, prob), 3),
                    "reasons": reasons
                }
            except Exception as e:
                # log & fallback to rule-based
                print("⚠️ Model inference error:", e)
                return self._rule_score_for_crop(crop, payload)
        # no model: rule-based
        return self._rule_score_for_crop(crop, payload)

    def recommend(self, payload: Dict[str, Any], top_k: int = 3) -> List[Dict[str, Any]]:
        results = []
        for crop in CANDIDATE_CROPS:
            r = self.predict_for_crop(crop, payload)
            results.append(r)
        results = sorted(results, key=lambda x: x["score"], reverse=True)
        return results[:top_k]

# singleton instance for import
RECOMMENDER = CropRecommender()
