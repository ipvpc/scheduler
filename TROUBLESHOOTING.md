# Alpha5 Scheduler - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Network Error: `AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK'}`

**Problem**: Frontend cannot connect to backend API.

**Solutions**:

#### Option A: Use Local Development Environment
```bash
# Use the local development configuration
docker-compose -f docker-compose.local.yml up --build
```

#### Option B: Check Service Status
```bash
# Check if services are running
docker-compose ps

# Check API logs
docker-compose logs scheduler-api

# Check frontend logs
docker-compose logs scheduler-frontend
```

#### Option C: Test API Connection
```bash
# Test API health
curl http://localhost:8001/health

# Test API tasks endpoint
curl http://localhost:8001/api/tasks
```

### 2. Database Enum Error: `invalid input value for enum taskstatus: "active"`

**Problem**: PostgreSQL database doesn't recognize the enum values.

**Solutions**:

#### Option A: Run Database Migration
```bash
# The init-scripts should run automatically, but you can also run manually
docker-compose exec postgres psql -U markets -d markets_prod -f /docker-entrypoint-initdb.d/01-fix-enums.sql
```

#### Option B: Check Database Enums
```bash
# Connect to database and check enum values
docker-compose exec postgres psql -U markets -d markets_prod -c "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'taskstatus';"
```

#### Option C: Reset Database
```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm scheduler_postgres_data

# Start services again
docker-compose up --build
```

### 3. Frontend Build Errors

**Problem**: TypeScript, ESLint, or dependency errors during build.

**Solutions**:

#### Option A: Clear npm cache
```bash
# In frontend directory
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Option B: Check TypeScript version
```bash
# Ensure TypeScript version is compatible
npm list typescript
# Should be ^4.9.5 for react-scripts@5.0.1
```

### 4. Port Conflicts

**Problem**: Ports 3000, 3001, 8001, 5432, or 6379 are already in use.

**Solutions**:

#### Option A: Check port usage
```bash
# Windows
netstat -an | findstr :8001
netstat -an | findstr :3001
netstat -an | findstr :5432
netstat -an | findstr :6379
```

#### Option B: Change ports in docker-compose.yml
```yaml
# Change port mappings
ports:
  - "8002:8001"  # API on port 8002
  - "3002:3001"  # Frontend on port 3002
```

### 5. Docker Image Issues

**Problem**: Cannot pull external Docker images.

**Solutions**:

#### Option A: Use Local Development
```bash
# Use local development configuration
docker-compose -f docker-compose.local.yml up --build
```

#### Option B: Build Images Locally
```bash
# Build API image
docker build -t scheduler-api:latest .

# Build frontend image
docker build -t scheduler-frontend:latest ./frontend
```

## 🔧 Quick Fixes

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove all volumes
docker volume prune

# Remove all containers
docker container prune

# Start fresh
docker-compose -f docker-compose.local.yml up --build
```

### Check Service Health
```bash
# Check all service status
docker-compose ps

# Check service logs
docker-compose logs [service-name]

# Check service health
docker-compose exec [service-name] curl -f http://localhost:[port]/health
```

### Database Issues
```bash
# Connect to database
docker-compose exec postgres psql -U markets -d markets_prod

# Check tables
\dt

# Check enum types
\dT

# Check enum values
SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'taskstatus';
```

## 📋 Service URLs

### Local Development
- **API**: http://localhost:8001
- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

### Production
- **API**: http://scheduler-api:8001
- **Frontend**: http://scheduler-frontend:3001

## 🚀 Quick Start Commands

### Start Local Development
```bash
# Windows
start-local.bat

# Or manually
docker-compose -f docker-compose.local.yml up --build
```

### Test API Connection
```bash
# Windows
test-api.bat

# Or manually
curl http://localhost:8001/health
curl http://localhost:8001/api/tasks
```

### Stop Services
```bash
docker-compose down
```

## 📞 Support

If you continue to experience issues:

1. **Check logs**: `docker-compose logs [service-name]`
2. **Verify configuration**: Check `docker-compose.yml` settings
3. **Test connectivity**: Use `curl` or browser to test endpoints
4. **Reset environment**: Use the reset commands above
5. **Check Docker**: Ensure Docker is running and accessible

## 🔍 Debugging Tips

### Enable Debug Logging
```bash
# Set debug environment variables
export LOG_LEVEL=DEBUG
export DEBUG=true
```

### Check Network Connectivity
```bash
# Test internal Docker network
docker-compose exec scheduler-api ping postgres
docker-compose exec scheduler-api ping redis
```

### Monitor Resource Usage
```bash
# Check Docker stats
docker stats

# Check disk usage
docker system df
```
