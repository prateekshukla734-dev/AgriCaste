import express from 'express';
import voiceController from '../controllers/voice.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const { processVoiceCommand, processFarmQuery, processMarketQuery } = voiceController;

const router = express.Router();

// Voice command processing endpoints
router.post('/process', authenticateToken, processVoiceCommand);
router.post('/farm-query', authenticateToken, processFarmQuery);
router.post('/market-query', authenticateToken, processMarketQuery);

export default router;