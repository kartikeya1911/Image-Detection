@echo off
REM ============================================
REM Falcon Detection - Quick Run Script
REM NASA Space Apps Challenge 2025
REM ============================================

title Falcon Detection - Launcher

echo.
echo ================================================
echo    FALCON DETECTION - QUICK LAUNCHER
echo    NASA Space Apps Challenge 2025
echo ================================================
echo.

REM Check if we're in the correct directory
if not exist "backend\app.py" (
    echo [ERROR] Please run this script from the web_app directory!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [INFO] Starting Falcon Detection Web Application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Python and Node.js found!
echo.

REM Check if dependencies are installed
echo [STEP 1/4] Checking backend dependencies...
if not exist "backend\venv\" (
    echo [INFO] Backend dependencies not found. Installing...
    cd backend
    pip install -r requirements.txt
    cd ..
) else (
    echo [OK] Backend dependencies already installed
)

echo.
echo [STEP 2/4] Checking frontend dependencies...
if not exist "frontend\node_modules\" (
    echo [INFO] Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend dependencies already installed
)

echo.
echo ================================================
echo    STARTING SERVERS
echo ================================================
echo.
echo [STEP 3/4] Starting Backend Server...
echo Backend will run on: http://localhost:8000
echo.

REM Start backend in a new window
start "Falcon Detection - Backend" cmd /k "cd /d "%~dp0backend" && python app.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo [STEP 4/4] Starting Frontend Server...
echo Frontend will run on: http://localhost:3000
echo.

REM Start frontend in a new window
start "Falcon Detection - Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ================================================
echo    SERVERS STARTED!
echo ================================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend App: http://localhost:3000
echo API Docs:     http://localhost:8000/docs
echo.
echo The application will open in your browser automatically.
echo.
echo To STOP the servers:
echo   - Close the Backend and Frontend terminal windows
echo   - Or press Ctrl+C in each window
echo.
echo ================================================
echo.
echo Press any key to exit this launcher window...
pause >nul
