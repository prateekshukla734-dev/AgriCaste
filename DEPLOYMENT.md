# Agricast - Deployment Guide

A mobile-responsive agricultural platform with AI-powered crop recommendations, voice assistance, and market insights.

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub repository with your code
- MongoDB Atlas account (free tier available)
- Render account (free tier available)

### Step 1: Prepare Your Environment

1. **Set up MongoDB Atlas:**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Whitelist all IP addresses (0.0.0.0/0) for Render deployment

2. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Step 2: Deploy to Render

1. **Connect GitHub Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   - **Build Command:** `cd backend && npm install && npm run build:install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node

3. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-generated-jwt-secret
   CORS_ORIGIN=*
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)

### Step 3: Verify Deployment

1. **Health Check:**
   ```bash
   curl https://your-app-name.onrender.com/api/health
   ```

2. **Test Features:**
   - User registration/login
   - Farm management
   - AI recommendations
   - Voice features (requires HTTPS)
   - Market data
   - Mobile responsiveness

## 📱 Mobile-First Design

The application is fully responsive with:
- **Mobile Navigation:** Hamburger menu with touch-friendly interface
- **Responsive Cards:** Optimized layout for small screens
- **Touch Gestures:** Voice controls and interactive elements
- **Performance:** Optimized bundle size and loading times

## 🔧 Local Development

1. **Install Dependencies:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd client && npm install
   ```

2. **Environment Setup:**
   ```bash
   # Copy and configure environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```

3. **Start Development Servers:**
   ```bash
   # Backend (port 5000)
   cd backend && npm run dev
   
   # Frontend (port 5173)
   cd client && npm run dev
   ```

## 🌟 Key Features

### 🎯 Core Functionality
- **Smart Farm Management:** Add, manage, and track multiple farm locations
- **AI Crop Recommendations:** ML-powered suggestions based on soil, climate, and market data
- **Voice Assistant:** Speech-to-text input and text-to-speech output for accessibility
- **Market Intelligence:** Real-time crop prices with visual charts and trends
- **Weather Integration:** Climate-aware recommendations

### 🎨 User Experience
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile
- **Voice Controls:** Complete voice interaction for hands-free operation
- **Visual Charts:** Interactive market data visualization
- **Touch-Friendly:** Optimized for mobile touch interactions
- **Fast Loading:** Optimized bundle size and lazy loading

### 🔐 Security & Performance
- **JWT Authentication:** Secure user sessions
- **API Rate Limiting:** Protection against abuse
- **Data Validation:** Input sanitization and validation
- **Error Handling:** Comprehensive error management
- **Responsive Caching:** Optimized API responses

## 📊 Technical Stack

### Frontend
- **React 19:** Modern React with hooks and context
- **Tailwind CSS:** Utility-first responsive styling
- **Lucide React:** Lightweight icon library
- **React Router:** Client-side routing
- **TanStack Query:** Server state management
- **Web Speech API:** Native browser voice features

### Backend
- **Node.js + Express:** RESTful API server
- **MongoDB + Mongoose:** Document database with ODM
- **JWT:** Authentication and authorization
- **CORS:** Cross-origin resource sharing
- **Morgan:** HTTP request logging

### Deployment
- **Render:** Cloud hosting platform
- **MongoDB Atlas:** Cloud database
- **Static File Serving:** Integrated frontend serving
- **Environment Management:** Secure configuration

## 🔄 CI/CD Pipeline

The application supports automatic deployments:

1. **Push to main branch** → Triggers Render rebuild
2. **Build process** → Installs dependencies and builds React app
3. **Deployment** → Serves static files through Express
4. **Health checks** → Ensures service availability

## 🐛 Troubleshooting

### Common Issues

1. **"sh: 1: vite: not found" Build Error:**
   - **Cause:** Vite command not available during build process
   - **Solution 1:** Use `npx vite build` instead of `vite build`
   - **Solution 2:** Clear npm cache: `npm cache clean --force`
   - **Solution 3:** Force reinstall: `npm install --force`
   - **Verification:** Check `npx vite --version` works in build logs

2. **"Cannot GET /" Error on Render:**
   - **Cause:** Static files not being served correctly
   - **Solution:** Ensure `NODE_ENV=production` is set in Render environment variables
   - **Fix:** Check that the build completed successfully in Render logs
   - **Verify:** Look for "Static files exist: true" in server logs

3. **Build Failures:**
   - Check Node.js version compatibility (use Node 18+ for Render)
   - Verify all dependencies are listed in package.json
   - Ensure environment variables are set correctly
   - Confirm `terser` is installed: `npm install --save-dev terser`
   - Try the alternative build script: `./build-smart-crop.sh`

3. **Database Connection:**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings (set to 0.0.0.0/0 for Render)
   - Confirm database name matches configuration

4. **Static Files Not Found:**
   - Check Render build logs for successful React build
   - Verify `client/dist/index.html` exists after build
   - Ensure build command includes: `npm run build:install`

5. **Voice Features Not Working:**
   - Ensure HTTPS connection (required for Web Speech API)
   - Check browser compatibility
   - Verify microphone permissions

6. **Mobile Layout Issues:**
   - Clear browser cache
   - Test on multiple devices/browsers
   - Check responsive breakpoints

## 📞 Support

For deployment issues or feature requests:
- Check browser console for errors
- Verify all environment variables are set
- Test API endpoints individually
- Check Render deployment logs

## 🎉 Success!

Your Agricast application is now deployed and ready for use! The platform provides farmers with AI-powered insights, voice interaction, and comprehensive market data - all in a mobile-friendly interface.