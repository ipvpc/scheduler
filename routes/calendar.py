from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
import logging
import uuid

from services.database_service import database_service
from models.scheduled_tasks_psycopg2 import ScheduledTask
from schemas.calendar_schemas import (
    CalendarEventCreate, CalendarEventUpdate, CalendarEventResponse,
    CalendarEventListResponse
)

router = APIRouter(prefix="/api/calendar", tags=["calendar"])
logger = logging.getLogger(__name__)

@router.post("/events", response_model=CalendarEventResponse)
async def create_calendar_event(event: CalendarEventCreate):
    """Create a new calendar event"""
    try:
        # Generate unique ID
        event_id = str(uuid.uuid4())
        
        # Create event in database
        db_event = {
            "id": event_id,
            "title": event.title,
            "description": event.description,
            "start_date": event.startDate,
            "end_date": event.endDate,
            "status": event.status or "active",
            "created_by": event.created_by,
            "tags": event.tags or [],
            "task_id": event.task_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db_event = database_service.create_calendar_event(db_event)
        logger.info(f"Created calendar event: {db_event['title']}")
        return db_event
        
    except Exception as e:
        logger.error(f"Error creating calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events", response_model=List[CalendarEventResponse])
async def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Get list of calendar events with filtering"""
    try:
        events = database_service.get_calendar_events(
            start_date=start_date,
            end_date=end_date,
            status=status,
            search=search
        )
        return events
        
    except Exception as e:
        logger.error(f"Error fetching calendar events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/range", response_model=List[CalendarEventResponse])
async def get_events_by_date_range(
    start_date: str,
    end_date: str
):
    """Get calendar events within a specific date range"""
    try:
        events = database_service.get_calendar_events_by_range(start_date, end_date)
        return events
        
    except Exception as e:
        logger.error(f"Error fetching events by date range: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}", response_model=CalendarEventResponse)
async def get_calendar_event(event_id: str):
    """Get a specific calendar event by ID"""
    try:
        event = database_service.get_calendar_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/events/{event_id}", response_model=CalendarEventResponse)
async def update_calendar_event(event_id: str, event: CalendarEventUpdate):
    """Update a calendar event"""
    try:
        # Check if event exists
        existing_event = database_service.get_calendar_event(event_id)
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Update event
        update_data = event.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        updated_event = database_service.update_calendar_event(event_id, update_data)
        logger.info(f"Updated calendar event: {event_id}")
        return updated_event
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_calendar_event(event_id: str):
    """Delete a calendar event"""
    try:
        # Check if event exists
        existing_event = database_service.get_calendar_event(event_id)
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Delete event
        database_service.delete_calendar_event(event_id)
        logger.info(f"Deleted calendar event: {event_id}")
        return {"message": "Event deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting calendar event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events/{event_id}/link-task")
async def link_event_to_task(event_id: str, task_id: int):
    """Link a calendar event to a scheduled task"""
    try:
        # Check if event exists
        event = database_service.get_calendar_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Check if task exists
        task = database_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Link event to task
        updated_event = database_service.link_event_to_task(event_id, task_id)
        logger.info(f"Linked event {event_id} to task {task_id}")
        return updated_event
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking event to task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}/link-task")
async def unlink_event_from_task(event_id: str):
    """Unlink a calendar event from its scheduled task"""
    try:
        # Check if event exists
        event = database_service.get_calendar_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Unlink event from task
        updated_event = database_service.unlink_event_from_task(event_id)
        logger.info(f"Unlinked event {event_id} from task")
        return updated_event
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking event from task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}/task")
async def get_event_linked_task(event_id: str):
    """Get the task linked to a calendar event"""
    try:
        event = database_service.get_calendar_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if not event.get("task_id"):
            raise HTTPException(status_code=404, detail="Event is not linked to any task")
        
        task = database_service.get_task(event["task_id"])
        if not task:
            raise HTTPException(status_code=404, detail="Linked task not found")
        
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching linked task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fred-events", response_model=List[CalendarEventResponse])
async def get_fred_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    importance: Optional[str] = None
):
    """Get FRED economic calendar events from the database"""
    try:
        events = database_service.get_fred_calendar_events(
            start_date=start_date,
            end_date=end_date,
            importance=importance
        )
        return events
        
    except Exception as e:
        logger.error(f"Error fetching FRED calendar events: {e}")
        raise HTTPException(status_code=500, detail=str(e))
