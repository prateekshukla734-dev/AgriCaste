import farmService from './farm.service.js';
import userService from './user.service.js';
import Farm from '../models/Farm.js';
import axios from 'axios';

// Mock market data - in production this would come from actual market API
const MARKET_DATA = {
  'rice': { 'punjab': 2500, 'haryana': 2400, 'uttar pradesh': 2300, 'bihar': 2200 },
  'wheat': { 'punjab': 2200, 'haryana': 2100, 'uttar pradesh': 2000, 'madhya pradesh': 1950 },
  'maize': { 'karnataka': 1800, 'andhra pradesh': 1750, 'bihar': 1700, 'uttar pradesh': 1650 },
  'sugarcane': { 'uttar pradesh': 3500, 'maharashtra': 3400, 'karnataka': 3300, 'tamil nadu': 3200 },
  'cotton': { 'gujarat': 5500, 'maharashtra': 5300, 'telangana': 5200, 'andhra pradesh': 5100 }
};

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_TOKEN = process.env.ML_SERVICE_TOKEN || 'super-secret-ml-token';

// Intent recognition patterns
const INTENTS = {
  FARM_STATS: /(?:how many|total|count).*farm|farm.*(?:count|number|statistics)/i,
  FARM_AREA: /(?:total|farm).*area|area.*farm/i,
  WEATHER: /weather|forecast|rain|temperature|climate/i,
  RECOMMENDATIONS: /recommend|suggest|crop.*recommend|what.*grow|best.*crop/i,
  MARKET_PRICE: /price|market|cost|rate.*(?:rice|wheat|maize|cotton|sugarcane)/i,
  MARKET_COMPARE: /compare.*price|highest.*price|lowest.*price|best.*price/i,
  ADD_FARM: /add.*farm|new.*farm|create.*farm/i,
  HELP: /help|what.*can|how.*use/i
};

