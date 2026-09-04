import voiceService from '../services/voice.service.js';

// General voice command processing
async function processVoiceCommand(req, res, next) {
  try {
    const { query, context } = req.body;
    const userId = req.user.sub;
    
    if (!query) {
      return res.status(400).json({ error: 'Voice query is required' });
    }

    const response = await voiceService.processVoiceCommand({
      query,
      context: context || {},
      userId
    });

    res.json({
      success: true,
      query,
      response: response.text,
      intent: response.intent,
      actions: response.actions || [],
      data: response.data || null
    });
  } catch (error) {
    console.error('Voice command processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process voice command',
      response: 'Sorry, I encountered an error while processing your request.'
    });
  }
}

// Farm-specific voice queries
async function processFarmQuery(req, res, next) {
  try {
    const { query, farmId } = req.body;
    const userId = req.user.sub;
    
    if (!query) {
      return res.status(400).json({ error: 'Voice query is required' });
    }

    const response = await voiceService.processFarmQuery({
      query,
      farmId,
      userId
    });

    res.json({
      success: true,
      query,
      response: response.text,
      farmData: response.farmData || null,
      recommendations: response.recommendations || null,
      actions: response.actions || []
    });
  } catch (error) {
    console.error('Farm voice query error:', error);
    res.status(500).json({ 
      error: 'Failed to process farm query',
      response: 'Sorry, I could not process your farm-related question.'
    });
  }
}

// Market-specific voice queries
async function processMarketQuery(req, res, next) {
  try {
    const { query, crop, state } = req.body;
    const userId = req.user.sub;
    
    if (!query) {
      return res.status(400).json({ error: 'Voice query is required' });
    }

    const response = await voiceService.processMarketQuery({
      query,
      crop,
      state,
      userId
    });

    res.json({
      success: true,
      query,
      response: response.text,
      marketData: response.marketData || null,
      priceComparisons: response.priceComparisons || null,
      actions: response.actions || []
    });
  } catch (error) {
    console.error('Market voice query error:', error);
    res.status(500).json({ 
      error: 'Failed to process market query',
      response: 'Sorry, I could not get the market information you requested.'
    });
  }
}

export default {
  processVoiceCommand,
  processFarmQuery,
  processMarketQuery,
};