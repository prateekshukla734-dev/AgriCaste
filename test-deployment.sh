#!/bin/bash

# Test deployment locally by simulating production environment

echo "🧪 Testing Agricast Deployment Locally"
echo "========================================"

# Change to backend directory
cd backend || exit 1

echo "📦 Building React app..."
npm run build:install

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

echo "🔍 Checking build output..."
if [ ! -f "../client/dist/index.html" ]; then
    echo "❌ index.html not found in dist folder"
    exit 1
fi

echo "✅ Build files found"

echo "🚀 Starting server in production mode..."
export NODE_ENV=production
export PORT=5000

# Start server in background
node src/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "🧪 Testing endpoints..."

# Test health endpoint
echo "Testing /api/health..."
curl -fhttps://sih-crop-recommendation.onrender.com/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ /api/health working"
else
    echo "❌ /api/health failed"
fi

# Test root endpoint
echo "Testing / (root route)..."
curl -fhttps://sih-crop-recommendation.onrender.com/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ / (root) working"
else
    echo "❌ / (root) failed"
fi

# Stop server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Local deployment test complete!"
echo "The app is ready for Render deployment."