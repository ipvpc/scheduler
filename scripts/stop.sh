#!/bin/bash

# =============================================================================
# ALPHA5 SCHEDULER - STOP SCRIPT
# =============================================================================

echo "🛑 Stopping Alpha5 Scheduler Environment..."

# Stop all services
docker-compose down

# Optionally remove volumes (uncomment if you want to reset data)
# echo "🗑️ Removing volumes..."
# docker-compose down -v

echo "✅ All services stopped!"
