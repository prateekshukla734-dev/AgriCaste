// lib/db.js
import mongoose from 'mongoose';

let connectingPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection; // already connected
  if (connectingPromise) return connectingPromise; // in-flight connect

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'crop_recommendation';

  if (!uri) {
    console.error('❌ MONGODB_URI is not set');
    throw new Error('MONGODB_URI not set');
  }

  // Safer logs
  const safeUri = uri.replace(/(\/\/)([^:]+):([^@]+)@/, '$1***:***@');
  console.log('🌐 Connecting to MongoDB:', { uri: safeUri, dbName });

  // Recommended Mongoose flags
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false); // fail fast if not connected

  // Connection event hooks
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err?.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });

  // Try to connect (fail within 10s if no server available)
  const opts = {
    dbName,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    family: 4, // prefer IPv4
  };

  connectingPromise = mongoose.connect(uri, opts)
    .then(() => mongoose.connection)
    .catch((err) => {
      // Reset so next call can retry
      connectingPromise = null;
      throw err;
    });

  return connectingPromise;
}
