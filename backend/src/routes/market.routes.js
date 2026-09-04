import express from 'express';
const router = express.Router();

// Mock market data for different states and crops
const mockMarketData = [
  { crop: 'Rice', market: 'Delhi Mandi', state: 'Delhi', price: '4500', min_price: '4200', max_price: '4800', modal_price: '4500', change: 2.3, date: new Date().toISOString() },
  { crop: 'Wheat', market: 'Punjab Mandi', state: 'Punjab', price: '2800', min_price: '2600', max_price: '3000', modal_price: '2800', change: -1.2, date: new Date().toISOString() },
  { crop: 'Maize', market: 'Maharashtra Mandi', state: 'Maharashtra', price: '2200', min_price: '2000', max_price: '2400', modal_price: '2200', change: 5.1, date: new Date().toISOString() },
  { crop: 'Cotton', market: 'Gujarat Mandi', state: 'Gujarat', price: '6800', min_price: '6500', max_price: '7100', modal_price: '6800', change: 3.8, date: new Date().toISOString() },
  { crop: 'Sugarcane', market: 'Uttar Pradesh Mandi', state: 'Uttar Pradesh', price: '3500', min_price: '3300', max_price: '3700', modal_price: '3500', change: 0.8, date: new Date().toISOString() },
  { crop: 'Soybean', market: 'Madhya Pradesh Mandi', state: 'Madhya Pradesh', price: '4200', min_price: '4000', max_price: '4400', modal_price: '4200', change: -2.1, date: new Date().toISOString() },
  { crop: 'Tomato', market: 'Karnataka Mandi', state: 'Karnataka', price: '3800', min_price: '3500', max_price: '4100', modal_price: '3800', change: 12.5, date: new Date().toISOString() },
  { crop: 'Onion', market: 'Maharashtra Mandi', state: 'Maharashtra', price: '2900', min_price: '2700', max_price: '3100', modal_price: '2900', change: 8.7, date: new Date().toISOString() },
  { crop: 'Potato', market: 'West Bengal Mandi', state: 'West Bengal', price: '1800', min_price: '1600', max_price: '2000', modal_price: '1800', change: 5.3, date: new Date().toISOString() },
  { crop: 'Rice', market: 'Tamil Nadu Mandi', state: 'Tamil Nadu', price: '4200', min_price: '4000', max_price: '4400', modal_price: '4200', change: 1.8, date: new Date().toISOString() },
  { crop: 'Wheat', market: 'Haryana Mandi', state: 'Haryana', price: '2750', min_price: '2550', max_price: '2950', modal_price: '2750', change: -0.5, date: new Date().toISOString() },
  { crop: 'Banana', market: 'Kerala Mandi', state: 'Kerala', price: '3200', min_price: '3000', max_price: '3400', modal_price: '3200', change: 4.2, date: new Date().toISOString() },
];

// GET /api/v1/market/prices - return filtered market prices
router.get('/prices', (req, res) => {
  const { state, crop } = req.query;
  
  let filteredData = [...mockMarketData];
  
  // Filter by state if provided
  if (state && state.trim() !== '') {
    filteredData = filteredData.filter(item => 
      item.state.toLowerCase().includes(state.toLowerCase())
    );
  }
  
  // Filter by crop if provided
  if (crop && crop.trim() !== '') {
    filteredData = filteredData.filter(item => 
      item.crop.toLowerCase().includes(crop.toLowerCase())
    );
  }
  
  // Add some random variation to make it feel live
  filteredData = filteredData.map(item => ({
    ...item,
    price: (parseFloat(item.price) + (Math.random() - 0.5) * 100).toFixed(0),
    change: (item.change + (Math.random() - 0.5) * 2).toFixed(1),
    date: new Date().toISOString()
  }));
  
  res.json(filteredData);
});

// GET /api/v1/market/:commodity — return mock latest price & forecast
router.get('/:commodity', (req, res) => {
  const { commodity } = req.params;
  const now = new Date();
  res.json({
    commodity,
    mandi: 'Demo Mandi',
    date: now.toISOString().slice(0, 10),
    price: 2000 + Math.floor(Math.random() * 500), // mock INR/quintal
    forecast: [
      { date: new Date(now.getTime() + 86400000).toISOString().slice(0, 10), price: 2100 },
      { date: new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10), price: 2050 },
    ],
  });
});

export default router;
