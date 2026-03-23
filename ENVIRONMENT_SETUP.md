# Alpha5 Scheduler - Environment Setup Guide

This guide explains how to set up the local development environment for the Alpha5 Scheduler application.

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)
```bash
# Start all services with Docker
docker-compose up scheduler-api scheduler-frontend

# Or use the build script
cd backend/scheduler
./build.sh
```

### Option 2: Local Development
```bash
# Start development environment
cd backend/scheduler
./start-dev.sh
```

## 📁 Environment Files

### Backend Environment (`local.env`)
The backend uses the `local.env` file for all configuration variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://markets:p0w3rb4r@localhost:5432/markets_prod
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=markets_prod
POSTGRES_USER=markets
POSTGRES_PASSWORD=p0w3rb4r

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001
API_RELOAD=True
```

### Frontend Environment (`frontend/local.env`)
The frontend uses the `frontend/local.env` file for React environment variables:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8001
REACT_APP_WS_URL=ws://localhost:8001/ws

# Application Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
```

## 🔧 Configuration Categories

### 1. Database Configuration
```bash
# PostgreSQL Settings
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=markets_prod
POSTGRES_USER=markets
POSTGRES_PASSWORD=p0w3rb4r

# Connection Pool Settings
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

### 2. Redis Configuration
```bash
# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2
REDIS_PASSWORD=
REDIS_SSL=False
REDIS_TIMEOUT=5
REDIS_MAX_CONNECTIONS=20
```

### 3. Scheduler Configuration
```bash
# Scheduler Settings
SCHEDULER_TIMEZONE=America/New_York
MAX_CONCURRENT_TASKS=100
TASK_TIMEOUT=300
SCHEDULER_POOL_SIZE=10
SCHEDULER_MAX_WORKERS=20

# Job Store Configuration
JOB_STORE_URL=sqlite:///jobs.sqlite
JOB_STORE_TABLE=apscheduler_jobs
JOB_STORE_ECHO=False
```

### 4. API Configuration
```bash
# Server Settings
API_HOST=0.0.0.0
API_PORT=8001
API_WORKERS=1
API_RELOAD=True
API_LOG_LEVEL=info

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=True
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=*
```

### 5. Authentication & Security
```bash
# Security Settings
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# API Key Configuration
API_KEY_HEADER=X-API-Key
API_KEY_VALUE=your-api-key-for-development
```

### 6. Logging Configuration
```bash
# Logging Settings
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
LOG_FILE=logs/scheduler.log
LOG_MAX_SIZE=10485760
LOG_BACKUP_COUNT=5

# Structured Logging
LOG_STRUCTURED=True
LOG_JSON_FORMAT=True
```

### 7. Task Execution Configuration
```bash
# Task Settings
DEFAULT_TIMEOUT=30
DEFAULT_MAX_RETRIES=3
DEFAULT_RETRY_DELAY=60
DEFAULT_CONCURRENT_EXECUTIONS=1

# HTTP Client Settings
HTTP_TIMEOUT=30
HTTP_MAX_RETRIES=3
HTTP_RETRY_DELAY=1
HTTP_POOL_CONNECTIONS=10
HTTP_POOL_MAXSIZE=20
```

### 8. Monitoring & Health Checks
```bash
# Health Check Settings
HEALTH_CHECK_INTERVAL=30
HEALTH_CHECK_TIMEOUT=10
HEALTH_CHECK_RETRIES=3

# Metrics Settings
METRICS_ENABLED=True
METRICS_PORT=9090
METRICS_PATH=/metrics
```

### 9. Frontend Configuration
```bash
# API Settings
REACT_APP_API_URL=http://localhost:8001
REACT_APP_WS_URL=ws://localhost:8001/ws
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_RETRY_ATTEMPTS=3

# Application Settings
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_HOT_RELOAD=true
```

### 10. External Services
```bash
# Alpaca API Configuration
ALPACA_API_KEY=PKURKFASXB04JMSMLTGX
ALPACA_SECRET_KEY=noh5VrukdfEzlPfRczkJ6ukU5tIMc5jG4eNhOP8c
ALPACA_API_URL=https://paper-api.alpaca.markets
ALPACA_WS_URL=wss://stream.data.alpaca.markets/v2/iex

