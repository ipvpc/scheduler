# Alpha5 Scheduler Service

A professional-grade scheduled API call management system designed for hedge fund operations. Built with FastAPI, PostgreSQL, and React, featuring a sophisticated dark-themed UI optimized for financial professionals.

## 🚀 Features

### Core Functionality
- **Scheduled API Calls**: Create, manage, and monitor scheduled HTTP requests
- **Multiple Schedule Types**: Cron expressions, intervals, and one-time executions
- **Advanced Authentication**: Bearer tokens, Basic auth, API keys, and custom headers
- **Execution Monitoring**: Real-time status tracking and detailed execution history
- **Error Handling**: Automatic retries with configurable delays and failure notifications
- **Bulk Operations**: Start, stop, pause, or delete multiple tasks simultaneously

### Professional UI
- **Hedge Fund Design**: Dark theme with professional color palette
- **Real-time Dashboard**: Live statistics and execution monitoring
- **Advanced Task Management**: Comprehensive task creation and editing forms
- **Data Visualization**: Charts and metrics for performance analysis
- **Responsive Design**: Optimized for desktop and mobile devices

### Enterprise Features
- **Database Persistence**: PostgreSQL integration with full data persistence
- **Scalable Architecture**: Microservices design with Docker containerization
- **Health Monitoring**: Built-in health checks and service monitoring
- **Security**: CORS protection, input validation, and secure authentication
- **Logging**: Comprehensive logging with multiple severity levels

## 🏗️ Architecture

### Backend Services
- **FastAPI Application**: RESTful API with automatic OpenAPI documentation
- **APScheduler**: Advanced Python scheduling library with multiple triggers
- **SQLAlchemy ORM**: Database abstraction with PostgreSQL backend
- **Pydantic Models**: Data validation and serialization
- **AsyncIO**: High-performance asynchronous task execution

### Frontend Application
- **React 18**: Modern React with hooks and functional components
- **Material-UI**: Professional component library with custom theming
- **TypeScript**: Type-safe development with comprehensive interfaces
- **React Query**: Efficient data fetching and caching
- **Framer Motion**: Smooth animations and transitions

### Database Schema
- **Scheduled Tasks**: Core task configuration and metadata
- **Task Executions**: Execution history with performance metrics
- **Task Logs**: Detailed logging with structured data
- **Task Templates**: Reusable task configurations

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 13+ (managed by Docker)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd trade-system
   ```

2. **Start the scheduler services**:
   ```bash
   docker-compose up scheduler-api scheduler-frontend
   ```

3. **Access the application**:
   - Frontend: http://localhost:3001
   - API Documentation: http://localhost:8001/docs
   - Health Check: http://localhost:8001/health

### Manual Development Setup

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend/scheduler
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql://markets:p0w3rb4r@localhost:5432/markets_prod"
   export REDIS_HOST="localhost"
   export REDIS_PORT="6379"
   ```

5. **Run the application**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd backend/scheduler/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set environment variables**:
   ```bash
   export REACT_APP_API_URL="http://localhost:8001"
   ```

4. **Start development server**:
   ```bash
   npm start
   ```

## 📖 API Documentation

### Core Endpoints

#### Tasks Management
- `GET /api/tasks` - List all tasks with filtering
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

#### Task Operations
- `POST /api/tasks/{id}/start` - Start a task
- `POST /api/tasks/{id}/stop` - Stop a task
- `POST /api/tasks/{id}/execute` - Execute task immediately
- `GET /api/tasks/{id}/status` - Get task status

#### Monitoring & Analytics
- `GET /api/tasks/{id}/executions` - Get execution history
- `GET /api/tasks/{id}/logs` - Get task logs
- `GET /api/tasks/stats/overview` - Get system statistics
- `POST /api/tasks/bulk-action` - Bulk operations

### Task Configuration

#### Basic Task Properties
```json
{
  "name": "Market Data Sync",
  "description": "Sync market data every 5 minutes",
  "task_type": "http_request",
  "schedule_type": "cron",
  "cron_expression": "*/5 * * * *",
  "timezone": "America/New_York"
}
```

#### HTTP Request Configuration
```json
{
  "http_method": "GET",
  "url": "https://api.marketdata.com/v1/prices",
  "headers": {
    "Authorization": "Bearer your-token",
    "Content-Type": "application/json"
  },
  "query_params": {
    "symbols": "AAPL,MSFT,GOOGL",
    "format": "json"
  },
  "timeout_seconds": 30
}
```

#### Authentication Options
```json
{
  "auth_type": "bearer",
  "auth_token": "your-bearer-token"
}
```

### Schedule Types

#### Cron Expression
```json
{
  "schedule_type": "cron",
  "cron_expression": "0 9 * * 1-5",
  "timezone": "America/New_York"
}
```

