// backend-node/helpers/mlClient.js
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://ml-service:8000';
const ML_TOKEN = process.env.ML_SERVICE_TOKEN || 'super-secret-ml-token';

const ml = axios.create({
  baseURL: ML_URL,
  timeout: parseInt(process.env.ML_CLIENT_TIMEOUT_MS || '15000', 10)
});

async function recommend(payload) {
  const res = await ml.post('/v1/predict/recommend', payload, {
    headers: { Authorization: `Bearer ${ML_TOKEN}` }
  });
  return res.data;
}

async function forecastPrice(cropName, days=7) {
  const res = await ml.post('/v1/forecast/price', { crop_name: cropName, days }, {
    headers: { Authorization: `Bearer ${ML_TOKEN}` }
  });
  return res.data;
}

module.exports = { recommend, forecastPrice };
