# Restart Backend Server Script
# This script stops any running backend and starts a fresh one

Write-Host "🔄 Restarting Falcon Detection Backend..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing Python processes running app.py
Write-Host "⏹️  Stopping existing backend..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*python*" } | ForEach-Object {
    $cmdline = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmdline -like "*app.py*") {
        Write-Host "   Stopping process: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

# Navigate to backend directory
Set-Location "$PSScriptRoot\backend"

Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host "   Model: runs/train/falcon_yolov8m_final/weights/best.pt" -ForegroundColor Gray
Write-Host "   Confidence: 0.15 (15%)" -ForegroundColor Gray
Write-Host "   API: http://localhost:8000" -ForegroundColor Gray
Write-Host "   Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Watch for detection logs below..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Start the backend
python app.py
