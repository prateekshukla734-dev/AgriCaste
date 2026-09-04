import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../client/dist');
  console.log('Serving static files from:', buildPath);
  app.use(express.static(buildPath));
}

// Routers
import farmRouter from './routes/farm.routes.js';
import marketRouter from './routes/market.routes.js';
import userRouter from './routes/user.routes.js';
import recommendationRouter from './routes/recommendation.routes.js';
import mlRouter from './routes/ml.routes.js';
import voiceRouter from './routes/voice.routes.js';

app.use('/api/v1/farm', farmRouter);
app.use('/api/v1/market', marketRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/recommendation', recommendationRouter);
app.use('/api/v1/ml', mlRouter);
app.use('/api/v1/voice', voiceRouter);

// Health route
app.get('/api/health', async (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    const indexPath = path.join(__dirname, '../../client/dist/index.html');
    console.log('Serving index.html from:', indexPath);
    
    // Check if file exists before serving
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).json({ 
          message: 'Frontend build not found',
          hint: 'Make sure the React app is built and dist folder exists'
        });
      }
    });
  });
} else {
  // In development, just handle the root route
  app.get('/', (req, res) => {
    res.json({ message: 'Agricast API is running!', env: process.env.NODE_ENV || 'development' });
  });
}

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('=== Unhandled Error ===');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  
  // Check for specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation Error', details: err.message });
  }
  
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    console.error('MongoDB Error:', err);
    return res.status(500).json({ error: 'Database Error', details: err.message });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid Token' });
  }
  
  // Generic error
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Agricast API running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'not set'}`);
  
  if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../../client/dist/index.html');
    console.log(`📁 Static files path: ${buildPath}`);
    console.log(`📋 Static files exist: ${fs.existsSync(buildPath)}`);
  }
});

connectDB().catch((err) => {
  console.error('DB connection failed (server still running):', err.message);
});
