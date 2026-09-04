#!/bin/bash

echo "🚀 Starting Agricast Frontend Build..."

# Change to client directory
cd "$(dirname "$0")/client" || exit 1

# Clear cache and remove old modules
echo "🧹 Cleaning npm cache..."
npm cache clean --force
rm -rf node_modules package-lock.json

# Install dependencies with retry
echo "📦 Installing dependencies..."
npm install --force || {
    echo "❌ First install failed, retrying..."
    npm install --legacy-peer-deps --force || {
        echo "❌ Second install failed, trying with clear cache..."
        npm cache clean --force
        npm install --no-optional --force
    }
}

# Explicitly install vite and react plugin
echo "🔧 Installing vite dependencies..."
npm install vite @vitejs/plugin-react --save-dev --force

# Verify vite installation
echo "🔍 Verifying vite installation..."
if npx vite --version; then
    echo "✅ Vite is available"
else
    echo "❌ Vite not found, installing globally..."
    npm install -g vite
fi

# Try building with different approaches
echo "🏗️ Building application..."
if npm run build; then
    echo "✅ Build successful with npm run build"
elif npx vite build; then
    echo "✅ Build successful with npx vite build"
elif node_modules/.bin/vite build; then
    echo "✅ Build successful with direct vite path"
else
    echo "❌ All build attempts failed"
    echo "📋 Available vite commands:"
    find . -name "vite" -type f 2>/dev/null || echo "No vite executable found"
    exit 1
fi

# Verify build output
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    echo "✅ Build verification successful"
    echo "📁 Build output:"
    ls -la dist/
else
    echo "❌ Build verification failed - no dist directory or empty"
    exit 1
fi

echo "🎉 Frontend build completed successfully!"