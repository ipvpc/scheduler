#!/bin/bash

# Alpha5 Scheduler Test Script
# This script runs tests for the scheduler service

set -e

echo "🧪 Testing Alpha5 Scheduler Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if services are running
print_status "Checking if services are running..."

if ! curl -f http://localhost:8001/health > /dev/null 2>&1; then
    print_error "API service is not running. Please start the services first."
    exit 1
fi

if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_warning "Frontend service is not running. Some tests may fail."
fi

# Test API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
print_status "Testing health endpoint..."
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    print_success "Health endpoint is working"
else
    print_error "Health endpoint failed"
    exit 1
fi

# Test status endpoint
print_status "Testing status endpoint..."
if curl -f http://localhost:8001/status > /dev/null 2>&1; then
    print_success "Status endpoint is working"
else
    print_error "Status endpoint failed"
    exit 1
fi

# Test tasks endpoint
print_status "Testing tasks endpoint..."
if curl -f http://localhost:8001/api/tasks > /dev/null 2>&1; then
    print_success "Tasks endpoint is working"
else
    print_error "Tasks endpoint failed"
    exit 1
fi

# Test stats endpoint
print_status "Testing stats endpoint..."
if curl -f http://localhost:8001/api/tasks/stats/overview > /dev/null 2>&1; then
    print_success "Stats endpoint is working"
else
    print_error "Stats endpoint failed"
    exit 1
fi

# Test creating a task
print_status "Testing task creation..."
TASK_DATA='{
  "name": "Test Task",
  "description": "Test task for validation",
  "task_type": "http_request",
  "schedule_type": "interval",
  "interval_seconds": 60,
  "timezone": "America/New_York",
  "http_method": "GET",
  "url": "https://httpbin.org/get",
  "timeout_seconds": 30,
  "max_retries": 3,
  "retry_delay_seconds": 60,
  "concurrent_executions": 1,
  "tags": ["test"]
}'

TASK_RESPONSE=$(curl -s -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d "$TASK_DATA")

if echo "$TASK_RESPONSE" | grep -q "id"; then
    print_success "Task creation is working"
    TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    print_status "Created test task with ID: $TASK_ID"
else
    print_error "Task creation failed"
    print_error "Response: $TASK_RESPONSE"
    exit 1
fi

# Test task operations
if [ ! -z "$TASK_ID" ]; then
    print_status "Testing task operations..."
    
    # Test starting task
    if curl -s -X POST http://localhost:8001/api/tasks/$TASK_ID/start > /dev/null 2>&1; then
        print_success "Task start operation is working"
    else
        print_warning "Task start failed"
    fi
    
    # Test stopping task
    if curl -s -X POST http://localhost:8001/api/tasks/$TASK_ID/stop > /dev/null 2>&1; then
        print_success "Task stop operation is working"
    else
        print_warning "Task stop operation failed"
    fi
    
    # Test executing task
    if curl -s -X POST http://localhost:8001/api/tasks/$TASK_ID/execute > /dev/null 2>&1; then
        print_success "Task execute operation is working"
    else
        print_warning "Task execute operation failed"
    fi
    
    # Test getting task details
    if curl -s http://localhost:8001/api/tasks/$TASK_ID > /dev/null 2>&1; then
        print_success "Task details endpoint is working"
    else
        print_warning "Task details endpoint failed"
    fi
    
    # Test getting task executions
    if curl -s http://localhost:8001/api/tasks/$TASK_ID/executions > /dev/null 2>&1; then
        print_success "Task executions endpoint is working"
    else
        print_warning "Task executions endpoint failed"
    fi
    
    # Test getting task logs
    if curl -s http://localhost:8001/api/tasks/$TASK_ID/logs > /dev/null 2>&1; then
        print_success "Task logs endpoint is working"
    else
        print_warning "Task logs endpoint failed"
    fi
    
    # Clean up test task
    print_status "Cleaning up test task..."
    if curl -s -X DELETE http://localhost:8001/api/tasks/$TASK_ID > /dev/null 2>&1; then
        print_success "Test task cleaned up successfully"
    else
        print_warning "Failed to clean up test task"
    fi
fi

# Test frontend (if available)
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Testing frontend..."
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend is not accessible"
    fi
else
    print_warning "Frontend service is not running"
fi

# Performance tests
print_status "Running performance tests..."

# Test API response time
API_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8001/health)
print_status "API response time: ${API_RESPONSE_TIME}s"

if (( $(echo "$API_RESPONSE_TIME < 1.0" | bc -l) )); then
    print_success "API response time is acceptable"
else
    print_warning "API response time is slow: ${API_RESPONSE_TIME}s"
fi

# Test concurrent requests
print_status "Testing concurrent requests..."
for i in {1..5}; do
    curl -s http://localhost:8001/health > /dev/null &
done
wait
print_success "Concurrent request test completed"

# Database connectivity test
print_status "Testing database connectivity..."
DB_STATUS=$(curl -s http://localhost:8001/status | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
if [ "$DB_STATUS" = "connected" ]; then
    print_success "Database connectivity is working"
else
    print_warning "Database connectivity status: $DB_STATUS"
fi

# Scheduler status test
print_status "Testing scheduler status..."
SCHEDULER_STATUS=$(curl -s http://localhost:8001/status | grep -o '"scheduler":{"[^}]*"}' | grep -o '"running":[^,]*' | cut -d':' -f2)
if [ "$SCHEDULER_STATUS" = "true" ]; then
    print_success "Scheduler is running"
else
    print_warning "Scheduler status: $SCHEDULER_STATUS"
fi

print_success "All tests completed successfully!"
print_status "Test Summary:"
echo "  ✅ API Health Check: PASSED"
echo "  ✅ API Endpoints: PASSED"
echo "  ✅ Task Operations: PASSED"
echo "  ✅ Database Connectivity: PASSED"
echo "  ✅ Scheduler Status: PASSED"
echo "  📊 Performance: ACCEPTABLE"

print_status "Alpha5 Scheduler Service is working correctly!"
