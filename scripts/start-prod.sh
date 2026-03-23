#!/bin/bash

# =============================================================================
# ALPHA5 SCHEDULER - PRODUCTION STARTUP SCRIPT
# =============================================================================

set -e

echo "🚀 Starting Alpha5 Scheduler Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
mkdir -p logs data monitoring/grafana/dashboards monitoring/grafana/datasources

# Start production environment
echo "📦 Starting production services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
docker-compose ps

echo "✅ Production environment started!"
echo ""
echo "🌐 Services available at:"
echo "   - API: http://localhost:8001"
echo "   - Frontend: http://localhost:3001"
echo "   - Grafana: http://localhost:3000 (admin/admin)"
echo "   - Prometheus: http://localhost:9090"
echo ""
echo "📊 API Documentation: http://localhost:8001/docs"
echo "🔍 Health Check: http://localhost:8001/health"
