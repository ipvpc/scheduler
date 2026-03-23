# HTTP Request Task Examples

This document provides comprehensive examples of creating HTTP request tasks in the scheduler service.

## Table of Contents
- [Basic GET Request](#basic-get-request)
- [POST Request with Body](#post-request-with-body)
- [Authenticated Request (Bearer Token)](#authenticated-request-bearer-token)
- [Authenticated Request (API Key)](#authenticated-request-api-key)
- [Request with Query Parameters](#request-with-query-parameters)
- [Cron Scheduled Task](#cron-scheduled-task)
- [Interval Scheduled Task](#interval-scheduled-task)
- [Task with Retry Configuration](#task-with-retry-configuration)

## Basic GET Request

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Health Check API",
    "description": "Check API health every 5 minutes",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 300,
    "http_method": "GET",
    "url": "https://api.example.com/health",
    "timeout_seconds": 30,
    "max_retries": 3,
    "retry_delay_seconds": 60,
    "timezone": "America/New_York",
    "tags": ["health-check", "monitoring"]
  }'
```

### Using Python

```python
import requests

task_data = {
    "name": "Health Check API",
    "description": "Check API health every 5 minutes",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 300,
    "http_method": "GET",
    "url": "https://api.example.com/health",
    "timeout_seconds": 30,
    "max_retries": 3,
    "retry_delay_seconds": 60,
    "timezone": "America/New_York",
    "tags": ["health-check", "monitoring"]
}

response = requests.post("http://localhost:8001/api/tasks", json=task_data)
print(response.json())
```

## POST Request with Body

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Market Data Sync",
    "description": "Sync market data daily at 9 AM",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1-5",
    "http_method": "POST",
    "url": "https://api.marketdata.com/v1/sync",
    "headers": {
      "Content-Type": "application/json"
    },
    "request_body": "{\"date\": \"2024-01-08\", \"symbols\": [\"AAPL\", \"MSFT\", \"GOOGL\"]}",
    "timeout_seconds": 60,
    "max_retries": 3,
    "retry_delay_seconds": 120,
    "timezone": "America/New_York",
    "tags": ["market-data", "daily-sync"]
  }'
```

### Using Python

```python
import requests
import json

task_data = {
    "name": "Daily Market Data Sync",
    "description": "Sync market data daily at 9 AM",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1-5",
    "http_method": "POST",
    "url": "https://api.marketdata.com/v1/sync",
    "headers": {
        "Content-Type": "application/json"
    },
    "request_body": json.dumps({
        "date": "2024-01-08",
        "symbols": ["AAPL", "MSFT", "GOOGL"]
    }),
    "timeout_seconds": 60,
    "max_retries": 3,
    "retry_delay_seconds": 120,
    "timezone": "America/New_York",
    "tags": ["market-data", "daily-sync"]
}

response = requests.post("http://localhost:8001/api/tasks", json=task_data)
print(response.json())
```

## Authenticated Request (Bearer Token)

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alpaca Account Status",
    "description": "Check Alpaca account status every hour",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 * * * *",
    "http_method": "GET",
    "url": "https://api.alpaca.markets/v2/account",
    "auth_type": "bearer",
    "auth_token": "YOUR_ALPACA_API_KEY",
    "headers": {
      "APCA-API-KEY-ID": "YOUR_KEY_ID",
      "APCA-API-SECRET-KEY": "YOUR_SECRET_KEY"
    },
    "timeout_seconds": 30,
    "max_retries": 2,
    "retry_delay_seconds": 30,
    "timezone": "America/New_York",
    "tags": ["alpaca", "account", "monitoring"]
  }'
```

### Using Python

```python
import requests

task_data = {
    "name": "Alpaca Account Status",
    "description": "Check Alpaca account status every hour",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 * * * *",
    "http_method": "GET",
    "url": "https://api.alpaca.markets/v2/account",
    "auth_type": "bearer",
    "auth_token": "YOUR_ALPACA_API_KEY",
    "headers": {
        "APCA-API-KEY-ID": "YOUR_KEY_ID",
        "APCA-API-SECRET-KEY": "YOUR_SECRET_KEY"
    },
    "timeout_seconds": 30,
    "max_retries": 2,
    "retry_delay_seconds": 30,
    "timezone": "America/New_York",
    "tags": ["alpaca", "account", "monitoring"]
}

response = requests.post("http://localhost:8001/api/tasks", json=task_data)
print(response.json())
```

## Authenticated Request (API Key)

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FRED Economic Data",
    "description": "Fetch FRED economic indicators daily",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 8 * * 1-5",
    "http_method": "GET",
    "url": "https://api.stlouisfed.org/fred/series/observations",
    "auth_type": "api_key",
    "auth_api_key": "YOUR_FRED_API_KEY",
    "query_params": {
      "series_id": "UNRATE",
      "file_type": "json",
      "api_key": "YOUR_FRED_API_KEY"
    },
    "timeout_seconds": 45,
    "max_retries": 3,
    "retry_delay_seconds": 60,
    "timezone": "America/New_York",
    "tags": ["fred", "economic-data"]
  }'
```

## Request with Query Parameters

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stock Price Check",
    "description": "Get stock prices every 15 minutes during market hours",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "*/15 9-16 * * 1-5",
    "http_method": "GET",
    "url": "https://api.marketdata.com/v1/prices",
    "query_params": {
      "symbols": "AAPL,MSFT,GOOGL,AMZN",
      "format": "json",
      "include_volume": "true"
    },
    "headers": {
      "Accept": "application/json"
    },
    "timeout_seconds": 30,
    "max_retries": 2,
    "retry_delay_seconds": 30,
    "timezone": "America/New_York",
    "tags": ["stocks", "prices", "market-hours"]
  }'
```

## Cron Scheduled Task

### Common Cron Patterns

```bash
# Every minute
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minute Check",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "* * * * *",
    "http_method": "GET",
    "url": "https://api.example.com/check"
  }'

# Every 5 minutes
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "5 Minute Check",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "*/5 * * * *",
    "http_method": "GET",
    "url": "https://api.example.com/check"
  }'

# Every hour at minute 0
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hourly Check",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 * * * *",
    "http_method": "GET",
    "url": "https://api.example.com/check"
  }'

# Every day at 9 AM (weekdays only)
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily 9 AM Task",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1-5",
    "http_method": "GET",
    "url": "https://api.example.com/check",
    "timezone": "America/New_York"
  }'

# Every Monday at 8 AM
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekly Monday Task",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 8 * * 1",
    "http_method": "GET",
    "url": "https://api.example.com/check"
  }'
