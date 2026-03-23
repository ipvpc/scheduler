from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import uvicorn
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables - try local.env first, then .env
if os.path.exists('local.env'):
    load_dotenv('local.env')
    print("Loaded local.env file")
elif os.path.exists('.env'):
    load_dotenv('.env')
    print("Loaded .env file")
else:
    print("No environment file found, using system environment variables")

from config.database import test_database_connection
from services.database_service import database_service
from routes.tasks import router as tasks_router
from routes.calendar import router as calendar_router
from services.scheduler_service import scheduler_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Scheduler Service...")
    
    # Test database connection first
    try:
        logger.info("Testing database connection...")
        if not test_database_connection():
            logger.error("Database connection test failed")
            raise Exception("Database connection failed")
        logger.info("Database connection test passed")
    except Exception as e:
        logger.error(f"Database connection test error: {e}")
        raise
    
    # Create database tables
    try:
        database_service.create_tables()
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise
    
    # Start scheduler service
    try:
        await scheduler_service.start()
        logger.info("Scheduler service started successfully")
    except Exception as e:
        logger.error(f"Error starting scheduler service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Scheduler Service...")
    try:
        await scheduler_service.stop()
        logger.info("Scheduler service stopped")
    except Exception as e:
        logger.error(f"Error stopping scheduler service: {e}")

# Create FastAPI application
app = FastAPI(
    title="Alpha5 Scheduler Service",
    description="Scheduled API call management system for hedge fund operations",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure this properly for production
)

# Include routers
app.include_router(tasks_router)
app.include_router(calendar_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Alpha5 Scheduler Service",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check scheduler status
        scheduler_status = await scheduler_service.get_scheduler_status()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "scheduler": scheduler_status,
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/status")
async def get_status():
    """Get detailed service status"""
    try:
        scheduler_status = await scheduler_service.get_scheduler_status()
        
        return {
            "service": "Alpha5 Scheduler Service",
            "version": "1.0.0",
            "status": "running",
            "timestamp": datetime.utcnow().isoformat(),
            "scheduler": scheduler_status,
            "endpoints": {
                "tasks": "/api/tasks",
                "health": "/health",
                "docs": "/docs"
            }
        }
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
