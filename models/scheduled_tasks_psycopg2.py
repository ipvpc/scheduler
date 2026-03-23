import enum
from datetime import datetime
from typing import Optional, Dict, Any, List
import json

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

class ScheduledTask:
    """ScheduledTask model for psycopg2"""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.name = kwargs.get('name')
        self.description = kwargs.get('description')
        self.task_type = kwargs.get('task_type', TaskType.HTTP_REQUEST)
        self.status = kwargs.get('status', TaskStatus.ACTIVE)
        self.schedule_type = kwargs.get('schedule_type', ScheduleType.CRON)
        self.cron_expression = kwargs.get('cron_expression')
        self.interval_seconds = kwargs.get('interval_seconds')
        self.timezone = kwargs.get('timezone', 'America/New_York')
        self.http_method = kwargs.get('http_method', 'GET')
        self.url = kwargs.get('url')
        self.headers = kwargs.get('headers', {})
        self.query_params = kwargs.get('query_params', {})
        self.request_body = kwargs.get('request_body')
        self.timeout_seconds = kwargs.get('timeout_seconds', 30)
        self.auth_type = kwargs.get('auth_type', 'none')
        self.auth_token = kwargs.get('auth_token')
        self.auth_username = kwargs.get('auth_username')
        self.auth_password = kwargs.get('auth_password')
        self.auth_api_key = kwargs.get('auth_api_key')
        self.max_retries = kwargs.get('max_retries', 3)
        self.retry_delay_seconds = kwargs.get('retry_delay_seconds', 60)
        self.concurrent_executions = kwargs.get('concurrent_executions', 1)
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
        self.created_by = kwargs.get('created_by')
        self.tags = kwargs.get('tags', [])
    
    def to_dict(self):
        """Convert to dictionary for database operations"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'task_type': self.task_type.value if isinstance(self.task_type, TaskType) else self.task_type,
            'status': self.status.value if isinstance(self.status, TaskStatus) else self.status,
            'schedule_type': self.schedule_type.value if isinstance(self.schedule_type, ScheduleType) else self.schedule_type,
            'cron_expression': self.cron_expression,
            'interval_seconds': self.interval_seconds,
            'timezone': self.timezone,
            'http_method': self.http_method,
            'url': self.url,
            'headers': json.dumps(self.headers) if isinstance(self.headers, dict) else self.headers,
            'query_params': json.dumps(self.query_params) if isinstance(self.query_params, dict) else self.query_params,
            'request_body': self.request_body,
            'timeout_seconds': self.timeout_seconds,
            'auth_type': self.auth_type,
            'auth_token': self.auth_token,
            'auth_username': self.auth_username,
            'auth_password': self.auth_password,
            'auth_api_key': self.auth_api_key,
            'max_retries': self.max_retries,
            'retry_delay_seconds': self.retry_delay_seconds,
            'concurrent_executions': self.concurrent_executions,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'created_by': self.created_by,
            'tags': json.dumps(self.tags) if isinstance(self.tags, list) else self.tags
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create instance from dictionary"""
        # Parse JSON fields
        if 'headers' in data and isinstance(data['headers'], str):
            data['headers'] = json.loads(data['headers'])
        if 'query_params' in data and isinstance(data['query_params'], str):
            data['query_params'] = json.loads(data['query_params'])
        if 'tags' in data and isinstance(data['tags'], str):
            data['tags'] = json.loads(data['tags'])
        
        return cls(**data)

class TaskExecution:
    """TaskExecution model for psycopg2"""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.task_id = kwargs.get('task_id')
        self.started_at = kwargs.get('started_at')
        self.completed_at = kwargs.get('completed_at')
        self.duration_seconds = kwargs.get('duration_seconds')
        self.status = kwargs.get('status')
        self.http_status_code = kwargs.get('http_status_code')
        self.response_data = kwargs.get('response_data')
        self.error_message = kwargs.get('error_message')
        self.request_url = kwargs.get('request_url')
        self.request_method = kwargs.get('request_method')
        self.request_headers = kwargs.get('request_headers', {})
        self.request_body = kwargs.get('request_body')
        self.response_size_bytes = kwargs.get('response_size_bytes')
        self.retry_count = kwargs.get('retry_count', 0)
    
    def to_dict(self):
        """Convert to dictionary for database operations"""
        return {
            'id': self.id,
            'task_id': self.task_id,
            'started_at': self.started_at,
            'completed_at': self.completed_at,
            'duration_seconds': self.duration_seconds,
            'status': self.status,
            'http_status_code': self.http_status_code,
            'response_data': self.response_data,
            'error_message': self.error_message,
            'request_url': self.request_url,
            'request_method': self.request_method,
            'request_headers': json.dumps(self.request_headers) if isinstance(self.request_headers, dict) else self.request_headers,
            'request_body': self.request_body,
            'response_size_bytes': self.response_size_bytes,
            'retry_count': self.retry_count
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create instance from dictionary"""
        # Parse JSON fields
        if 'request_headers' in data and isinstance(data['request_headers'], str):
            data['request_headers'] = json.loads(data['request_headers'])
        
        return cls(**data)

class TaskLog:
    """TaskLog model for psycopg2"""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.task_id = kwargs.get('task_id')
        self.execution_id = kwargs.get('execution_id')
        self.timestamp = kwargs.get('timestamp')
        self.level = kwargs.get('level')
        self.message = kwargs.get('message')
        self.details = kwargs.get('details', {})
    
    def to_dict(self):
        """Convert to dictionary for database operations"""
        return {
            'id': self.id,
            'task_id': self.task_id,
            'execution_id': self.execution_id,
            'timestamp': self.timestamp,
            'level': self.level,
            'message': self.message,
            'details': json.dumps(self.details) if isinstance(self.details, dict) else self.details
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create instance from dictionary"""
        # Parse JSON fields
        if 'details' in data and isinstance(data['details'], str):
            data['details'] = json.loads(data['details'])
        
        return cls(**data)

class TaskTemplate:
    """TaskTemplate model for psycopg2"""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.name = kwargs.get('name')
        self.description = kwargs.get('description')
        self.category = kwargs.get('category')
        self.task_type = kwargs.get('task_type')
        self.default_config = kwargs.get('default_config', {})
        self.required_fields = kwargs.get('required_fields', [])
        self.optional_fields = kwargs.get('optional_fields', [])
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
        self.is_active = kwargs.get('is_active', True)
        self.usage_count = kwargs.get('usage_count', 0)
    
    def to_dict(self):
        """Convert to dictionary for database operations"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'task_type': self.task_type.value if isinstance(self.task_type, TaskType) else self.task_type,
            'default_config': json.dumps(self.default_config) if isinstance(self.default_config, dict) else self.default_config,
            'required_fields': json.dumps(self.required_fields) if isinstance(self.required_fields, list) else self.required_fields,
            'optional_fields': json.dumps(self.optional_fields) if isinstance(self.optional_fields, list) else self.optional_fields,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active,
            'usage_count': self.usage_count
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create instance from dictionary"""
        # Parse JSON fields
        if 'default_config' in data and isinstance(data['default_config'], str):
            data['default_config'] = json.loads(data['default_config'])
        if 'required_fields' in data and isinstance(data['required_fields'], str):
            data['required_fields'] = json.loads(data['required_fields'])
        if 'optional_fields' in data and isinstance(data['optional_fields'], str):
            data['optional_fields'] = json.loads(data['optional_fields'])
        
        return cls(**data)
