# Agricast - Deployment Troubleshooting Guide

## Current Issues & Solutions

### Issue 1: "Cannot GET /" Error
**Fixed ✅** - Enhanced backend routing and static file serving

### Issue 2: "vite: not found" Build Error
**In Progress 🔄** - Multiple solutions implemented

### Issue 3: "Cannot find package 'vite'" Module Resolution
**Latest Fix 🔧** - Enhanced build process with explicit vite installation

## Render Deployment Configuration

### 1. Updated render.yaml
- Explicit vite installation in build process
- Enhanced error handling and verification
- Health check endpoint configured
- Production environment variables set

### 2. Backend Fixes (backend/src/index.js)
- Static file serving from client/dist
- Proper route ordering (API routes before catch-all)
- Enhanced error handling and logging
- Health check endpoint implementation

### 3. Frontend Build Fixes (client/)
- Updated package.json build script to ensure vite installation
- Alternative vite.config.cjs for CommonJS compatibility
- Build verification and fallback strategies
- Changed minifier from terser to esbuild for better compatibility

### 4. Build Scripts
- build-frontend.sh: Comprehensive build script with multiple fallback strategies
- Enhanced error handling and dependency resolution

## Deployment Steps

### For Render Platform:
1. **Environment Variables Required:**
   - MONGODB_URI (your MongoDB Atlas connection string)
   - JWT_SECRET (for authentication)
   - NODE_ENV=production
   - PORT=10000

2. **Build Process:**
   - Backend dependencies installation
   - Frontend dependencies with explicit vite installation
   - React app build with verification
   - Static file serving setup

3. **Troubleshooting Commands:**
   ```bash
   # If build fails, check vite installation
   npx vite --version
   
   # Manual dependency installation
   npm install vite @vitejs/plugin-react --save-dev --force
   
   # Alternative build approach
   npm run build-fallback
   ```

## Local Testing

### 1. Test Backend:
```bash
cd backend
npm install
npm start
```
Visit: http://localhost:5000

### 2. Test Frontend:
```bash
cd client
npm install
npm run build
npm run preview
```
Visit: http://localhost:4173

### 3. Test Full Stack:
```bash
# Start backend
cd backend && npm start

# In another terminal, serve built frontend
cd client && npm run preview
```

## Production Checklist

- [x] Backend static file serving configured
- [x] API routes properly ordered
- [x] Health check endpoint implemented
- [x] Enhanced error handling
- [x] Vite build configuration optimized
- [x] Render.yaml with explicit vite installation
- [x] Environment variables documented
- [x] Build verification steps added
- [x] Fallback build strategies implemented

## Common Issues & Solutions

### "Cannot find package 'vite'" during build:
- ✅ Enhanced render.yaml explicitly installs vite
- ✅ Updated package.json build script ensures vite availability
- ✅ Created alternative vite.config.cjs for compatibility

### "Cannot GET /" in production:
- ✅ Backend serves static files from correct dist directory
- ✅ Catch-all route returns index.html for client-side routing
- ✅ API routes preserved with proper ordering

### Build failures on Render:
- ✅ Multiple fallback build strategies implemented
- ✅ Enhanced dependency installation with force flags
- ✅ Build verification and error reporting

## Next Steps

1. Deploy with updated configuration
2. Monitor build logs for any remaining issues
3. Test all application features in production
4. Verify mobile responsiveness
5. Test voice recognition and weather API integration

## Support

If issues persist:
1. Check Render build logs for specific error messages
2. Verify all environment variables are set
3. Test locally with production build: `npm run preview`
4. Check network connectivity for external APIs (weather, ML service)

Last updated: January 2025