#### Interval
```json
{
  "schedule_type": "interval",
  "interval_seconds": 300,
  "timezone": "America/New_York"
}
```

#### One-time Execution
```json
{
  "schedule_type": "once",
  "timezone": "America/New_York"
}
```

## 🎨 UI Components

### Dashboard
- **Statistics Cards**: Real-time metrics and KPIs
- **Task Overview**: Active, inactive, and error task counts
- **Performance Metrics**: Success rates and execution times
- **Recent Activity**: Latest executions and status updates

### Task Management
- **Task List**: Sortable, filterable data grid
- **Task Form**: Multi-tab configuration interface
- **Bulk Actions**: Multi-select operations
- **Real-time Status**: Live task status indicators

### Monitoring
- **Execution History**: Detailed execution logs
- **Performance Charts**: Visual analytics and trends
- **Error Tracking**: Failed execution analysis
- **System Health**: Service status monitoring

## 🔧 Configuration

### Environment Variables

#### Backend Configuration
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2

# Scheduler
SCHEDULER_TIMEZONE=America/New_York
MAX_CONCURRENT_TASKS=100
TASK_TIMEOUT=300

# Logging
LOG_LEVEL=INFO
```

#### Frontend Configuration
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8001
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### Docker Configuration

#### Backend Service
```yaml
scheduler-api:
  build: ./backend/scheduler
  ports:
    - "8001:8001"
  environment:
    DATABASE_URL: postgresql://markets:p0w3rb4r@postgres:5432/markets_prod
    REDIS_HOST: redis
    REDIS_PORT: 6379
  depends_on:
    - postgres
    - redis
```

#### Frontend Service
```yaml
scheduler-frontend:
  build: ./backend/scheduler/frontend
  ports:
    - "3001:80"
  environment:
    REACT_APP_API_URL: http://localhost:8001
  depends_on:
    - scheduler-api
```

## 📊 Monitoring & Analytics

### Health Checks
- **API Health**: `GET /health` - Service status and dependencies
- **Database Health**: Connection status and query performance
- **Scheduler Health**: Active jobs and execution status
- **Frontend Health**: Application availability and performance

### Metrics & KPIs
- **Task Statistics**: Total, active, inactive, and error counts
- **Execution Metrics**: Success rates, failure rates, and average duration
- **Performance Data**: Response times, throughput, and resource usage
- **Trend Analysis**: Historical data and performance trends

### Logging
- **Structured Logging**: JSON-formatted logs with severity levels
- **Task Execution Logs**: Detailed execution history and debugging
- **Error Tracking**: Comprehensive error logging and stack traces
- **Audit Trail**: User actions and system changes

## 🔒 Security

### Authentication & Authorization
- **API Security**: CORS protection and input validation
- **Data Encryption**: Secure storage of sensitive credentials
- **Access Control**: Role-based permissions and user management
- **Audit Logging**: Security event tracking and monitoring

### Best Practices
- **Input Validation**: Comprehensive data validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Content Security Policy and input encoding
- **HTTPS Enforcement**: Secure communication and data transmission

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL=postgresql://user:password@prod-host:5432/database
   export REDIS_HOST=prod-redis-host
   ```

2. **Database Migration**:
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

3. **Build and Deploy**:
   ```bash
   # Build Docker images
   docker-compose build scheduler-api scheduler-frontend
   
   # Deploy to production
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances with load balancing
- **Database Optimization**: Connection pooling and query optimization
- **Caching Strategy**: Redis caching for improved performance
- **Monitoring**: Comprehensive monitoring and alerting

## 🧪 Testing

### Backend Testing
```bash
# Run unit tests
pytest tests/

# Run integration tests
pytest tests/integration/

# Run with coverage
pytest --cov=app tests/
```

### Frontend Testing
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📈 Performance Optimization

### Backend Optimization
- **Async Processing**: Non-blocking I/O operations
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Efficient database queries

### Frontend Optimization
- **Code Splitting**: Lazy loading and bundle optimization
- **Caching**: React Query caching and memoization
- **Performance Monitoring**: Real-time performance metrics
- **Bundle Analysis**: Webpack bundle optimization

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow PEP 8 for Python and ESLint for JavaScript
2. **Testing**: Write comprehensive tests for all new features
3. **Documentation**: Update documentation for API changes
4. **Security**: Follow security best practices and guidelines

### Pull Request Process
1. **Fork Repository**: Create a feature branch
2. **Implement Changes**: Follow coding standards
3. **Test Changes**: Ensure all tests pass
4. **Submit PR**: Include detailed description and testing notes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Available at `/docs` endpoint
- **User Guide**: Comprehensive user documentation
- **Developer Guide**: Technical implementation details
- **Troubleshooting**: Common issues and solutions

### Contact
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and support
- **Email**: Support team contact information

---

**Alpha5 Scheduler** - Professional task scheduling for hedge fund operations
