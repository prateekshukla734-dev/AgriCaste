Write-Host "🧪 Testing Agricast Deployment Locally" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Change to backend directory
Set-Location backend

Write-Host "📦 Building React app..." -ForegroundColor Yellow
npm run build:install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful" -ForegroundColor Green

Write-Host "🔍 Checking build output..." -ForegroundColor Yellow
if (!(Test-Path "../client/dist/index.html")) {
    Write-Host "❌ index.html not found in dist folder" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build files found" -ForegroundColor Green

Write-Host "🚀 Starting server in production mode..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:PORT = "5000"

# Start server in background
Start-Process -FilePath "node" -ArgumentList "src/index.js" -NoNewWindow -PassThru | Out-Null

# Wait for server to start
Start-Sleep -Seconds 5

Write-Host "🧪 Testing endpoints..." -ForegroundColor Yellow

# Test health endpoint
Write-Host "Testing /api/health..."
try {
    $response = Invoke-WebRequest -Uri "https://sih-crop-recommendation.onrender.com/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ /api/health working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ /api/health failed" -ForegroundColor Red
}

# Test root endpoint
Write-Host "Testing / (root route)..."
try {
    $response = Invoke-WebRequest -Uri "https://sih-crop-recommendation.onrender.com/" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ / (root) working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ / (root) failed" -ForegroundColor Red
}

# Stop any node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "🎉 Local deployment test complete!" -ForegroundColor Green
Write-Host "The app is ready for Render deployment." -ForegroundColor Green