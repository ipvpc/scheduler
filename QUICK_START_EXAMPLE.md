# Quick Start: HTTP Request Task Example

## Simple Example: Create a GET Request Task

### Using cURL

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Health Check",
    "description": "Check API health every 5 minutes",
    "task_type": "http_request",
    "schedule_type": "interval",
    "interval_seconds": 300,
    "http_method": "GET",
    "url": "https://api.example.com/health",
    "timeout_seconds": 30
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8001/api/tasks",
    json={
        "name": "Example Health Check",
        "description": "Check API health every 5 minutes",
        "task_type": "http_request",
        "schedule_type": "interval",
        "interval_seconds": 300,
        "http_method": "GET",
        "url": "https://api.example.com/health",
        "timeout_seconds": 30
    }
)

print(response.json())
```

## Example: POST Request with Authentication

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Data Sync",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1-5",
    "http_method": "POST",
    "url": "https://api.example.com/sync",
    "headers": {
      "Content-Type": "application/json"
    },
    "request_body": "{\"action\": \"sync\"}",
    "auth_type": "bearer",
    "auth_token": "your-token-here",
    "timeout_seconds": 60
  }'
```

## Example: Cron Schedule (Every Day at 9 AM)

```bash
curl -X POST http://localhost:8001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Report",
    "task_type": "http_request",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * *",
    "http_method": "GET",
    "url": "https://api.example.com/report",
    "timezone": "America/New_York"
  }'
```

## Common Cron Patterns

- Every minute: `"* * * * *"`
- Every 5 minutes: `"*/5 * * * *"`
- Every hour: `"0 * * * *"`
- Every day at 9 AM: `"0 9 * * *"`
- Weekdays at 9 AM: `"0 9 * * 1-5"`
- Every Monday at 8 AM: `"0 8 * * 1"`

## Next Steps

1. **Check task status**: `GET /api/tasks/{task_id}`
2. **View executions**: `GET /api/tasks/{task_id}/executions`
3. **View logs**: `GET /api/tasks/{task_id}/logs`
4. **Stop task**: `POST /api/tasks/{task_id}/stop`
5. **Start task**: `POST /api/tasks/{task_id}/start`

For more examples, see [EXAMPLES.md](./EXAMPLES.md)
