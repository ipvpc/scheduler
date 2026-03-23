from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from models.scheduled_tasks_psycopg2 import TaskStatus, TaskType, ScheduleType

class TaskBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    task_type: TaskType = TaskType.HTTP_REQUEST
    schedule_type: ScheduleType = ScheduleType.CRON
    cron_expression: Optional[str] = None
    interval_seconds: Optional[int] = Field(None, ge=1)
    timezone: str = "America/New_York"
    
    # API configuration
    http_method: str = Field("GET", pattern="^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$")
    url: str = Field(..., min_length=1)
    headers: Dict[str, str] = Field(default_factory=dict)
    query_params: Dict[str, Any] = Field(default_factory=dict)
    request_body: Optional[str] = None
    timeout_seconds: int = Field(30, ge=1, le=300)
    
    # Authentication
    auth_type: str = Field("none", pattern="^(none|bearer|basic|api_key)$")
    auth_token: Optional[str] = None
    auth_username: Optional[str] = None
    auth_password: Optional[str] = None
    auth_api_key: Optional[str] = None
    
    # Execution settings
    max_retries: int = Field(3, ge=0, le=10)
    retry_delay_seconds: int = Field(60, ge=1, le=3600)
    concurrent_executions: int = Field(1, ge=1, le=10)
    
    # Metadata
    created_by: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    @validator('cron_expression')
    def validate_cron_expression(cls, v, values):
        if values.get('schedule_type') == ScheduleType.CRON and not v:
            raise ValueError('cron_expression is required for cron schedule type')
        return v
    
    @validator('interval_seconds')
    def validate_interval_seconds(cls, v, values):
        if values.get('schedule_type') == ScheduleType.INTERVAL and not v:
            raise ValueError('interval_seconds is required for interval schedule type')
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    schedule_type: Optional[ScheduleType] = None
    cron_expression: Optional[str] = None
    interval_seconds: Optional[int] = Field(None, ge=1)
    timezone: Optional[str] = None
    
    # API configuration
    http_method: Optional[str] = Field(None, pattern="^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$")
    url: Optional[str] = Field(None, min_length=1)
    headers: Optional[Dict[str, str]] = None
    query_params: Optional[Dict[str, Any]] = None
    request_body: Optional[str] = None
    timeout_seconds: Optional[int] = Field(None, ge=1, le=300)
    
    # Authentication
    auth_type: Optional[str] = Field(None, pattern="^(none|bearer|basic|api_key)$")
    auth_token: Optional[str] = None
    auth_username: Optional[str] = None
    auth_password: Optional[str] = None
    auth_api_key: Optional[str] = None
    
    # Execution settings
    max_retries: Optional[int] = Field(None, ge=0, le=10)
    retry_delay_seconds: Optional[int] = Field(None, ge=1, le=3600)
    concurrent_executions: Optional[int] = Field(None, ge=1, le=10)
    
    # Metadata
    tags: Optional[List[str]] = None

class TaskResponse(TaskBase):
    id: int
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskExecutionResponse(BaseModel):
    id: int
    task_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: str
    http_status_code: Optional[int] = None
    response_data: Optional[str] = None
    error_message: Optional[str] = None
    request_url: str
    request_method: str
    request_headers: Dict[str, str]
    request_body: Optional[str] = None
    response_size_bytes: Optional[int] = None
    retry_count: int = 0
    
    class Config:
        from_attributes = True

class TaskLogResponse(BaseModel):
    id: int
    task_id: int
    execution_id: Optional[int] = None
    timestamp: datetime
    level: str
    message: str
    details: Dict[str, Any]
    
    class Config:
        from_attributes = True

class TaskTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    task_type: TaskType
    default_config: Dict[str, Any]
    required_fields: List[str] = Field(default_factory=list)
    optional_fields: List[str] = Field(default_factory=list)

class TaskTemplateCreate(TaskTemplateBase):
    pass

class TaskTemplateResponse(TaskTemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool
    usage_count: int
    
    class Config:
        from_attributes = True

class TaskStatsResponse(BaseModel):
    total_tasks: int
    active_tasks: int
    inactive_tasks: int
    error_tasks: int
    total_executions: int
    successful_executions: int
    failed_executions: int
    average_execution_time: Optional[float] = None
    last_24h_executions: int
    last_7d_executions: int

class TaskBulkAction(BaseModel):
    action: str = Field(..., pattern="^(start|stop|pause|resume|delete)$")
    task_ids: List[int] = Field(..., min_items=1)
