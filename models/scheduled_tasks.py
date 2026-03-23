from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum
from datetime import datetime
from typing import Optional, Dict, Any

class TaskStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    ERROR = "error"

class TaskType(str, enum.Enum):
    HTTP_REQUEST = "http_request"
    DATA_SYNC = "data_sync"
    MARKET_SCAN = "market_scan"
    ALERT_CHECK = "alert_check"
    CUSTOM_SCRIPT = "custom_script"

class ScheduleType(str, enum.Enum):
    CRON = "cron"
    INTERVAL = "interval"
    ONCE = "once"

class ScheduledTask(Base):
    __tablename__ = "scheduled_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    task_type = Column(Enum(TaskType), nullable=False, default=TaskType.HTTP_REQUEST)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.ACTIVE)
    
    # Schedule configuration
    schedule_type = Column(Enum(ScheduleType), nullable=False, default=ScheduleType.CRON)
    cron_expression = Column(String(100), nullable=True)  # e.g., "0 9 * * 1-5"
    interval_seconds = Column(Integer, nullable=True)  # for interval-based tasks
    timezone = Column(String(50), default="America/New_York")
    
    # API call configuration
    http_method = Column(String(10), default="GET")
    url = Column(Text, nullable=False)
    headers = Column(JSON, default=dict)
    query_params = Column(JSON, default=dict)
    request_body = Column(Text, nullable=True)
    timeout_seconds = Column(Integer, default=30)
    
    # Authentication
    auth_type = Column(String(20), default="none")  # none, bearer, basic, api_key
    auth_token = Column(String(500), nullable=True)
    auth_username = Column(String(100), nullable=True)
    auth_password = Column(String(500), nullable=True)
    auth_api_key = Column(String(500), nullable=True)
    
    # Execution settings
    max_retries = Column(Integer, default=3)
    retry_delay_seconds = Column(Integer, default=60)
    concurrent_executions = Column(Integer, default=1)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(100), nullable=True)
    tags = Column(JSON, default=list)
    
    # Relationships
    executions = relationship("TaskExecution", back_populates="task", cascade="all, delete-orphan")

class TaskExecution(Base):
    __tablename__ = "task_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("scheduled_tasks.id"), nullable=False)
    
    # Execution details
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Status and results
    status = Column(String(20), nullable=False)  # running, success, failed, timeout
    http_status_code = Column(Integer, nullable=True)
    response_data = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Request details (snapshot at execution time)
    request_url = Column(Text, nullable=False)
    request_method = Column(String(10), nullable=False)
    request_headers = Column(JSON, default=dict)
    request_body = Column(Text, nullable=True)
    
    # Performance metrics
    response_size_bytes = Column(Integer, nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Relationships
    task = relationship("ScheduledTask", back_populates="executions")

class TaskLog(Base):
    __tablename__ = "task_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("scheduled_tasks.id"), nullable=False)
    execution_id = Column(Integer, ForeignKey("task_executions.id"), nullable=True)
    
    # Log details
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    level = Column(String(10), nullable=False)  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    message = Column(Text, nullable=False)
    details = Column(JSON, default=dict)
    
    # Relationships
    task = relationship("ScheduledTask")
    execution = relationship("TaskExecution")

class TaskTemplate(Base):
    __tablename__ = "task_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    
    # Template configuration
    task_type = Column(Enum(TaskType), nullable=False)
    default_config = Column(JSON, nullable=False)
    required_fields = Column(JSON, default=list)
    optional_fields = Column(JSON, default=list)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
