from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CalendarEventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Event title")
    description: str = Field(..., max_length=1000, description="Event description")
    startDate: str = Field(..., description="Event start date and time (ISO format)")
    endDate: str = Field(..., description="Event end date and time (ISO format)")
    status: Optional[str] = Field("active", description="Event status")
    created_by: Optional[str] = Field(None, description="User who created the event")
    tags: Optional[List[str]] = Field(default_factory=list, description="Event tags")
    task_id: Optional[int] = Field(None, description="Linked scheduled task ID")

class CalendarEventCreate(CalendarEventBase):
    """Schema for creating a new calendar event"""
    pass

class CalendarEventUpdate(BaseModel):
    """Schema for updating a calendar event"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    startDate: Optional[str] = Field(None, description="Event start date and time (ISO format)")
    endDate: Optional[str] = Field(None, description="Event end date and time (ISO format)")
    status: Optional[str] = Field(None, description="Event status")
    tags: Optional[List[str]] = Field(None, description="Event tags")
    task_id: Optional[int] = Field(None, description="Linked scheduled task ID")

class CalendarEventResponse(CalendarEventBase):
    """Schema for calendar event response"""
    id: str = Field(..., description="Unique event identifier")
    created_at: str = Field(..., description="Event creation timestamp")
    updated_at: Optional[str] = Field(None, description="Event last update timestamp")
    
    class Config:
        from_attributes = True

class CalendarEventListResponse(BaseModel):
    """Schema for paginated calendar events list"""
    events: List[CalendarEventResponse]
    total: int = Field(..., description="Total number of events")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of events per page")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")

class CalendarStatsResponse(BaseModel):
    """Schema for calendar statistics"""
    total_events: int = Field(..., description="Total number of events")
    active_events: int = Field(..., description="Number of active events")
    upcoming_events: int = Field(..., description="Number of upcoming events (next 7 days)")
    events_this_month: int = Field(..., description="Number of events this month")
    linked_events: int = Field(..., description="Number of events linked to tasks")
    unlinked_events: int = Field(..., description="Number of events not linked to tasks")
