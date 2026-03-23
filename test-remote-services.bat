@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - REMOTE SERVICES TEST
REM =============================================================================

echo 🔍 Testing Remote Services Architecture...

REM Test if services are running
echo Checking if services are running...
docker-compose ps

REM Test API health
echo.
echo Testing API health...
curl -f http://localhost:8001/health
if %errorlevel% neq 0 (
    echo ❌ API health check failed
    echo.
    echo 🔧 Troubleshooting steps:
    echo 1. Check if API container is running: docker-compose ps
    echo 2. Check API logs: docker-compose logs scheduler-api
    echo 3. Check if API can reach remote services
    exit /b 1
)

REM Test API connection to remote PostgreSQL
echo.
echo Testing API connection to remote PostgreSQL...
docker-compose exec scheduler-api python -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    print('✅ PostgreSQL connection successful')
    conn.close()
except Exception as e:
    print(f'❌ PostgreSQL connection failed: {e}')
    exit(1)
"
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL connection failed
    echo.
    echo 🔧 Check if POSTGRES_HOST from your environment is reachable from the API container
    echo Try: docker-compose exec scheduler-api ping YOUR_DB_HOST
    exit /b 1
)

REM Test API connection to remote Redis
echo.
echo Testing API connection to remote Redis...
docker-compose exec scheduler-api python -c "
import redis
import os
try:
    r = redis.Redis(host=os.getenv('REDIS_HOST'), port=int(os.getenv('REDIS_PORT')), db=int(os.getenv('REDIS_DB')))
    r.ping()
    print('✅ Redis connection successful')
except Exception as e:
    print(f'❌ Redis connection failed: {e}')
    exit(1)
"
if %errorlevel% neq 0 (
    echo ❌ Redis connection failed
    echo.
    echo 🔧 Check if REDIS_HOST from your environment is reachable from the API container
    echo Try: docker-compose exec scheduler-api ping YOUR_REDIS_HOST
    exit /b 1
)

REM Test frontend to API communication
echo.
echo Testing frontend to API communication...
docker-compose exec scheduler-frontend curl -f http://scheduler-api:8001/health
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
curl -f http://localhost:8001/api/tasks
if %errorlevel% neq 0 (
    echo ❌ API tasks endpoint failed
    echo.
    echo 🔧 This might be due to:
    echo 1. Database connection issues
    echo 2. Missing database tables
    echo 3. Enum value mismatches
    echo.
    echo Check database logs and enum values
    exit /b 1
)

echo.
echo ✅ All remote services tests passed!
echo.
echo 🌐 Architecture Summary:
echo    - Frontend → scheduler-api:8001 (Docker service name)
echo    - API → PostgreSQL (host/port from DATABASE_URL / POSTGRES_HOST)
echo    - API → Redis (REDIS_HOST:REDIS_PORT)
echo.
echo 🎉 Services are properly communicating with remote infrastructure!
