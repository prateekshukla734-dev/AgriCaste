import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const { register, login, getProfile, updateProfile } = userController;

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Profile routes (protected)
router.get('/me', authenticateToken, getProfile);
router.patch('/me', authenticateToken, updateProfile);

export default router;

