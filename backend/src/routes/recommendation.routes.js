import express from 'express';
import Farm from '../models/Farm.js';
import Recommendation from '../models/Recommendation.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import axios from 'axios';

const router = express.Router();

// FastAPI ML service URL
const ML_SERVICE_URL = 'http://localhost:8000'; // Force localhost for development
const ML_SERVICE_TOKEN = process.env.ML_SERVICE_TOKEN || 'super-secret-ml-token';

console.log('ML_SERVICE_URL from env:', process.env.ML_SERVICE_URL);
console.log('ML_SERVICE_URL final:', ML_SERVICE_URL);

// Helper to build ML payload from farm data
function buildMLPayload(farm) {
  return {
    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    farm_id: farm._id.toString(),
    geom: farm.geom,
    soil: farm.soil || {},
    weather_forecast: {},
    market_prices: {},
    user_prefs: { priority: 'profit' }
  };
}

// GET /api/v1/recommendation/farms/:id - Get recommendations for a farm
router.get('/farms/:id', authenticateToken, async (req, res, next) => {
  try {
    console.log('=== Recommendation Request ===');
    console.log('Farm ID:', req.params.id);
    console.log('User:', req.user.sub);
    
    const farmId = req.params.id;
    const farm = await Farm.findById(farmId).lean();
    if (!farm) {
      console.log('Farm not found:', farmId);
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    console.log('Found farm:', farm.name);
    
    // Ownership check
    if (farm.userId.toString() !== req.user.sub && req.user.role !== 'admin') {
      console.log('Access denied. Farm owner:', farm.userId, 'User:', req.user.sub);
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Build payload for ML service
    const payload = buildMLPayload(farm);
    if (req.query.priority) {
      payload.user_prefs.priority = req.query.priority;
    }

    console.log('ML Service URL:', ML_SERVICE_URL);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      // Call FastAPI recommendation service
      console.log('Calling ML service...');
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/v1/predict/recommend`, payload, {
        timeout: 10000,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ML_SERVICE_TOKEN}`
        }
      });

      console.log('ML service response:', mlResponse.data);
      const mlData = mlResponse.data;

      // Transform ML response to match frontend expectations
      const responseData = {
        crops: mlData.recommendations?.map(rec => ({
          name: rec.crop,
          confidence: rec.score || 0.75,
          description: rec.description || `${rec.crop} is suitable for your farm conditions`,
          expectedYield: rec.yield || '3-4 tons/hectare',
          season: rec.season || 'Suitable for current season',
          marketPrice: rec.price || '20',
          tips: rec.tips || [
            'Follow recommended planting schedule',
            'Ensure proper irrigation management',
            'Apply balanced fertilizers'
          ]
        })) || [],
        weatherForecast: mlData.weather_insights || 'Weather conditions are favorable for cultivation',
        soilRecommendations: mlData.soil_insights || 'Soil conditions are suitable for recommended crops'
      };

      // Save recommendation to database
      if (mlData.recommendations?.[0]) {
        await Recommendation.create({
          farm: farmId,
          recommended_crop: mlData.recommendations[0].crop || 'wheat',
          expected_yield: mlData.recommendations[0].yield || 0,
          expected_profit: mlData.recommendations[0].profit || 0,
          sustainability_score: mlData.recommendations[0].sustainability_score || 0.5,
          explanation_json: mlData
        });
      }

      return res.json(responseData);
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      console.error('ML service error details:', mlError.response?.data || mlError);
      
      // Check if it's a connection error (ML service not running)
      if (mlError.code === 'ECONNREFUSED' || mlError.code === 'ETIMEDOUT' || mlError.code === 'ENOTFOUND') {
        console.log('ML service appears to be offline, providing fallback recommendations');
        
        // Provide fallback recommendations
        const fallbackRecommendations = {
          crops: [
            {
              name: 'Wheat',
              confidence: 0.75,
              expectedYield: '3-4 tons/hectare',
              season: 'Rabi (Oct-Mar)',
              marketPrice: '25',
              description: 'Wheat is a staple crop suitable for most soil types',
              tips: [
                'Plant in October-November for best results',
                'Ensure adequate irrigation during grain filling',
                'Apply balanced fertilizers for optimal yield'
              ]
            },
            {
              name: 'Rice',
              confidence: 0.70,
              expectedYield: '4-5 tons/hectare',
              season: 'Kharif (Jun-Oct)',
              marketPrice: '22',
              description: 'Rice grows well in areas with adequate water supply',
              tips: [
                'Maintain standing water during growing season',
                'Transplant 3-4 week old seedlings',
                'Apply organic matter to improve soil health'
              ]
            },
            {
              name: 'Maize',
              confidence: 0.65,
              expectedYield: '5-6 tons/hectare',
              season: 'Kharif (Jun-Oct)',
              marketPrice: '18',
              description: 'Maize is versatile and suitable for various soil conditions',
              tips: [
                'Plant after monsoon onset',
                'Ensure good drainage to prevent waterlogging',
                'Apply nitrogen fertilizer in split doses'
              ]
            }
          ],
          weatherForecast: 'Weather conditions are suitable for crop cultivation. Monitor rainfall patterns for irrigation planning.',
          soilRecommendations: 'Consider soil testing for optimal nutrient management. Add organic matter to improve soil structure.',
          fallback: true,
          message: 'These are general recommendations. For more accurate predictions, the ML service needs to be running.'
        };
        
        return res.json(fallbackRecommendations);
      }
      
      // Try to get last saved recommendation
      const lastRec = await Recommendation.findOne({ farm: farmId })
        .sort({ createdAt: -1 })
        .lean();
      
      if (lastRec) {
        console.log('Returning last saved recommendation');
        return res.json({ 
          crops: [{ 
            name: lastRec.recommended_crop,
            expectedYield: lastRec.expected_yield,
            profit: lastRec.expected_profit,
            sustainability_score: lastRec.sustainability_score
          }]
        });
      }
      
      return res.status(503).json({ error: 'Recommendation service unavailable' });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/recommendation/farms/:id/history - Get recommendation history
router.get('/farms/:id/history', authenticateToken, async (req, res, next) => {
  try {
    const farmId = req.params.id;
    const farm = await Farm.findById(farmId).lean();
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    
    if (farm.userId.toString() !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const recommendations = await Recommendation.find({ farm: farmId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({ recommendations });
  } catch (err) {
    next(err);
  }
});

export default router;
