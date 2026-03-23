@echo off
REM =============================================================================
REM ALPHA5 SCHEDULER - STOP SCRIPT (Windows)
REM =============================================================================

echo 🛑 Stopping Alpha5 Scheduler Environment...

REM Stop all services
docker-compose down

REM Optionally remove volumes (uncomment if you want to reset data)
REM echo 🗑️ Removing volumes...
REM docker-compose down -v

echo ✅ All services stopped!
