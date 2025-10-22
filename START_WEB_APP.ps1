# 🚀 Falcon Web App - Quick Start Script
# Starts both backend and frontend simultaneously

Write-Host "🛰️  FALCON DETECTION WEB APP" -ForegroundColor Cyan
Write-Host "NASA Space Apps Challenge 2025" -ForegroundColor Green
Write-Host "=" * 60

# Check if running from correct directory
$currentPath = Get-Location
Write-Host "`n📁 Current directory: $currentPath"

# Navigate to project root
cd c:\Users\jaink\OneDrive\Desktop\project

Write-Host "`n🔧 Step 1: Installing Backend Dependencies..." -ForegroundColor Yellow
cd web_app\backend
pip install -r requirements.txt

Write-Host "`n🔧 Step 2: Installing Frontend Dependencies..." -ForegroundColor Yellow
cd ..\frontend
npm install

Write-Host "`n✅ Installation Complete!" -ForegroundColor Green
Write-Host "`n" + ("=" * 60)
Write-Host "📝 TO START THE WEB APP:" -ForegroundColor Cyan
Write-Host "=" * 60

Write-Host "`n1️⃣  Start Backend (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd c:\Users\jaink\OneDrive\Desktop\project\web_app\backend"
Write-Host "   python app.py"

Write-Host "`n2️⃣  Start Frontend (Terminal 2):" -ForegroundColor Yellow
Write-Host "   cd c:\Users\jaink\OneDrive\Desktop\project\web_app\frontend"
Write-Host "   npm start"

Write-Host "`n3️⃣  Open Browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000"

Write-Host "`n" + ("=" * 60)
Write-Host "💡 TIP: Open two PowerShell terminals and run commands above" -ForegroundColor Green
Write-Host "=" * 60

# Ask user if they want to start now
Write-Host "`n❓ Do you want to start the servers now? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n🚀 Starting Backend Server..." -ForegroundColor Green
    cd ..\backend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\jaink\OneDrive\Desktop\project\web_app\backend; python app.py"
    
    Start-Sleep -Seconds 5
    
    Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
    cd ..\frontend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\jaink\OneDrive\Desktop\project\web_app\frontend; npm start"
    
    Write-Host "`n✅ Both servers starting in new windows!" -ForegroundColor Green
    Write-Host "📱 Frontend will open automatically at http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "`n👍 No problem! Run the commands manually when ready." -ForegroundColor Yellow
}

Write-Host "`n🎯 Happy detecting! 🛰️" -ForegroundColor Cyan
