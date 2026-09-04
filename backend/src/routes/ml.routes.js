import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Proxy to FastAPI forecast service
router.get('/forecast/:commodity', async (req, res, next) => {
  try {
    const { commodity } = req.params;
    const { days = 30 } = req.query;
    
    const response = await axios.get(`${ML_SERVICE_URL}/forecast/${commodity}`, {
      params: { days },
      timeout: 10000
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Forecast service error:', error.message);
    
    // Fallback mock data
    const mockData = {
      commodity: req.params.commodity,
      forecasts: Array.from({ length: parseInt(req.query.days) || 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 2000 + Math.random() * 500,
        confidence: 0.7
      }))
    };
    
    res.json(mockData);
  }
});

// Proxy to FastAPI recommendation service (alternative endpoint)
router.post('/recommend', authenticateToken, async (req, res, next) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend`, req.body, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('ML recommend service error:', error.message);
    res.status(503).json({ error: 'ML recommendation service unavailable' });
  }
});

export default router;