// Extract crop and state from query
function extractCropAndState(query) {
  const lowerQuery = query.toLowerCase();
  
  // Extract crop
  const crops = ['rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'corn', 'paddy'];
  const crop = crops.find(c => lowerQuery.includes(c)) || crops.find(c => lowerQuery.includes(c.substring(0, 4)));
  
  // Extract state
  const states = [
    'punjab', 'haryana', 'uttar pradesh', 'bihar', 'madhya pradesh', 'karnataka',
    'maharashtra', 'gujarat', 'telangana', 'andhra pradesh', 'tamil nadu', 'kerala',
    'west bengal', 'odisha', 'rajasthan', 'chhattisgarh', 'jharkhand'
  ];
  const state = states.find(s => lowerQuery.includes(s));
  
  return { crop, state };
}

// Determine intent from query
function getIntent(query) {
  for (const [intent, pattern] of Object.entries(INTENTS)) {
    if (pattern.test(query)) {
      return intent;
    }
  }
  return 'GENERAL';
}

// Process general voice commands
async function processVoiceCommand({ query, context, userId }) {
  const intent = getIntent(query);
  const lowerQuery = query.toLowerCase();
  
  try {
    switch (intent) {
      case 'FARM_STATS':
        return await handleFarmStats(userId);
      
      case 'FARM_AREA':
        return await handleFarmArea(userId);
      
      case 'WEATHER':
        return handleWeatherQuery(query);
      
      case 'RECOMMENDATIONS':
        return await handleRecommendationQuery(userId);
      
      case 'MARKET_PRICE':
        const { crop, state } = extractCropAndState(query);
        return handleMarketPriceQuery(crop, state);
      
      case 'MARKET_COMPARE':
        return handleMarketCompareQuery(query);
      
      case 'ADD_FARM':
        return handleAddFarmQuery();
      
      case 'HELP':
        return handleHelpQuery();
      
      default:
        return {
          intent: 'GENERAL',
          text: `I heard "${query}". I can help you with farm statistics, weather forecasts, crop recommendations, market prices, and general farming guidance. Could you be more specific about what you'd like to know?`,
          actions: ['show_help']
        };
    }
  } catch (error) {
    console.error('Voice processing error:', error);
    return {
      intent: 'ERROR',
      text: 'Sorry, I encountered an error while processing your request. Please try again.',
      actions: []
    };
  }
}

// Handle farm statistics queries
async function handleFarmStats(userId) {
  try {
    const farms = await farmService.listFarmsByUser(userId);
    const farmCount = farms.length;
    const totalArea = farms.reduce((sum, farm) => sum + (farm.area || 0), 0);
    
    let response = `You have ${farmCount} ${farmCount === 1 ? 'farm' : 'farms'}`;
    if (totalArea > 0) {
      response += ` covering a total area of ${totalArea.toFixed(1)} hectares`;
    }
    response += '.';
    
    if (farmCount === 0) {
      response += ' Would you like to add your first farm?';
    }
    
    return {
      intent: 'FARM_STATS',
      text: response,
      data: { farmCount, totalArea, farms: farms.slice(0, 3) }, // Limit data sent
      actions: farmCount === 0 ? ['add_farm'] : ['view_farms']
    };
  } catch (error) {
    return {
      intent: 'FARM_STATS',
      text: 'Sorry, I could not retrieve your farm information at the moment.',
      actions: []
    };
  }
}

// Handle farm area queries
async function handleFarmArea(userId) {
  try {
    const farms = await farmService.listFarmsByUser(userId);
    const totalArea = farms.reduce((sum, farm) => sum + (farm.area || 0), 0);
    const avgArea = farms.length > 0 ? (totalArea / farms.length) : 0;
    
    let response = `Your total farm area is ${totalArea.toFixed(1)} hectares`;
    if (farms.length > 1) {
      response += ` across ${farms.length} farms, with an average of ${avgArea.toFixed(1)} hectares per farm`;
    }
    response += '.';
    
    return {
      intent: 'FARM_AREA',
      text: response,
      data: { totalArea, avgArea, farmCount: farms.length },
      actions: ['view_farms']
    };
  } catch (error) {
    return {
      intent: 'FARM_AREA',
      text: 'Sorry, I could not calculate your farm area at the moment.',
      actions: []
    };
  }
}

// Handle weather queries
function handleWeatherQuery(query) {
  return {
    intent: 'WEATHER',
    text: 'I can provide weather forecasts for your farm locations. You can check detailed weather information in the recommendations section where I can analyze weather conditions for specific crops.',
    actions: ['view_recommendations', 'check_weather']
  };
}

// Handle recommendation queries
async function handleRecommendationQuery(userId) {
  try {
    const farms = await farmService.listFarmsByUser(userId);
    
    if (farms.length === 0) {
      return {
        intent: 'RECOMMENDATIONS',
        text: 'You need to add at least one farm before I can provide crop recommendations. Would you like to add a farm now?',
        actions: ['add_farm']
      };
    }
    
    const farmNames = farms.slice(0, 3).map(f => f.name).join(', ');
    const response = `I can provide AI-powered crop recommendations for your ${farms.length} ${farms.length === 1 ? 'farm' : 'farms'}${farms.length <= 3 ? ` (${farmNames})` : ''}. Let me analyze soil conditions, weather patterns, and market prices to suggest the best crops for you.`;
    
    return {
      intent: 'RECOMMENDATIONS',
      text: response,
      data: { farms: farms.slice(0, 3) },
      actions: ['view_recommendations']
    };
  } catch (error) {
    return {
      intent: 'RECOMMENDATIONS',
      text: 'Sorry, I could not access your farm data for recommendations.',
      actions: []
    };
  }
}

// Handle market price queries
function handleMarketPriceQuery(crop, state) {
  if (!crop) {
    return {
      intent: 'MARKET_PRICE',
      text: 'Please specify which crop you want to check the price for. I can help you with rice, wheat, maize, cotton, and sugarcane prices.',
      actions: ['view_market']
    };
  }
  
  const cropData = MARKET_DATA[crop];
  if (!cropData) {
    return {
      intent: 'MARKET_PRICE',
      text: `Sorry, I don't have current price data for ${crop}. I can help you with rice, wheat, maize, cotton, and sugarcane prices.`,
      actions: ['view_market']
    };
  }
  
  if (state && cropData[state]) {
    const price = cropData[state];
    return {
      intent: 'MARKET_PRICE',
      text: `The current price of ${crop} in ${state} is ₹${price} per quintal.`,
      data: { crop, state, price },
      actions: ['view_market', 'compare_prices']
    };
  }
  
  // Show average or multiple state prices
  const states = Object.keys(cropData);
  const avgPrice = Object.values(cropData).reduce((sum, price) => sum + price, 0) / states.length;
  const priceRange = `₹${Math.min(...Object.values(cropData))} - ₹${Math.max(...Object.values(cropData))}`;
  
  return {
    intent: 'MARKET_PRICE',
    text: `The current price of ${crop} ranges from ${priceRange} per quintal across different states, with an average of ₹${Math.round(avgPrice)}. ${state ? `I don't have specific data for ${state}, but` : ''} You can check detailed prices in the market section.`,
    data: { crop, avgPrice, states: cropData },
    actions: ['view_market']
  };
}

// Handle market comparison queries
function handleMarketCompareQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Find highest and lowest prices across all crops
  let highestPrice = 0;
  let lowestPrice = Infinity;
  let highestCrop = '';
  let lowestCrop = '';
  
  for (const [crop, states] of Object.entries(MARKET_DATA)) {
    for (const [state, price] of Object.entries(states)) {
      if (price > highestPrice) {
        highestPrice = price;
        highestCrop = `${crop} in ${state}`;
      }
      if (price < lowestPrice) {
        lowestPrice = price;
        lowestCrop = `${crop} in ${state}`;
      }
    }
  }
  
  if (lowerQuery.includes('highest') || lowerQuery.includes('most expensive')) {
    return {
      intent: 'MARKET_COMPARE',
      text: `The highest price currently is ₹${highestPrice} per quintal for ${highestCrop}.`,
      data: { type: 'highest', crop: highestCrop, price: highestPrice },
      actions: ['view_market']
    };
  }
  
  if (lowerQuery.includes('lowest') || lowerQuery.includes('cheapest')) {
    return {
      intent: 'MARKET_COMPARE',
      text: `The lowest price currently is ₹${lowestPrice} per quintal for ${lowestCrop}.`,
      data: { type: 'lowest', crop: lowestCrop, price: lowestPrice },
      actions: ['view_market']
    };
  }
  
  return {
    intent: 'MARKET_COMPARE',
    text: `Current market prices range from ₹${lowestPrice} (${lowestCrop}) to ₹${highestPrice} (${highestCrop}) per quintal. You can view detailed comparisons in the market section.`,
    data: { highest: { crop: highestCrop, price: highestPrice }, lowest: { crop: lowestCrop, price: lowestPrice } },
    actions: ['view_market']
  };
}