```

## Interval Scheduled Task

### Using cURL

```bash
# Every 30 seconds
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "30 Second Poll",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 30,
    "http_method": "GET",
    "url": "https://api.example.com/poll"
  }'

# Every 5 minutes (300 seconds)
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "5 Minute Poll",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 300,
    "http_method": "GET",
    "url": "https://api.example.com/poll"
  }'

# Every hour (3600 seconds)
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hourly Poll",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 3600,
    "http_method": "GET",
    "url": "https://api.example.com/poll"
  }'
```

## Task with Retry Configuration

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Critical API Call with Retries",
    "description": "Important API call with aggressive retry strategy",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 60,
    "http_method": "POST",
    "url": "https://api.critical.com/endpoint",
    "headers": {
      "Content-Type": "application/json"
    },
    "request_body": "{\"action\": \"process\"}",
    "timeout_seconds": 45,
    "max_retries": 5,
    "retry_delay_seconds": 10,
    "concurrent_executions": 1,
    "timezone": "America/New_York",
    "tags": ["critical", "retry"]
  }'
```

## Complete Example: Market Data Webhook

### Using Python

```python
import requests
import json

# Create a task that sends market data to a webhook every minute during market hours
task_data = {
    "name": "Market Data Webhook",
    "description": "Send market data to webhook every minute during trading hours",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "* 9-16 * * 1-5",  # Every minute, 9 AM to 4 PM, weekdays
    "http_method": "POST",
    "url": "https://your-webhook.com/market-data",
    "headers": {
        "Content-Type": "application/json",
        "X-API-Key": "your-webhook-api-key"
    },
    "request_body": json.dumps({
        "timestamp": "{{timestamp}}",
        "source": "scheduler",
        "data": {
            "symbols": ["AAPL", "MSFT", "GOOGL"]
        }
    }),
    "auth_type": "bearer",
    "auth_token": "your-bearer-token",
    "timeout_seconds": 30,
    "max_retries": 3,
    "retry_delay_seconds": 15,
    "concurrent_executions": 1,
    "timezone": "America/New_York",
    "created_by": "system",
    "tags": ["webhook", "market-data", "real-time"]
}

response = requests.post("http://localhost:8001/api/tasks", json=task_data)
task = response.json()
print(f"Created task: {task['name']} (ID: {task['id']})")
```

## Managing Tasks

### Start a Task

```bash
curl -X POST http://localhost:8001/api/tasks/{task_id}/start
```

### Stop a Task

```bash
curl -X POST http://localhost:8001/api/tasks/{task_id}/stop
```

### Execute Task Immediately

```bash
curl -X POST http://localhost:8001/api/tasks/{task_id}/execute
```

### Get Task Status

```bash
curl http://localhost:8001/api/tasks/{task_id}/status
```

### Get Execution History

```bash
curl http://localhost:8001/api/tasks/{task_id}/executions
```

### Get Task Logs

```bash
curl http://localhost:8001/api/tasks/{task_id}/logs
```

## Field Reference

### Required Fields
- `name`: Task name (string, 1-255 characters)
- `url`: HTTP endpoint URL (string)
- `schedule_type`: Either "cron" or "interval" (string)
- `cron_expression`: Required if `schedule_type` is "cron" (string)
- `interval_seconds`: Required if `schedule_type` is "interval" (integer, >= 1)

### Optional Fields
- `description`: Task description (string)
- `task_type`: Default is "http_request" (string)
- `http_method`: HTTP method, default is "GET" (GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)
- `headers`: HTTP headers (object/dict)
- `query_params`: URL query parameters (object/dict)
- `request_body`: Request body for POST/PUT requests (string)
- `timeout_seconds`: Request timeout, default 30 (integer, 1-300)
- `auth_type`: Authentication type (none|bearer|basic|api_key)
- `auth_token`: Bearer token (string)
- `auth_username`: Basic auth username (string)
- `auth_password`: Basic auth password (string)
- `auth_api_key`: API key (string)
- `max_retries`: Maximum retry attempts, default 3 (integer, 0-10)
- `retry_delay_seconds`: Delay between retries, default 60 (integer, 1-3600)
- `concurrent_executions`: Max concurrent executions, default 1 (integer, 1-10)
- `timezone`: Timezone for scheduling, default "America/New_York" (string)
- `created_by`: Creator identifier (string)
- `tags`: Task tags (array of strings)

## Notes

- All timestamps are in UTC unless specified by `timezone`
- Cron expressions follow standard cron format: `minute hour day month day-of-week`
- For interval scheduling, `interval_seconds` must be at least 1
- Tasks are created in "active" status by default and will start immediately
- Use `status: "inactive"` in the request body to create a task without starting it
- JSON fields (`headers`, `query_params`, `tags`) should be provided as objects/arrays, not strings
- `request_body` should be a JSON string if sending JSON data
