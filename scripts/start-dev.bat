@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - DEVELOPMENT STARTUP SCRIPT (Windows)
REM =============================================================================

echo 🚀 Starting Alpha5 Scheduler Development Environment...

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

REM Start development environment
echo 📦 Starting services with development overrides...
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

echo ✅ Development environment started!
echo.
echo 🌐 Services available at:
echo    - API: http://localhost:8001
echo    - Frontend: http://localhost:3001
echo    - Grafana: http://localhost:3000 (admin/admin)
echo    - Prometheus: http://localhost:9090
echo    - PgAdmin: http://localhost:5050 (admin@scheduler.local/admin)
echo    - Redis Commander: http://localhost:8081
echo.
echo 📊 API Documentation: http://localhost:8001/docs
echo 🔍 Health Check: http://localhost:8001/health
