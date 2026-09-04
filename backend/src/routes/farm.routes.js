import express from 'express';
import farmController from '../controllers/farm.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const { createFarm, getFarm, listFarms, updateFarm, deleteFarm } = farmController;
const router = express.Router();

// Create farm
router.post('/', authenticateToken, createFarm);

// List user farms
router.get('/', authenticateToken, listFarms);

// Get one farm by id
router.get('/:id', authenticateToken, getFarm);

// Update farm
router.patch('/:id', authenticateToken, updateFarm);

// Delete farm
router.delete('/:id', authenticateToken, deleteFarm);

export default router;

