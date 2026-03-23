from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from services.database_service import database_service
from models.scheduled_tasks_psycopg2 import ScheduledTask, TaskExecution, TaskLog, TaskStatus, TaskType, ScheduleType
from schemas.task_schemas import (
    TaskCreate, TaskUpdate, TaskResponse, TaskExecutionResponse, 
    TaskLogResponse, TaskStatsResponse, TaskBulkAction
)
from services.scheduler_service import scheduler_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    """Create a new scheduled task"""
    try:
        # Create task in database
        db_task = ScheduledTask(**task.dict())
        db_task = database_service.create_task(db_task)
        
        # Add to scheduler if active
        if db_task.status == TaskStatus.ACTIVE:
            await scheduler_service.add_task(db_task)
        
        logger.info(f"Created task: {db_task.name}")
        return db_task
        
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TaskStatus] = None,
    task_type: Optional[TaskType] = None,
    search: Optional[str] = None
):
    """Get list of scheduled tasks with filtering and pagination"""
    try:
        tasks = database_service.get_tasks(skip=skip, limit=limit, status=status, task_type=task_type, search=search)
        return tasks
        
    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int):
    """Get a specific task by ID"""
    try:
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate):
    """Update a scheduled task"""
    try:
        # Get existing task
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update fields
        update_data = task_update.dict(exclude_unset=True)
        task = database_service.update_task(task_id, update_data)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update in scheduler
        await scheduler_service.update_task(task)
        
        logger.info(f"Updated task: {task.name}")
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
async def delete_task(task_id: int):
    """Delete a scheduled task"""
    try:
        # Get task
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Remove from scheduler
        await scheduler_service.remove_task(task_id)
        
        # Delete from database (cascade will handle related records)
        deleted = database_service.delete_task(task_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")
        
        logger.info(f"Deleted task: {task.name}")
        return {"message": "Task deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{task_id}/start")
async def start_task(task_id: int):
    """Start a scheduled task"""
    try:
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update status to active
        database_service.update_task(task_id, {"status": TaskStatus.ACTIVE.value})
        task.status = TaskStatus.ACTIVE
        
        await scheduler_service.add_task(task)
        
        logger.info(f"Started task: {task.name}")
        return {"message": "Task started successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{task_id}/stop")
async def stop_task(task_id: int):
    """Stop a scheduled task"""
    try:
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update status to inactive
        database_service.update_task(task_id, {"status": TaskStatus.INACTIVE.value})
        
        await scheduler_service.remove_task(task_id)
        
        logger.info(f"Stopped task: {task.name}")
        return {"message": "Task stopped successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{task_id}/execute")
async def execute_task_now(task_id: int):
    """Execute a task immediately (one-time execution)"""
    try:
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Execute task immediately
        await scheduler_service._execute_task(task_id)
        
        logger.info(f"Executed task immediately: {task.name}")
        return {"message": "Task executed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}/executions", response_model=List[TaskExecutionResponse])
async def get_task_executions(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500)
):
    """Get execution history for a task"""
    try:
        executions = database_service.get_executions(task_id, skip=skip, limit=limit)
        return executions
        
    except Exception as e:
        logger.error(f"Error fetching executions for task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}/logs", response_model=List[TaskLogResponse])
async def get_task_logs(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    level: Optional[str] = None
):
    """Get logs for a task"""
    try:
        logs = database_service.get_logs(task_id, skip=skip, limit=limit, level=level)
        return logs
        
    except Exception as e:
        logger.error(f"Error fetching logs for task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}/status")
async def get_task_status(task_id: int):
    """Get current status of a task in the scheduler"""
    try:
        status = await scheduler_service.get_task_status(task_id)
        return status
        
    except Exception as e:
        logger.error(f"Error getting status for task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-action")
async def bulk_action(action: TaskBulkAction):
    """Perform bulk actions on multiple tasks"""
    try:
        tasks = []
        for task_id in action.task_ids:
            task = database_service.get_task(task_id)
            if task:
                tasks.append(task)
        
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found")
        
        results = []
        
        for task in tasks:
            try:
                if action.action == "start":
                    database_service.update_task(task.id, {"status": TaskStatus.ACTIVE.value})
                    task.status = TaskStatus.ACTIVE
                    await scheduler_service.add_task(task)
                elif action.action == "stop":
                    database_service.update_task(task.id, {"status": TaskStatus.INACTIVE.value})
                    await scheduler_service.remove_task(task.id)
                elif action.action == "pause":
                    database_service.update_task(task.id, {"status": TaskStatus.PAUSED.value})
                    await scheduler_service.remove_task(task.id)
                elif action.action == "resume":
                    database_service.update_task(task.id, {"status": TaskStatus.ACTIVE.value})
                    task.status = TaskStatus.ACTIVE
                    await scheduler_service.add_task(task)
                elif action.action == "delete":
                    await scheduler_service.remove_task(task.id)
                    database_service.delete_task(task.id)
                
                results.append({"task_id": task.id, "status": "success"})
                
            except Exception as e:
                results.append({"task_id": task.id, "status": "error", "error": str(e)})
        
        return {"results": results}
        
    except Exception as e:
        logger.error(f"Error performing bulk action: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/overview", response_model=TaskStatsResponse)
async def get_task_stats():
    """Get overall task statistics"""
    try:
        stats = database_service.get_task_stats()
        return TaskStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error fetching task stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
