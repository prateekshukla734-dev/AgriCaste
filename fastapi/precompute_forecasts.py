# ml-service/precompute_forecasts.py
import pandas as pd
import joblib, json
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta

df = pd.read_csv("data/jharkhand_market_price.csv")
df['Date'] = pd.to_datetime(df['Date'])
forecasts = {}
for crop in df['Crop'].unique():
    crop_df = df[df['Crop']==crop].sort_values('Date').set_index('Date')
    ts = crop_df['Modal_Price(₹/Quintal)'].asfreq('D').fillna(method='ffill')
    try:
        model = ARIMA(ts, order=(5,1,0))
        fit = model.fit()
        fc = fit.forecast(steps=30)
        fc_dict = { (ts.index[-1] + timedelta(days=i+1)).date().isoformat(): float(val) for i,val in enumerate(fc) }
        forecasts[crop.lower().strip()] = fc_dict
    except Exception as e:
        print("ARIMA failed for", crop, e)

with open('data/price_forecasts.json','w',encoding='utf-8') as f:
    json.dump(forecasts, f, ensure_ascii=False, indent=2)
