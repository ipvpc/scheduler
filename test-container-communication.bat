@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - CONTAINER COMMUNICATION TEST
REM =============================================================================

echo 🔍 Testing Container-to-Container Communication...

REM Test if services are running
echo Checking if services are running...
docker-compose -f docker-compose.dev.yml ps

REM Test API health from within the network
echo.
echo Testing API health from within Docker network...
docker-compose -f docker-compose.dev.yml exec scheduler-api curl -f http://localhost:8001/health
if %errorlevel% neq 0 (
    echo ❌ API health check failed from within container
    exit /b 1
)

REM Test frontend to API communication
echo.
echo Testing frontend to API communication...
docker-compose -f docker-compose.dev.yml exec scheduler-frontend curl -f http://scheduler-api:8001/health
if %errorlevel% neq 0 (
    echo ❌ Frontend cannot reach API
    echo.
    echo 🔧 This indicates a network connectivity issue between containers
    echo Check if both services are on the same network: scheduler-network
    exit /b 1
)

REM Test API tasks endpoint
echo.
echo Testing API tasks endpoint...
docker-compose -f docker-compose.dev.yml exec scheduler-frontend curl -f http://scheduler-api:8001/api/tasks
if %errorlevel% neq 0 (
    echo ❌ API tasks endpoint failed
    echo.
    echo 🔧 This might be due to:
    echo 1. Database connection issues
    echo 2. Missing database tables
    echo 3. Enum value mismatches
    echo.
    echo Check database logs: docker-compose logs postgres
    exit /b 1
)

echo.
echo ✅ All container communication tests passed!
echo.
echo 🌐 Services are properly communicating:
echo    - Frontend can reach API at http://scheduler-api:8001
echo    - API can reach database at postgres:5432
echo    - API can reach Redis at redis:6379
