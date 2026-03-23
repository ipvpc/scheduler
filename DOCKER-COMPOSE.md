# 🐳 Alpha5 Scheduler - Docker Compose Setup

A comprehensive Docker Compose configuration for the Alpha5 Scheduler system with monitoring, development tools, and production-ready setup.

## 📋 Services Included

### Core Services
- **scheduler-api**: FastAPI backend service
- **scheduler-frontend**: React frontend application
- **postgres**: PostgreSQL database
- **redis**: Redis cache and message broker

### Monitoring & Observability
- **prometheus**: Metrics collection and monitoring
- **grafana**: Dashboards and visualization

### Development Tools (Optional)
- **pgadmin**: PostgreSQL administration interface
- **redis-commander**: Redis administration interface

## 🚀 Quick Start

### Development Environment
```bash
# Start development environment with hot reload
./scripts/start-dev.sh

# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### Production Environment
```bash
# Start production environment
./scripts/start-prod.sh

# Or manually:
docker-compose up -d --build
```

### Stop All Services
```bash
./scripts/stop.sh

# Or manually:
docker-compose down
```

## 🌐 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost:8001 | - |
| **Frontend** | http://localhost:3001 | - |
| **API Docs** | http://localhost:8001/docs | - |
| **Health Check** | http://localhost:8001/health | - |
| **Grafana** | http://localhost:3000 | admin/admin |
| **Prometheus** | http://localhost:9090 | - |
| **PgAdmin** | http://localhost:5050 | admin@scheduler.local/admin |
| **Redis Commander** | http://localhost:8081 | - |

## 🔧 Configuration

### Environment Variables

#### Database Configuration
```yaml
POSTGRES_DB: scheduler_db
POSTGRES_USER: scheduler_user
POSTGRES_PASSWORD: scheduler_password
```

#### Redis Configuration
```yaml
REDIS_HOST: redis
REDIS_PORT: 6379
REDIS_PASSWORD: redis_password
```

#### API Configuration
```yaml
API_HOST: 0.0.0.0
API_PORT: 8001
CORS_ORIGINS: http://localhost:3001,http://frontend:3001
```

### Volumes

- **postgres_data**: PostgreSQL data persistence
- **redis_data**: Redis data persistence
- **prometheus_data**: Prometheus metrics storage
- **grafana_data**: Grafana dashboards and settings
- **pgadmin_data**: PgAdmin settings (dev only)

## 📊 Monitoring

### Prometheus Metrics
- Service health and availability
- Task execution metrics
- Performance metrics
- Custom business metrics

### Grafana Dashboards
- System overview dashboard
- Task execution monitoring
- Performance analytics
- Error tracking

## 🛠️ Development

### Hot Reload
The development environment includes hot reload for both frontend and backend:

```bash
# Backend hot reload (FastAPI)
uvicorn main:app --reload

# Frontend hot reload (React)
npm start
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it scheduler-postgres psql -U scheduler_user -d scheduler_db

# Connect to Redis
docker exec -it scheduler-redis redis-cli
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f scheduler-api
docker-compose logs -f scheduler-frontend
```

## 🔒 Security

### Production Considerations
- Change default passwords
- Use secrets management
- Enable SSL/TLS
- Configure firewall rules
- Regular security updates

### Environment Variables
Update the following for production:
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- Database passwords
- Redis password

## 📁 File Structure

```
backend/scheduler/
├── docker-compose.yml              # Main compose file
├── docker-compose.override.yml     # Development overrides
├── docker.env                      # Environment variables
├── monitoring/
│   ├── prometheus.yml              # Prometheus config
│   └── grafana/
│       ├── dashboards/             # Grafana dashboards
│       └── datasources/            # Data source configs
├── scripts/
│   ├── start-dev.sh                # Development startup
│   ├── start-prod.sh               # Production startup
│   └── stop.sh                     # Stop services
└── frontend/
    ├── Dockerfile                  # Frontend Dockerfile
    └── package.json                # Frontend dependencies
```

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :8001
netstat -tulpn | grep :3001

# Kill processes using ports
sudo kill -9 $(lsof -t -i:8001)
```

#### Database Connection Issues
```bash
# Check database health
docker-compose exec postgres pg_isready -U scheduler_user

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Service Health Checks
```bash
# Check service status
docker-compose ps

# Check health status
docker-compose exec scheduler-api curl -f http://localhost:8001/health
```

### Logs and Debugging
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
docker-compose up --build

# View detailed logs
docker-compose logs --tail=100 -f scheduler-api
```

## 🔄 Updates and Maintenance

### Update Services
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Data
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U scheduler_user scheduler_db > backup.sql

# Backup Redis
docker-compose exec redis redis-cli --rdb /data/backup.rdb
```

### Clean Up
```bash
# Remove unused containers and images
docker system prune -a

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
