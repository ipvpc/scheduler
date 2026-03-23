#!/bin/bash

# =============================================================================
# ALPHA5 SCHEDULER - DEVELOPMENT STARTUP SCRIPT
# =============================================================================

set -e

echo "🚀 Starting Alpha5 Scheduler Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
mkdir -p logs data monitoring/grafana/dashboards monitoring/grafana/datasources

# Start development environment
echo "📦 Starting services with development overrides..."
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

echo "✅ Development environment started!"
echo ""
echo "🌐 Services available at:"
echo "   - API: http://localhost:8001"
echo "   - Frontend: http://localhost:3001"
echo "   - Grafana: http://localhost:3000 (admin/admin)"
echo "   - Prometheus: http://localhost:9090"
echo "   - PgAdmin: http://localhost:5050 (admin@scheduler.local/admin)"
echo "   - Redis Commander: http://localhost:8081"
echo ""
echo "📊 API Documentation: http://localhost:8001/docs"
echo "🔍 Health Check: http://localhost:8001/health"
