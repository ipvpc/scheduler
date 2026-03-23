import asyncio
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from models.scheduled_tasks_psycopg2 import ScheduledTask, TaskExecution, TaskLog, TaskStatus
from services.database_service import database_service
import uuid

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler(
            jobstores={
                'default': MemoryJobStore()
            },
            executors={
                'default': AsyncIOExecutor()
            },
            job_defaults={
                'coalesce': True,
                'max_instances': 1,
                'misfire_grace_time': 30
            }
        )
        self.scheduler.add_listener(self._job_executed, EVENT_JOB_EXECUTED)
        self.scheduler.add_listener(self._job_error, EVENT_JOB_ERROR)
        self._running_tasks = {}
    
    async def start(self):
        """Start the scheduler service"""
        try:
            self.scheduler.start()
            logger.info("Scheduler service started successfully")
            
            # Load existing tasks from database
            await self._load_existing_tasks()
            
        except Exception as e:
            logger.error(f"Failed to start scheduler service: {e}")
            raise
    
    async def stop(self):
        """Stop the scheduler service"""
        try:
            self.scheduler.shutdown(wait=True)
            logger.info("Scheduler service stopped")
        except Exception as e:
            logger.error(f"Error stopping scheduler service: {e}")
    
    async def _load_existing_tasks(self):
        """Load existing active tasks from database"""
        try:
            active_tasks = database_service.get_tasks(status=TaskStatus.ACTIVE, limit=1000)
            
            for task in active_tasks:
                await self.add_task(task)
                logger.info(f"Loaded existing task: {task.name}")
                
        except Exception as e:
            logger.error(f"Error loading existing tasks: {e}")
    
    async def add_task(self, task: ScheduledTask):
        """Add a new scheduled task"""
        try:
            job_id = f"task_{task.id}"
            
            # Create trigger based on schedule type
            trigger = self._create_trigger(task)
            
            # Add job to scheduler
            self.scheduler.add_job(
                func=self._execute_task,
                trigger=trigger,
                id=job_id,
                name=task.name,
                args=[task.id],
                replace_existing=True,
                max_instances=task.concurrent_executions
            )
            
            self._running_tasks[task.id] = {
                'job_id': job_id,
                'task': task,
                'status': 'scheduled'
            }
            
            logger.info(f"Added task to scheduler: {task.name}")
            
        except Exception as e:
            logger.error(f"Error adding task to scheduler: {e}")
            raise
    
    async def remove_task(self, task_id: int):
        """Remove a task from scheduler"""
        try:
            job_id = f"task_{task_id}"
            
            if self.scheduler.get_job(job_id):
                self.scheduler.remove_job(job_id)
            
            if task_id in self._running_tasks:
                del self._running_tasks[task_id]
            
            logger.info(f"Removed task from scheduler: {task_id}")
            
        except Exception as e:
            logger.error(f"Error removing task from scheduler: {e}")
    
    async def update_task(self, task: ScheduledTask):
        """Update an existing task in scheduler"""
        await self.remove_task(task.id)
        await self.add_task(task)
    
    def _create_trigger(self, task: ScheduledTask):
        """Create appropriate trigger for task"""
        if task.schedule_type.value == "cron":
            return CronTrigger.from_crontab(task.cron_expression, timezone=task.timezone)
        elif task.schedule_type.value == "interval":
            return IntervalTrigger(seconds=task.interval_seconds, timezone=task.timezone)
        elif task.schedule_type.value == "once":
            # For one-time tasks, schedule for immediate execution
            return DateTrigger(run_date=datetime.now() + timedelta(seconds=1))
        else:
            raise ValueError(f"Unsupported schedule type: {task.schedule_type}")
    
    async def _execute_task(self, task_id: int):
        """Execute a scheduled task"""
        execution = None
        
        try:
            # Get task details
            task = database_service.get_task(task_id)
            if not task:
                logger.error(f"Task not found: {task_id}")
                return
            
            # Create execution record
            execution = TaskExecution(
                task_id=task_id,
                started_at=datetime.utcnow(),
                status="running",
                request_url=task.url,
                request_method=task.http_method,
                request_headers=task.headers or {},
                request_body=task.request_body
            )
            execution = database_service.create_execution(execution)
            
            # Update running tasks status
            if task_id in self._running_tasks:
                self._running_tasks[task_id]['status'] = 'running'
            
            # Execute HTTP request
            result = await self._make_http_request(task)
            
            # Update execution record
            execution.completed_at = datetime.utcnow()
            execution.duration_seconds = int((execution.completed_at - execution.started_at).total_seconds())
            execution.status = "success"
            execution.http_status_code = result.get('status_code')
            execution.response_data = result.get('response_data')
            execution.response_size_bytes = len(result.get('response_data', ''))
            
            # Update execution in database
            database_service.update_execution(execution)
            
            # Log success
            await self._log_task_event(
                task_id, execution.id, "INFO", 
                f"Task executed successfully", 
                {"status_code": result.get('status_code'), "duration": execution.duration_seconds}
            )
            
            logger.info(f"Task executed successfully: {task.name}")
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            
            if execution:
                execution.completed_at = datetime.utcnow()
                execution.duration_seconds = int((execution.completed_at - execution.started_at).total_seconds())
                execution.status = "failed"
                execution.error_message = str(e)
                # Update execution in database
                database_service.update_execution(execution)
            
            # Log error
            await self._log_task_event(
                task_id, execution.id if execution else None, "ERROR", 
                f"Task execution failed: {str(e)}", 
                {"error": str(e)}
            )
            
        finally:
            # Update running tasks status
            if task_id in self._running_tasks:
                self._running_tasks[task_id]['status'] = 'scheduled'
            
            db.close()
    
    async def _make_http_request(self, task: ScheduledTask) -> Dict[str, Any]:
        """Make HTTP request for task"""
        headers = task.headers or {}
        
        # Add authentication headers
        if task.auth_type == "bearer" and task.auth_token:
            headers["Authorization"] = f"Bearer {task.auth_token}"
        elif task.auth_type == "basic" and task.auth_username and task.auth_password:
            import base64
            credentials = base64.b64encode(f"{task.auth_username}:{task.auth_password}".encode()).decode()
            headers["Authorization"] = f"Basic {credentials}"
        elif task.auth_type == "api_key" and task.auth_api_key:
            headers["X-API-Key"] = task.auth_api_key
        
        # Prepare request data
        request_data = None
        if task.request_body and task.http_method.upper() in ["POST", "PUT", "PATCH"]:
            try:
                request_data = json.loads(task.request_body)
            except json.JSONDecodeError:
                request_data = task.request_body
        
        # Make HTTP request
        async with httpx.AsyncClient(timeout=task.timeout_seconds) as client:
            response = await client.request(
                method=task.http_method,
                url=task.url,
                headers=headers,
                params=task.query_params or {},
                json=request_data if isinstance(request_data, dict) else None,
                content=task.request_body if not isinstance(request_data, dict) else None
            )
            
            return {
                'status_code': response.status_code,
                'response_data': response.text,
                'headers': dict(response.headers)
            }
    
    async def _log_task_event(self, task_id: int, execution_id: Optional[int], 
                            level: str, message: str, details: Dict[str, Any]):
        """Log task event to database"""
        try:
            log_entry = TaskLog(
                task_id=task_id,
                execution_id=execution_id,
                level=level,
                message=message,
                details=details
            )
            database_service.create_log(log_entry)
        except Exception as e:
            logger.error(f"Failed to log task event: {e}")
    
    def _job_executed(self, event):
        """Handle job execution events"""
        logger.info(f"Job executed: {event.job_id}")
    
    def _job_error(self, event):
        """Handle job error events"""
        logger.error(f"Job error: {event.job_id} - {event.exception}")
    
    async def get_task_status(self, task_id: int) -> Dict[str, Any]:
        """Get current status of a task"""
        if task_id in self._running_tasks:
            return self._running_tasks[task_id]
        return {"status": "not_found"}
    
    async def get_scheduler_status(self) -> Dict[str, Any]:
        """Get overall scheduler status"""
        return {
            "running": self.scheduler.running,
            "active_jobs": len(self.scheduler.get_jobs()),
            "running_tasks": len([t for t in self._running_tasks.values() if t['status'] == 'running'])
        }

# Global scheduler service instance
scheduler_service = SchedulerService()
