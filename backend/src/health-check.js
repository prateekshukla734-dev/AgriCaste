// Health check script to diagnose production issues
import 'dotenv/config';

console.log('=== Production Health Check ===');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

// Check environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT',
  'CORS_ORIGIN'
];

console.log('\n=== Environment Variables Check ===');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`${envVar}: ${value ? '✅ SET' : '❌ MISSING'}`);
  if (envVar === 'MONGODB_URI' && value) {
    console.log(`  URI (masked): ${value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  }
});

// Check bcrypt availability
console.log('\n=== Dependency Check ===');
try {
  const bcrypt = await import('bcrypt');
  console.log('bcrypt: ✅ Available');
  
  // Test bcrypt functionality
  const testHash = await bcrypt.hash('test123', 10);
  const testCompare = await bcrypt.compare('test123', testHash);
  console.log('bcrypt functionality: ✅ Working');
} catch (error) {
  console.error('bcrypt: ❌ Error -', error.message);
}

try {
  const jwtModule = await import('jsonwebtoken');
  const jwt = jwtModule.default;
  const testToken = jwt.sign({ test: true }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });
  console.log('jsonwebtoken: ✅ Available');
} catch (error) {
  console.error('jsonwebtoken: ❌ Error -', error.message);
}

// Check MongoDB connection
console.log('\n=== MongoDB Connection Test ===');
try {
  const mongoose = await import('mongoose');
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not set');
  } else {
    console.log('Attempting connection...');
    console.log('Using URI (masked):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log('✅ MongoDB connection successful');
    await mongoose.disconnect();
  }
} catch (error) {
  console.error('❌ MongoDB connection failed:', error.message);
  console.error('Full error:', error);
}

console.log('\n=== Health Check Complete ===');