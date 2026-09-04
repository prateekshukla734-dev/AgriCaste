# ml-service/train/precompute_forecasts.py
"""
Precompute ARIMA forecasts per crop and save JSON:
  data/price_forecasts.json  -> { crop_key: { 'YYYY-MM-DD': price_float, ... }, ... }
Input CSV must have columns: Date, Crop, Modal_Price(₹/Quintal)
Tune ARIMA order per crop if you want; default (5,1,0).
"""
import os
import json
import pandas as pd
from datetime import timedelta
from statsmodels.tsa.arima.model import ARIMA

DATA_CSV = os.getenv("PRICE_CSV", "data/jharkhand_market_price.csv")
OUT_JSON = os.getenv("PRICE_FORECAST_OUT", "../data/price_forecasts.json")  # relative to train/
os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)

def run(steps=30):
    if not os.path.exists(DATA_CSV):
        raise FileNotFoundError(f"Price CSV not found at {DATA_CSV}")

    df = pd.read_csv(DATA_CSV)
    if 'Date' not in df.columns or 'Crop' not in df.columns or 'Modal_Price(₹/Quintal)' not in df.columns:
        raise ValueError("CSV must contain Date, Crop, Modal_Price(₹/Quintal)")

    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    df = df.dropna(subset=['Date'])
    crops = df['Crop'].dropna().unique()

    forecasts = {}
    for crop in crops:
        try:
            crop_df = df[df['Crop'] == crop].sort_values('Date').set_index('Date')
            ts = crop_df['Modal_Price(₹/Quintal)']
            # resample to daily freq, forward-fill gaps
            ts = ts.asfreq('D').fillna(method='ffill').fillna(method='bfill')
            # Fit ARIMA (simple default). This may fail for short series.
            model = ARIMA(ts, order=(5,1,0))
            fit = model.fit()
            fc = fit.forecast(steps=steps)
            last_date = ts.index[-1].date()
            fc_dict = {}
            for i, val in enumerate(fc):
                d = (last_date + timedelta(days=i+1)).isoformat()
                # cast to float (json serializable)
                fc_dict[d] = float(val)
            forecasts[str(crop).lower().strip()] = fc_dict
            print(f"Forecasted {steps} days for crop: {crop}")
        except Exception as e:
            print(f"Failed forecasting for crop {crop}: {e}")

    with open(OUT_JSON, 'w', encoding='utf-8') as fh:
        json.dump(forecasts, fh, ensure_ascii=False, indent=2)

    print("Saved forecast JSON to:", OUT_JSON)

if __name__ == "__main__":
    run(steps=30)
