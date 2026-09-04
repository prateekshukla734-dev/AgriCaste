# ml-service/forecast_service.py
import os
import json
from typing import Dict, Any, List
from datetime import datetime
from pathlib import Path

# Path to precomputed forecasts (JSON). Create this file during offline precompute.
PRECOMP_FORECAST_FILE = os.getenv("PRECOMP_FORECAST_FILE", "data/price_forecasts.json")

def load_precomputed_forecasts() -> Dict[str, Dict[str, float]]:
    """
    Load a mapping: { crop_key: { 'YYYY-MM-DD': price_float, ... }, ... }
    crop_key should be lowercase crop name.
    """
    path = Path(PRECOMP_FORECAST_FILE)
    if not path.exists():
        print("⚠️ Precomputed forecast file not found at", path)
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            data = json.load(fh)
            # ensure keys are lowercase
            normalized = {k.lower().strip(): v for k, v in data.items()}
            return normalized
    except Exception as e:
        print("⚠️ Failed to load precomputed forecasts:", e)
        return {}

# Load at import time (fast subsequent calls)
_PRECOMP_FORECASTS = load_precomputed_forecasts()

def get_precomputed_forecast(crop_name: str, days: int = 7) -> Dict[str, Any]:
    """
    Return next `days` forecast entries for `crop_name`.
    If precomputed data not found, return empty list and error note.
    """
    if not crop_name:
        return {"crop": crop_name, "forecast": [], "error": "crop_name required"}

    key = crop_name.lower().strip()
    if key not in _PRECOMP_FORECASTS:
        return {"crop": crop_name, "forecast": [], "error": "no precomputed forecast available for this crop"}

    series = _PRECOMP_FORECASTS[key]  # dict date->price
    # sort dates ascending
    sorted_dates = sorted(series.keys())
    today = datetime.utcnow().date().isoformat()
    res = []
    for dstr in sorted_dates:
        if dstr > today:
            res.append({"date": dstr, "price": series[dstr]})
        if len(res) >= days:
            break
    return {"crop": crop_name, "forecast": res}
