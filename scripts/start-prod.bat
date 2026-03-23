@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - PRODUCTION STARTUP SCRIPT (Windows)
REM =============================================================================

echo 🚀 Starting Alpha5 Scheduler Production Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create necessary directories
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "monitoring\grafana\dashboards" mkdir monitoring\grafana\dashboards
if not exist "monitoring\grafana\datasources" mkdir monitoring\grafana\datasources

REM Start production environment
echo 📦 Starting production services...
docker-compose up -d --build

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
docker-compose ps

echo ✅ Production environment started!
echo.
echo 🌐 Services available at:
echo    - API: http://localhost:8001
echo    - Frontend: http://localhost:3001
echo    - Grafana: http://localhost:3000 (admin/admin)
echo    - Prometheus: http://localhost:9090
echo.
echo 📊 API Documentation: http://localhost:8001/docs
echo 🔍 Health Check: http://localhost:8001/health
