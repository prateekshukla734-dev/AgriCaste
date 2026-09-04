# 🌱 Agricast - AI Agricultural Assistant

A comprehensive agricultural platform built with React and Node.js, featuring AI-powered crop recommendations, voice assistance, market insights, and mobile-first responsive design.

![Agricast Platform](https://img.shields.io/badge/Platform-Agricultural%20AI-green)
![Mobile Responsive](https://img.shields.io/badge/Mobile-Responsive-blue)
![Voice Enabled](https://img.shields.io/badge/Voice-Enabled-orange)

## 🌟 Key Features

### 🎯 Core Functionality
- **Smart Farm Management:** Add, manage, and track multiple farm locations with detailed soil and climate data
- **AI Crop Recommendations:** Machine learning-powered suggestions based on soil type, climate conditions, and market data
- **Voice Assistant:** Complete voice interaction with speech-to-text input and text-to-speech output
- **Market Intelligence:** Real-time crop prices with interactive charts and trend analysis
- **Weather Integration:** Climate-aware recommendations with weather forecast integration

### 📱 Mobile-First Design
- **Responsive Layout:** Seamlessly adapts to desktop, tablet, and mobile screens
- **Touch-Friendly Interface:** Optimized for mobile interactions with proper touch targets
- **Hamburger Navigation:** Collapsible mobile menu with smooth animations
- **PWA Support:** Progressive Web App capabilities for native-like mobile experience
- **Voice Controls:** Hands-free operation perfect for field use

### 🔊 Accessibility Features
- **Voice Navigation:** Complete voice control for all major functions
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **High Contrast:** Clear visual hierarchy with proper color contrast
- **Touch Accessibility:** Large, easy-to-tap interface elements

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smart-crop
   ```

2. **Run deployment preparation:**
   ```bash
   # On Windows
   deploy-prep.bat
   
   # On Mac/Linux
   chmod +x deploy-prep.sh
   ./deploy-prep.sh
   ```

3. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```

4. **Start development servers:**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev
   
   # Frontend (Terminal 2)
   cd client && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🌐 Deploy to Render

### One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment

1. **Prepare for deployment:**
   ```bash
   # Run the deployment preparation script
   ./deploy-prep.sh  # or deploy-prep.bat on Windows
   ```

2. **Set up MongoDB Atlas:**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Whitelist all IPs (0.0.0.0/0) for Render

3. **Deploy to Render:**
   - Connect your GitHub repository
   - Use build command: `cd backend && npm install && npm run build:install`
   - Use start command: `cd backend && npm start`
   - Set environment variables (see DEPLOYMENT.md)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📊 Technology Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Tailwind CSS** - Utility-first CSS framework with responsive design
- **Lucide React** - Beautiful, customizable icon library
- **React Router** - Client-side routing and navigation
- **TanStack Query** - Server state management and caching
- **Recharts** - Responsive chart library for data visualization
- **Web Speech API** - Native browser speech recognition and synthesis

### Backend
- **Node.js & Express** - Fast, scalable server environment
- **MongoDB & Mongoose** - NoSQL database with elegant ODM
- **JWT Authentication** - Secure token-based authentication
- **Voice Processing** - Speech-to-text and natural language processing
- **Market Data API** - Real-time agricultural market information
- **ML Integration** - Crop recommendation algorithms

### Deployment & DevOps
- **Render** - Cloud hosting platform with auto-deploy
- **MongoDB Atlas** - Cloud database service
- **Vite** - Fast build tool with optimizations
- **PWA Manifest** - Progressive Web App configuration

## 🎨 User Interface

### Desktop Experience
- **Dashboard:** Comprehensive farm overview with statistics and quick actions
- **Market Analysis:** Interactive charts with price trends and market insights
- **Recommendation Engine:** AI-powered crop suggestions with detailed analysis
- **Voice Assistant:** Floating voice controls with visual feedback

### Mobile Experience
- **Responsive Navigation:** Hamburger menu with touch-friendly design
- **Swipe Gestures:** Intuitive mobile interactions
- **Voice-First:** Optimized for hands-free operation in field conditions
- **Offline Support:** PWA capabilities for limited connectivity scenarios

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/v1/user/register - User registration
POST /api/v1/user/login    - User login
GET  /api/v1/user/profile  - Get user profile
```

### Farm Management
```
GET    /api/v1/farm        - List user farms
POST   /api/v1/farm        - Create new farm
GET    /api/v1/farm/:id    - Get farm details
PUT    /api/v1/farm/:id    - Update farm
DELETE /api/v1/farm/:id    - Delete farm
```

### AI Recommendations
```
POST /api/v1/ml/recommend  - Get crop recommendations
POST /api/v1/ml/analyze    - Analyze farm conditions
```

### Voice Processing
```
POST /api/v1/voice/process - Process voice input
POST /api/v1/voice/intent  - Analyze user intent
```

### Market Data
```
GET /api/v1/market/prices  - Get current market prices
GET /api/v1/market/trends  - Get price trends
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd client && npm test

# E2E tests
npm run test:e2e
```

### Voice Testing
The voice features require HTTPS in production. For local testing:
- Use localhost (automatically trusted)
- Test on mobile devices with microphone access
- Verify speech synthesis works across browsers

## 🔐 Security Features

- **JWT Authentication** with secure token management
- **Input Validation** using Joi schemas
- **CORS Configuration** with environment-specific origins
- **Rate Limiting** to prevent API abuse
- **Data Sanitization** to prevent injection attacks
- **Secure Headers** with appropriate security policies

## 🌍 Environmental Considerations

- **Optimized Bundle Size** with code splitting and tree shaking
- **Lazy Loading** for improved initial load times
- **Image Optimization** with responsive image delivery
- **CDN Integration** for static asset delivery
- **Minimal Dependencies** to reduce carbon footprint

## 📈 Performance Optimizations

- **React Query Caching** for efficient API calls
- **Bundle Splitting** for optimal loading
- **Service Worker** for offline functionality
- **Image Lazy Loading** for faster page loads
- **Database Indexing** for quick query responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenWeather API** for weather data
- **Agriculture Market Data** providers
- **React Community** for excellent documentation
- **Tailwind CSS** for the utility-first approach
- **Render Platform** for seamless deployment

## 📞 Support

- **Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- **Issues:** Create an issue on GitHub for bug reports
- **Discussions:** Use GitHub Discussions for questions and ideas

---

**Built with ❤️ for farmers worldwide** 🌾

*Empowering agriculture through technology, voice assistance, and AI-driven insights.*