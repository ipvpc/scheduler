@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - EXTERNAL IP ACCESS TEST
REM =============================================================================

echo 🔍 Testing External IP Access (192.168.10.32:3000)...

REM Test if services are running
echo Checking if services are running...
docker-compose ps

REM Test API health from external IP
echo.
echo Testing API health from external IP...
curl -f http://192.168.10.32:8001/health
if %errorlevel% neq 0 (
    echo ❌ API health check failed from external IP
    echo.
    echo 🔧 Troubleshooting steps:
    echo 1. Check if API is accessible: curl http://192.168.10.32:8001/health
    echo 2. Check if port 8001 is open: netstat -an | findstr :8001
    echo 3. Check firewall settings
    exit /b 1
)

REM Test frontend accessibility from external IP
echo.
echo Testing frontend accessibility from external IP...
curl -f http://192.168.10.32:3000/
if %errorlevel% neq 0 (
    echo ❌ Frontend not accessible from external IP
    echo.
    echo 🔧 Troubleshooting steps:
    echo 1. Check if frontend is running: docker-compose ps
    echo 2. Check if port 3000 is open: netstat -an | findstr :3000
    echo 3. Check if HOST=0.0.0.0 is set in frontend environment
    exit /b 1
)

REM Test CORS configuration
echo.
echo Testing CORS configuration...
curl -H "Origin: http://192.168.10.32:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS http://192.168.10.32:8001/api/tasks
if %errorlevel% neq 0 (
    echo ❌ CORS preflight request failed
    echo.
    echo 🔧 Check CORS_ORIGINS includes http://192.168.10.32:3000
    exit /b 1
)

echo.
echo ✅ External IP access tests passed!
echo.
echo 🌐 Services accessible at:
echo    - API: http://192.168.10.32:8001
echo    - Frontend: http://192.168.10.32:3000
echo    - API Docs: http://192.168.10.32:8001/docs
echo.
echo 🎉 External access is properly configured!
