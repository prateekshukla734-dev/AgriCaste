import Joi from 'joi';
import userService from '../services/user.service.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  language: Joi.string().valid('en','hi','bn','te','ta','mr','gu','kn','ml','pa').optional()
});

const loginSchema = Joi.object({
  phoneOrEmail: Joi.string().required(),
  password: Joi.string().required()
});

export async function register(req, res, next) {
  try {
    console.log('=== User Registration Debug ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Environment check:', {
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
      BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 'DEFAULT'
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log('Validated data:', JSON.stringify(value, null, 2));
    const user = await userService.createUser(value);
    console.log('User created successfully');
    return res.status(201).json({ user });
  } catch (err) { 
    console.log('Error in register:', err);
    next(err); 
  }
}

export async function login(req, res, next) {
  try {
    console.log('=== User Login Debug ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Environment check:', {
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING'
    });

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log('Validated data:', JSON.stringify(value, null, 2));
    const result = await userService.authenticate(value);
    console.log('Authentication successful');
    return res.json(result);
  } catch (err) { 
    console.log('Error in login:', err);
    next(err); 
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.sub);
    return res.json({ user });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const patch = req.body;
    const user = await userService.updateUser(req.user.sub, patch);
    return res.json({ user });
  } catch (err) { next(err); }
}

export default { register, login, getProfile, updateProfile };