// Handle add farm queries
function handleAddFarmQuery() {
  return {
    intent: 'ADD_FARM',
    text: 'I\'ll help you add a new farm. You can use the "Add Farm" button on your dashboard or I can guide you through the farm registration process.',
    actions: ['add_farm']
  };
}

// Handle help queries
function handleHelpQuery() {
  return {
    intent: 'HELP',
    text: 'I can help you with: farm statistics ("How many farms do I have?"), weather forecasts, crop recommendations, market prices ("What\'s the price of rice in Punjab?"), comparing prices, and adding new farms. What would you like to know?',
    actions: ['show_help']
  };
}

// Process farm-specific queries
async function processFarmQuery({ query, farmId, userId }) {
  const intent = getIntent(query);
  
  try {
    // Get farm data if farmId provided
    let farm = null;
    if (farmId) {
      farm = await farmService.getFarmById(farmId);
      if (!farm || farm.userId.toString() !== userId) {
        return {
          intent: 'ERROR',
          text: 'Sorry, I could not access that farm information.',
          actions: []
        };
      }
    }
    
    // Process farm-specific queries
    if (intent === 'RECOMMENDATIONS' && farm) {
      return await handleFarmRecommendations(farm, query);
    }
    
    // Fall back to general processing
    return await processVoiceCommand({ query, context: { farmId }, userId });
  } catch (error) {
    console.error('Farm query error:', error);
    return {
      intent: 'ERROR',
      text: 'Sorry, I could not process your farm-specific query.',
      actions: []
    };
  }
}

// Handle farm-specific recommendations
async function handleFarmRecommendations(farm, query) {
  try {
    const response = `For your ${farm.name} farm (${farm.area || 'unknown'} hectares), I can analyze soil conditions, weather patterns, and market trends to provide personalized crop recommendations. The farm's location and soil type will help me suggest the most suitable and profitable crops for this season.`;
    
    return {
      intent: 'RECOMMENDATIONS',
      text: response,
      farmData: {
        name: farm.name,
        area: farm.area,
        location: farm.location,
        soil: farm.soil
      },
      actions: ['get_recommendations']
    };
  } catch (error) {
    return {
      intent: 'ERROR',
      text: 'Sorry, I could not generate recommendations for this farm.',
      actions: []
    };
  }
}

// Process market-specific queries
async function processMarketQuery({ query, crop, state, userId }) {
  const { crop: extractedCrop, state: extractedState } = extractCropAndState(query);
  const finalCrop = crop || extractedCrop;
  const finalState = state || extractedState;
  
  const intent = getIntent(query);
  
  if (intent === 'MARKET_PRICE' || intent === 'MARKET_COMPARE') {
    return intent === 'MARKET_PRICE' 
      ? handleMarketPriceQuery(finalCrop, finalState)
      : handleMarketCompareQuery(query);
  }
  
  // General market query
  return {
    intent: 'MARKET_GENERAL',
    text: 'I can help you with current market prices, price comparisons across states, and trend analysis. You can ask me about specific crops like "What\'s the price of rice in Punjab?" or "Which crop has the highest price?"',
    actions: ['view_market']
  };
}

export default {
  processVoiceCommand,
  processFarmQuery,
  processMarketQuery,
};