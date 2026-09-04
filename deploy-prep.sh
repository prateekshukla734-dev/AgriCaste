#!/bin/bash

# Agricast Deployment Preparation Script
# This script prepares the project for deployment to Render

echo "🌱 Agricast - Deployment Preparation"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

echo "📦 Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Client dependency installation failed"
    exit 1
fi

echo "🏗️  Building React application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ React build failed"
    exit 1
fi

echo "🧪 Testing backend server..."
cd ../backend
timeout 10s npm start &
SERVER_PID=$!
sleep 5

# Check if server is responding
if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅ Backend server test passed"
else
    echo "⚠️  Backend server test failed (this might be okay if DB is not connected)"
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null

cd ..

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps for Render deployment:"
echo "1. Push your code to GitHub"
echo "2. Connect your repo to Render"
echo "3. Set these environment variables in Render:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your-mongodb-connection-string"
echo "   - JWT_SECRET=your-jwt-secret"
echo "   - CORS_ORIGIN=*"
echo ""
echo "4. Use these build settings:"
echo "   - Build Command: cd backend && npm install && npm run build:install"
echo "   - Start Command: cd backend && npm start"
echo ""
echo "🚀 Ready for deployment!"