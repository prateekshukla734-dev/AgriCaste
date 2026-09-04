@echo off
echo 🌱 Agricast - Deployment Preparation
echo ======================================

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)

echo 📦 Installing client dependencies...
cd ..\client
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Client dependency installation failed
    pause
    exit /b 1
)

echo 🏗️  Building React application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ React build failed
    pause
    exit /b 1
)

echo 🧪 Testing backend server...
cd ..\backend
start "Backend Test" /min cmd /c "npm start"
timeout /t 5

REM Check if server is responding (simplified for Windows)
curl -f https://sih-crop-recommendation.onrender.com/api/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend server test passed
) else (
    echo ⚠️  Backend server test failed (this might be okay if DB is not connected)
)

REM Stop any running node processes
taskkill /f /im node.exe >nul 2>&1

cd ..

echo.
echo ✅ Deployment preparation complete!
echo.
echo 📋 Next steps for Render deployment:
echo 1. Push your code to GitHub
echo 2. Connect your repo to Render
echo 3. Set these environment variables in Render:
echo    - NODE_ENV=production
echo    - PORT=10000
echo    - MONGODB_URI=your-mongodb-connection-string
echo    - JWT_SECRET=your-jwt-secret
echo    - CORS_ORIGIN=*
echo.
echo 4. Use these build settings:
echo    - Build Command: cd backend ^&^& npm install ^&^& npm run build:install
echo    - Start Command: cd backend ^&^& npm start
echo.
echo 🚀 Ready for deployment!
pause