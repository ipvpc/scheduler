# Alpha5 Scheduler - Remote Services Architecture

## 🏗️ **Architecture Overview**

Your scheduler system uses a **hybrid architecture** with:
- **Local Docker containers** for the application services
- **Remote services** for database and cache infrastructure

## 🔄 **Service Communication Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Service   │    │   Remote        │
│   Container     │───▶│   Container     │───▶│   Services      │
│                 │    │                 │    │                 │
│ scheduler-      │    │ scheduler-api    │    │ PostgreSQL      │
│ frontend        │    │                 │    │ (your host)     │
│                 │    │                 │    │                 │
│ Port: 3000      │    │ Port: 8001      │    │ Port: 5432      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Remote        │
                       │   Services      │
                       │                 │
                       │ Redis           │
                       │ (your host)     │
                       │                 │
                       │ Port: 6379      │
                       └─────────────────┘
```

## 🔧 **Configuration Details**

### **Frontend → API Communication**
```yaml
# Frontend container
scheduler-frontend:
  environment:
    - REACT_APP_API_URL=http://scheduler-api:8001  # ✅ Docker service name
    - REACT_APP_WS_URL=ws://scheduler-api:8001/ws  # ✅ Docker service name
```

### **API → Remote Services Communication**
```yaml
# API container
scheduler-api:
  environment:
    # Remote PostgreSQL
    - DATABASE_URL=postgresql://markets:changeme@db.example.com:5432/markets_prod
    - POSTGRES_HOST=db.example.com
    
    # Remote Redis
    - REDIS_HOST=redis.example.com
    - REDIS_PORT=6379
```

## 🌐 **Network Configuration**

### **Docker Network**
- **Network Name**: `scheduler-network`
- **Driver**: `bridge`
- **Purpose**: Enables container-to-container communication

### **Service URLs**
- **Frontend (from host)**: http://localhost:3000
- **API (from host)**: http://localhost:8001
- **Frontend → API (internal)**: http://scheduler-api:8001
- **API → PostgreSQL (external)**: host and port from `DATABASE_URL` / `POSTGRES_HOST`
- **API → Redis (external)**: `REDIS_HOST`:`REDIS_PORT`

## 🚀 **Quick Start Commands**

### **Start Services**
```bash
# Start the scheduler system
docker-compose up --build

# Or use the startup script
start-dev.bat
```

### **Test Communication**
```bash
# Test remote services connectivity
test-remote-services.bat

# Test API health
curl http://localhost:8001/health

# Test API tasks
curl http://localhost:8001/api/tasks
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Frontend can't reach API**
   - Check if both containers are on `scheduler-network`
   - Verify `REACT_APP_API_URL=http://scheduler-api:8001`

2. **API can't reach remote services**
   - Check network connectivity to your configured `POSTGRES_HOST`
   - Verify credentials and connection strings

3. **Database enum errors**
   - Run the enum fix script: `init-scripts/01-fix-enums.sql`
   - Check database logs for connection issues

### **Debug Commands**
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs scheduler-api
docker-compose logs scheduler-frontend

# Test network connectivity
docker-compose exec scheduler-api ping YOUR_DB_HOST
docker-compose exec scheduler-api ping YOUR_REDIS_HOST

# Test database connection
docker-compose exec scheduler-api python -c "import psycopg2; print('DB OK')"

# Test Redis connection
docker-compose exec scheduler-api python -c "import redis; print('Redis OK')"
```

## ✅ **Key Benefits**

1. **Scalability**: Remote services can be shared across multiple applications
2. **Reliability**: Remote services are managed and maintained separately
3. **Flexibility**: Easy to switch between local and remote services
4. **Security**: Centralized database and cache management

## 🎯 **Summary**

Your architecture correctly uses:
- **Docker service names** for container-to-container communication
- **Remote hostnames** for external service connections
- **Proper network configuration** for service isolation
- **Environment variables** for flexible configuration

This setup ensures your frontend can communicate with the API using Docker service names, while the API connects to your remote PostgreSQL and Redis services using their external hostnames.
