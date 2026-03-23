@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - LOCAL DEVELOPMENT STARTUP
REM =============================================================================

echo 🚀 Starting Alpha5 Scheduler Local Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create necessary directories
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "init-scripts" mkdir init-scripts

REM Start local development environment
echo 📦 Starting local services...
docker-compose -f docker-compose.local.yml up --build

echo ✅ Local development environment started!
echo.
echo 🌐 Services available at:
echo    - API: http://localhost:8001
echo    - Frontend: http://localhost:3001
echo    - API Docs: http://localhost:8001/docs
echo    - Health Check: http://localhost:8001/health