# Market Data Settings
MARKET_DATA_ENABLED=True
MARKET_DATA_REALTIME=True
MARKET_DATA_CACHE_TTL=300
```

### 11. Notification Configuration
```bash
# Notification Settings
NOTIFICATIONS_ENABLED=True
NOTIFICATION_EMAIL_ENABLED=False
NOTIFICATION_SLACK_ENABLED=False
NOTIFICATION_WEBHOOK_ENABLED=True

# Email Settings (if enabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=True

# Slack Settings (if enabled)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#scheduler-alerts
```

### 12. Caching Configuration
```bash
# Cache Settings
CACHE_ENABLED=True
CACHE_TTL=300
CACHE_MAX_SIZE=1000
CACHE_BACKEND=redis
```

### 13. Performance Configuration
```bash
# Worker Settings
WORKER_PROCESSES=1
WORKER_THREADS=4
WORKER_CONNECTIONS=1000

# Memory Settings
MAX_MEMORY_USAGE=512MB
MEMORY_CLEANUP_INTERVAL=300
```

### 14. Development Tools
```bash
# Development Settings
DEBUG=True
DEVELOPMENT=True
TESTING=False
PROFILING=False

# Hot Reload Settings
HOT_RELOAD=True
HOT_RELOAD_INTERVAL=1
HOT_RELOAD_DEBOUNCE=1000
```

### 15. Feature Flags
```bash
# Feature Toggles
FEATURE_BULK_OPERATIONS=True
FEATURE_TASK_TEMPLATES=True
FEATURE_ADVANCED_SCHEDULING=True
FEATURE_REAL_TIME_MONITORING=True
FEATURE_EXECUTION_HISTORY=True
FEATURE_PERFORMANCE_ANALYTICS=True
FEATURE_ALERT_SYSTEM=True
FEATURE_API_DOCUMENTATION=True
```

## 🛠️ Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker (optional)

### Backend Setup
```bash
cd backend/scheduler

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Load environment variables
export $(cat local.env | grep -v '^#' | xargs)

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
cd backend/scheduler/frontend

# Install dependencies
npm install

# Load environment variables
export $(cat local.env | grep -v '^#' | xargs)

# Start the service
npm start
```

## 🐳 Docker Setup

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up scheduler-api scheduler-frontend

# View logs
docker-compose logs -f scheduler-api
```

### Environment Variables in Docker
```yaml
# docker-compose.yml
services:
  scheduler-api:
    environment:
      - DATABASE_URL=postgresql://markets:p0w3rb4r@postgres:5432/markets_prod
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SCHEDULER_TIMEZONE=America/New_York
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Check connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection Failed**
   ```bash
   # Check if Redis is running
   redis-cli -h localhost -p 6379 ping
   
   # Check Redis configuration
   echo $REDIS_HOST:$REDIS_PORT
   ```

3. **Frontend API Connection Failed**
   ```bash
   # Check if backend is running
   curl http://localhost:8001/health
   
   # Check API URL
   echo $REACT_APP_API_URL
   ```

4. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

### Environment Validation
```bash
# Validate environment variables
python -c "
import os
from dotenv import load_dotenv
load_dotenv('local.env')
print('Database URL:', os.getenv('DATABASE_URL'))
print('Redis Host:', os.getenv('REDIS_HOST'))
print('API Port:', os.getenv('API_PORT'))
"
```

## 📊 Monitoring

### Health Checks
- **Backend**: http://localhost:8001/health
- **Frontend**: http://localhost:3001/health
- **API Docs**: http://localhost:8001/docs
- **Service Status**: http://localhost:8001/status

### Logs
```bash
# Backend logs
tail -f logs/scheduler.log

# Docker logs
docker-compose logs -f scheduler-api
docker-compose logs -f scheduler-frontend
```

## 🔐 Security Notes

1. **Change Default Secrets**: Update all default passwords and API keys
2. **Environment Files**: Never commit `.env` files to version control
3. **Database Access**: Use strong passwords and limit network access
4. **API Keys**: Rotate API keys regularly
5. **HTTPS**: Use HTTPS in production environments

## 📝 Environment File Template

Create your own environment file by copying the template:

```bash
# Copy template
cp local.env.example local.env

# Edit with your values
nano local.env
```

## 🚀 Production Deployment

For production deployment, use environment-specific configuration:

```bash
# Production environment
export NODE_ENV=production
export PYTHON_ENV=production
export ENVIRONMENT=production
export DEBUG=False
export DEVELOPMENT=False
```

---

**Alpha5 Scheduler** - Professional task scheduling for hedge fund operations
