# 🚀 Quick Start - Fixed Detection System
# Run this to start both backend and frontend with all fixes applied

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🛰️  FALCON DETECTION - FIXED VERSION" -ForegroundColor Cyan
Write-Host "  NASA Space Apps Challenge 2025" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ FIXES APPLIED:" -ForegroundColor Green
Write-Host "   • Model path corrected to falcon_yolov8m_final" -ForegroundColor Gray
Write-Host "   • Confidence threshold lowered to 0.15 (better detection)" -ForegroundColor Gray
Write-Host "   • Object names formatted: 'Oxygen Tank' (no underscores)" -ForegroundColor Gray
Write-Host "   • Enhanced logging for debugging" -ForegroundColor Gray
Write-Host "   • Improved model loading with fallbacks" -ForegroundColor Gray
Write-Host ""

# Check if backend is already running
$backendRunning = Get-Process python -ErrorAction SilentlyContinue | Where-Object { 
    $cmdline = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $cmdline -like "*app.py*"
}

if ($backendRunning) {
    Write-Host "⚠️  Backend already running (PID: $($backendRunning.Id))" -ForegroundColor Yellow
    Write-Host "   Stopping and restarting..." -ForegroundColor Gray
    Stop-Process -Id $backendRunning.Id -Force
    Start-Sleep -Seconds 2
}

# Check if frontend is already running
$frontendRunning = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $cmdline = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $cmdline -like "*react-scripts*"
}

if ($frontendRunning) {
    Write-Host "✅ Frontend already running (PID: $($frontendRunning.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend not running - starting it..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"
    Write-Host "   Frontend starting in new window..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Starting Backend..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PSScriptRoot\backend'
Write-Host ''
Write-Host '🔧 BACKEND SERVER' -ForegroundColor Cyan
Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Gray
Write-Host 'Model: falcon_yolov8m_final/weights/best.pt' -ForegroundColor Gray
Write-Host 'Confidence: 0.15 (15%)' -ForegroundColor Gray
Write-Host 'API: http://localhost:8000' -ForegroundColor Yellow
Write-Host 'Docs: http://localhost:8000/docs' -ForegroundColor Yellow
Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Gray
Write-Host ''
python app.py
"@

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✅ SERVICES STARTING" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "🔧 Backend:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000" -ForegroundColor Yellow
Write-Host "📚 API Docs: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📝 TESTING:" -ForegroundColor Cyan
Write-Host "   1. Wait 10 seconds for services to fully start" -ForegroundColor Gray
Write-Host "   2. Open: http://localhost:3000" -ForegroundColor Gray
Write-Host "   3. Go to Upload tab" -ForegroundColor Gray
Write-Host "   4. Select image from test3/images/" -ForegroundColor Gray
Write-Host "   5. See detections with proper names!" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Or run: " -NoNewline -ForegroundColor Cyan
Write-Host "python test_detection.py" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Read: " -NoNewline -ForegroundColor Cyan
Write-Host "FIX_SUMMARY.md for complete details" -ForegroundColor Yellow
Write-Host ""

# Wait a bit then test health
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 8

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Model loaded: $($response.model_loaded)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎉 All systems ready! Open http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend still starting... Check the backend window" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
