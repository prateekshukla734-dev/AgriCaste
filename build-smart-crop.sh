#!/bin/bash

# Build script for Agricast with fallback strategies
# This handles common vite/dependency issues during deployment

echo "🚀 Agricast Build Script v1.0"
echo "================================"

# Change to client directory
cd client || exit 1

echo "📦 Step 1: Clean and install dependencies..."

# Clean npm cache and node_modules
npm cache clean --force
rm -rf node_modules package-lock.json

# Install dependencies
npm install

echo "🔍 Step 2: Verify vite installation..."

# Check if vite is available
if npx vite --version; then
    echo "✅ Vite found via npx"
    BUILD_CMD="npx vite build"
elif ./node_modules/.bin/vite --version; then
    echo "✅ Vite found in node_modules"
    BUILD_CMD="./node_modules/.bin/vite build"
else
    echo "⚠️ Installing vite globally as fallback..."
    npm install -g vite
    BUILD_CMD="vite build"
fi

echo "🏗️ Step 3: Building React application..."

# Run the build
if $BUILD_CMD; then
    echo "✅ Build successful!"
    
    # Verify build output
    if [ -f "dist/index.html" ]; then
        echo "✅ dist/index.html found"
        echo "📊 Build size:"
        du -sh dist/
        echo "📋 Build contents:"
        ls -la dist/
    else
        echo "❌ dist/index.html not found!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    
    # Try alternative build method
    echo "🔄 Trying alternative build method..."
    
    # Install vite locally and try again
    npm install vite @vitejs/plugin-react --save-dev
    
    if npx vite build; then
        echo "✅ Alternative build successful!"
    else
        echo "❌ All build methods failed!"
        exit 1
    fi
fi

echo "🎉 Agricast build completed successfully!"