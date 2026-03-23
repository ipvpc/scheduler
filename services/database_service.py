"""
Database service for handling all database operations using psycopg2
"""
import psycopg2
import psycopg2.extras
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import logging

from config.database import get_db
from models.scheduled_tasks_psycopg2 import (
    ScheduledTask, TaskExecution, TaskLog, TaskTemplate,
    TaskStatus, TaskType, ScheduleType
)

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service for database operations using psycopg2"""
    
    def __init__(self):
        self.connection_pool = None
    
    # ScheduledTask operations
    def create_task(self, task: ScheduledTask) -> ScheduledTask:
        """Create a new scheduled task"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO scheduled_tasks (
                        name, description, task_type, status, schedule_type,
                        cron_expression, interval_seconds, timezone,
                        http_method, url, headers, query_params, request_body,
                        timeout_seconds, auth_type, auth_token, auth_username,
                        auth_password, auth_api_key, max_retries, retry_delay_seconds,
                        concurrent_executions, created_by, tags
                    ) VALUES (
                        %(name)s, %(description)s, %(task_type)s, %(status)s, %(schedule_type)s,
                        %(cron_expression)s, %(interval_seconds)s, %(timezone)s,
                        %(http_method)s, %(url)s, %(headers)s, %(query_params)s, %(request_body)s,
                        %(timeout_seconds)s, %(auth_type)s, %(auth_token)s, %(auth_username)s,
                        %(auth_password)s, %(auth_api_key)s, %(max_retries)s, %(retry_delay_seconds)s,
                        %(concurrent_executions)s, %(created_by)s, %(tags)s
                    ) RETURNING id, created_at
                """, task.to_dict())
                
                result = cursor.fetchone()
                task.id = result[0]
                task.created_at = result[1]
                conn.commit()
                
                logger.info(f"Created task: {task.name} (ID: {task.id})")
                return task
    
    def get_task(self, task_id: int) -> Optional[ScheduledTask]:
        """Get a task by ID"""
        with get_db() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM scheduled_tasks WHERE id = %s", (task_id,))
                result = cursor.fetchone()
                
                if result:
                    return ScheduledTask.from_dict(dict(result))
                return None
    
    def get_tasks(self, skip: int = 0, limit: int = 100, 
                  status: Optional[TaskStatus] = None,
                  task_type: Optional[TaskType] = None,
                  search: Optional[str] = None) -> List[ScheduledTask]:
        """Get tasks with filtering and pagination"""
        with get_db() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                query = "SELECT * FROM scheduled_tasks WHERE 1=1"
                params = []
                
                if status:
                    query += " AND status = %s"
                    # Convert enum to string value
                    status_value = status.value if hasattr(status, 'value') else str(status)
                    logger.debug(f"Filtering by status: {status_value}")
                    params.append(status_value)
                
                if task_type:
                    query += " AND task_type = %s"
                    # Convert enum to string value
                    task_type_value = task_type.value if hasattr(task_type, 'value') else str(task_type)
                    logger.debug(f"Filtering by task_type: {task_type_value}")
                    params.append(task_type_value)
                
                if search:
                    query += " AND (name ILIKE %s OR description ILIKE %s)"
                    search_term = f"%{search}%"
                    params.extend([search_term, search_term])
                
                query += " ORDER BY created_at DESC OFFSET %s LIMIT %s"
                params.extend([skip, limit])
                
                logger.debug(f"Executing query: {query}")
                logger.debug(f"With params: {params}")
                cursor.execute(query, params)
                results = cursor.fetchall()
                
                return [ScheduledTask.from_dict(dict(row)) for row in results]
    
    def update_task(self, task_id: int, task_data: Dict[str, Any]) -> Optional[ScheduledTask]:
        """Update a task"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Build dynamic update query
                set_clauses = []
                params = []
                
                for key, value in task_data.items():
                    if key != 'id':  # Don't update ID
                        set_clauses.append(f"{key} = %s")
                        params.append(value)
                
                if not set_clauses:
                    return self.get_task(task_id)
                
                set_clauses.append("updated_at = %s")
                params.append(datetime.utcnow())
                params.append(task_id)
                
                query = f"UPDATE scheduled_tasks SET {', '.join(set_clauses)} WHERE id = %s RETURNING *"
                cursor.execute(query, params)
                
                result = cursor.fetchone()
                conn.commit()
                
                if result:
                    logger.info(f"Updated task: {task_id}")
                    return self.get_task(task_id)
                return None
    
    def delete_task(self, task_id: int) -> bool:
        """Delete a task"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM scheduled_tasks WHERE id = %s", (task_id,))
                deleted = cursor.rowcount > 0
                conn.commit()
                
                if deleted:
                    logger.info(f"Deleted task: {task_id}")
                return deleted
    
    # TaskExecution operations
    def create_execution(self, execution: TaskExecution) -> TaskExecution:
        """Create a new task execution record"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_executions (
                        task_id, started_at, completed_at, duration_seconds,
                        status, http_status_code, response_data, error_message,
                        request_url, request_method, request_headers, request_body,
                        response_size_bytes, retry_count
                    ) VALUES (
                        %(task_id)s, %(started_at)s, %(completed_at)s, %(duration_seconds)s,
                        %(status)s, %(http_status_code)s, %(response_data)s, %(error_message)s,
                        %(request_url)s, %(request_method)s, %(request_headers)s, %(request_body)s,
                        %(response_size_bytes)s, %(retry_count)s
                    ) RETURNING id
                """, execution.to_dict())
                
                result = cursor.fetchone()
                execution.id = result[0]
                conn.commit()
                
                return execution
    
    def get_executions(self, task_id: int, skip: int = 0, limit: int = 50) -> List[TaskExecution]:
        """Get executions for a task"""
        with get_db() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT * FROM task_executions 
                    WHERE task_id = %s 
                    ORDER BY started_at DESC 
                    OFFSET %s LIMIT %s
                """, (task_id, skip, limit))
                
                results = cursor.fetchall()
                return [TaskExecution.from_dict(dict(row)) for row in results]
    
    def update_execution(self, execution: TaskExecution) -> TaskExecution:
        """Update an existing execution record"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE task_executions SET
                        completed_at = %s,
                        duration_seconds = %s,
                        status = %s,
                        http_status_code = %s,
                        response_data = %s,
                        error_message = %s,
                        response_size_bytes = %s,
                        retry_count = %s
                    WHERE id = %s
                """, (
                    execution.completed_at,
                    execution.duration_seconds,
                    execution.status,
                    execution.http_status_code,
                    execution.response_data,
                    execution.error_message,
                    execution.response_size_bytes,
                    execution.retry_count,
                    execution.id
                ))
                conn.commit()
                return execution
    
    # TaskLog operations
    def create_log(self, log: TaskLog) -> TaskLog:
        """Create a new task log entry"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO task_logs (
                        task_id, execution_id, timestamp, level, message, details
                    ) VALUES (
                        %(task_id)s, %(execution_id)s, %(timestamp)s, %(level)s, %(message)s, %(details)s
                    ) RETURNING id
                """, log.to_dict())
                
                result = cursor.fetchone()
                log.id = result[0]
                conn.commit()
                
                return log
    
    def get_logs(self, task_id: int, skip: int = 0, limit: int = 100, 
                 level: Optional[str] = None) -> List[TaskLog]:
        """Get logs for a task"""
        with get_db() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                query = "SELECT * FROM task_logs WHERE task_id = %s"
                params = [task_id]
                
                if level:
                    query += " AND level = %s"
                    params.append(level.upper())
                
                query += " ORDER BY timestamp DESC OFFSET %s LIMIT %s"
                params.extend([skip, limit])
                
                cursor.execute(query, params)
                results = cursor.fetchall()
                
                return [TaskLog.from_dict(dict(row)) for row in results]
    
    # Statistics operations
    def get_task_stats(self) -> Dict[str, Any]:
        """Get overall task statistics"""
        with get_db() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                # Check if status column exists and what type it is
                cursor.execute("""
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'scheduled_tasks' 
                    AND column_name = 'status'
                """)
                status_column = cursor.fetchone()
                
                # Basic task counts
                cursor.execute("SELECT COUNT(*) as total_tasks FROM scheduled_tasks")
                total_tasks = cursor.fetchone()['total_tasks']
                
                # Handle status column queries based on column existence and type
                if status_column and status_column['data_type'] == 'USER-DEFINED':
                    # Handle enum type - convert to text for comparison
                    cursor.execute("SELECT COUNT(*) as active_tasks FROM scheduled_tasks WHERE status::text = 'active'")
                    active_tasks = cursor.fetchone()['active_tasks']
                    
                    cursor.execute("SELECT COUNT(*) as inactive_tasks FROM scheduled_tasks WHERE status::text = 'inactive'")
                    inactive_tasks = cursor.fetchone()['inactive_tasks']
                    
                    cursor.execute("SELECT COUNT(*) as error_tasks FROM scheduled_tasks WHERE status::text = 'error'")
                    error_tasks = cursor.fetchone()['error_tasks']
                elif status_column:
                    # Handle varchar type
                    cursor.execute("SELECT COUNT(*) as active_tasks FROM scheduled_tasks WHERE status = 'active'")
                    active_tasks = cursor.fetchone()['active_tasks']
                    
                    cursor.execute("SELECT COUNT(*) as inactive_tasks FROM scheduled_tasks WHERE status = 'inactive'")
                    inactive_tasks = cursor.fetchone()['inactive_tasks']
                    
                    cursor.execute("SELECT COUNT(*) as error_tasks FROM scheduled_tasks WHERE status = 'error'")
                    error_tasks = cursor.fetchone()['error_tasks']
                else:
                    # Status column doesn't exist - assume all tasks are active
                    active_tasks = total_tasks
                    inactive_tasks = 0
                    error_tasks = 0
                
                # Execution statistics
                cursor.execute("SELECT COUNT(*) as total_executions FROM task_executions")
                total_executions = cursor.fetchone()['total_executions']
                
                cursor.execute("SELECT COUNT(*) as successful_executions FROM task_executions WHERE status = 'success'")
                successful_executions = cursor.fetchone()['successful_executions']
                
                cursor.execute("SELECT COUNT(*) as failed_executions FROM task_executions WHERE status = 'failed'")
                failed_executions = cursor.fetchone()['failed_executions']
                
                # Average execution time
                cursor.execute("""
                    SELECT AVG(duration_seconds) as avg_time 
                    FROM task_executions 
                    WHERE duration_seconds IS NOT NULL
                """)
                avg_result = cursor.fetchone()
                average_execution_time = float(avg_result['avg_time']) if avg_result['avg_time'] else None
                
                # Time-based statistics
                now = datetime.utcnow()
                from datetime import timedelta
                last_24h = now - timedelta(hours=24)
                last_7d = now - timedelta(days=7)
                
                cursor.execute("""
                    SELECT COUNT(*) as last_24h_executions 
                    FROM task_executions 
                    WHERE started_at >= %s
                """, (last_24h,))
                last_24h_executions = cursor.fetchone()['last_24h_executions']
                
                cursor.execute("""
                    SELECT COUNT(*) as last_7d_executions 
                    FROM task_executions 
                    WHERE started_at >= %s
                """, (last_7d,))
                last_7d_executions = cursor.fetchone()['last_7d_executions']
                
                return {
                    'total_tasks': total_tasks,
                    'active_tasks': active_tasks,
                    'inactive_tasks': inactive_tasks,
                    'error_tasks': error_tasks,
                    'total_executions': total_executions,
                    'successful_executions': successful_executions,
                    'failed_executions': failed_executions,
                    'average_execution_time': average_execution_time,
                    'last_24h_executions': last_24h_executions,
                    'last_7d_executions': last_7d_executions
                }
    
    # Calendar Event operations
    def create_calendar_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new calendar event"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO calendar_events (
                        id, title, description, start_date, end_date, status,
                        created_by, tags, task_id, created_at, updated_at
                    ) VALUES (
                        %(id)s, %(title)s, %(description)s, %(start_date)s, %(end_date)s, %(status)s,
                        %(created_by)s, %(tags)s, %(task_id)s, %(created_at)s, %(updated_at)s
                    ) RETURNING *
                """, event_data)
                
                result = cursor.fetchone()
                columns = [desc[0] for desc in cursor.description]
                event = dict(zip(columns, result))
                
                conn.commit()
                return event
    
    def get_calendar_events(self, start_date: Optional[str] = None, end_date: Optional[str] = None,
                           status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get calendar events with filtering"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = "SELECT * FROM calendar_events WHERE 1=1"
                params = []
                
                if start_date:
                    query += " AND start_date >= %s"
                    params.append(start_date)
                
                if end_date:
                    query += " AND end_date <= %s"
                    params.append(end_date)
                
                if status:
                    query += " AND status = %s"
                    params.append(status)
                
                if search:
                    query += " AND (title ILIKE %s OR description ILIKE %s)"
                    search_term = f"%{search}%"
                    params.extend([search_term, search_term])
                
                query += " ORDER BY start_date ASC"
                
                cursor.execute(query, params)
                results = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                
                return [dict(zip(columns, row)) for row in results]
    
    def get_calendar_events_by_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get calendar events within a specific date range"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM calendar_events 
                    WHERE start_date >= %s AND end_date <= %s
                    ORDER BY start_date ASC
                """, (start_date, end_date))
                
                results = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                
                return [dict(zip(columns, row)) for row in results]
    
    def get_calendar_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific calendar event by ID"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM calendar_events WHERE id = %s", (event_id,))
                result = cursor.fetchone()
                
                if result:
                    columns = [desc[0] for desc in cursor.description]
                    return dict(zip(columns, result))
                return None
    
    def update_calendar_event(self, event_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a calendar event"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                set_clauses = []
                params = []
                
                for key, value in update_data.items():
                    if key != 'id':
                        set_clauses.append(f"{key} = %s")
                        params.append(value)
                
                if set_clauses:
                    params.append(event_id)
                    query = f"UPDATE calendar_events SET {', '.join(set_clauses)} WHERE id = %s RETURNING *"
                    
                    cursor.execute(query, params)
                    result = cursor.fetchone()
                    
                    if result:
                        columns = [desc[0] for desc in cursor.description]
                        event = dict(zip(columns, result))
                        conn.commit()
                        return event
                
                raise ValueError("No fields to update")
    
    def delete_calendar_event(self, event_id: str) -> bool:
        """Delete a calendar event"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM calendar_events WHERE id = %s", (event_id,))
                deleted = cursor.rowcount > 0
                conn.commit()
                return deleted
    
    def link_event_to_task(self, event_id: str, task_id: int) -> Dict[str, Any]:
        """Link a calendar event to a scheduled task"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE calendar_events 
                    SET task_id = %s, updated_at = NOW()
                    WHERE id = %s
                    RETURNING *
                """, (task_id, event_id))
                
                result = cursor.fetchone()
                if result:
                    columns = [desc[0] for desc in cursor.description]
                    event = dict(zip(columns, result))
                    conn.commit()
                    return event
                
                raise ValueError("Event not found")
    
    def unlink_event_from_task(self, event_id: str) -> Dict[str, Any]:
        """Unlink a calendar event from its scheduled task"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE calendar_events 
                    SET task_id = NULL, updated_at = NOW()
                    WHERE id = %s
                    RETURNING *
                """, (event_id,))
                
                result = cursor.fetchone()
                if result:
                    columns = [desc[0] for desc in cursor.description]
                    event = dict(zip(columns, result))
                    conn.commit()
                    return event
                
                raise ValueError("Event not found")
    
    def create_tables(self):
        """Create database tables if they don't exist"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Create scheduled_tasks table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS scheduled_tasks (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        task_type VARCHAR(50) NOT NULL DEFAULT 'http_request',
                        status VARCHAR(20) NOT NULL DEFAULT 'active',
                        schedule_type VARCHAR(20) NOT NULL DEFAULT 'cron',
                        cron_expression VARCHAR(100),
                        interval_seconds INTEGER,
                        timezone VARCHAR(50) DEFAULT 'America/New_York',
                        http_method VARCHAR(10) DEFAULT 'GET',
                        url TEXT NOT NULL,
                        headers JSONB DEFAULT '{}',
                        query_params JSONB DEFAULT '{}',
                        request_body TEXT,
                        timeout_seconds INTEGER DEFAULT 30,
                        auth_type VARCHAR(20) DEFAULT 'none',
                        auth_token VARCHAR(500),
                        auth_username VARCHAR(100),
                        auth_password VARCHAR(500),
                        auth_api_key VARCHAR(500),
                        max_retries INTEGER DEFAULT 3,
                        retry_delay_seconds INTEGER DEFAULT 60,
                        concurrent_executions INTEGER DEFAULT 1,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE,
                        created_by VARCHAR(100),
                        tags JSONB DEFAULT '[]'
                    )
                """)
                
                # Create task_executions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS task_executions (
                        id SERIAL PRIMARY KEY,
                        task_id INTEGER NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
                        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        completed_at TIMESTAMP WITH TIME ZONE,
                        duration_seconds INTEGER,
                        status VARCHAR(20) NOT NULL,
                        http_status_code INTEGER,
                        response_data TEXT,
                        error_message TEXT,
                        request_url TEXT NOT NULL,
                        request_method VARCHAR(10) NOT NULL,
                        request_headers JSONB DEFAULT '{}',
                        request_body TEXT,
                        response_size_bytes INTEGER,
                        retry_count INTEGER DEFAULT 0
                    )
                """)
                
                # Create task_logs table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS task_logs (
                        id SERIAL PRIMARY KEY,
                        task_id INTEGER NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
                        execution_id INTEGER REFERENCES task_executions(id) ON DELETE CASCADE,
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        level VARCHAR(10) NOT NULL,
                        message TEXT NOT NULL,
                        details JSONB DEFAULT '{}'
                    )
                """)
                
                # Create task_templates table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS task_templates (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL UNIQUE,
                        description TEXT,
                        category VARCHAR(50),
                        task_type VARCHAR(50) NOT NULL,
                        default_config JSONB NOT NULL,
                        required_fields JSONB DEFAULT '[]',
                        optional_fields JSONB DEFAULT '[]',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE,
                        is_active BOOLEAN DEFAULT TRUE,
                        usage_count INTEGER DEFAULT 0
                    )
                """)
                
                # Create calendar_events table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS calendar_events (
                        id VARCHAR(36) PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
                        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
                        status VARCHAR(20) DEFAULT 'active',
                        created_by VARCHAR(100),
                        tags JSONB DEFAULT '[]',
                        task_id INTEGER REFERENCES scheduled_tasks(id) ON DELETE SET NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Check if calendar_events table exists and add missing columns if needed
                cursor.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'calendar_events'
                """)
                existing_columns = {row[0] for row in cursor.fetchall()}
                
                # Add missing columns if table exists but is missing required columns
                if existing_columns:  # Table exists
                    if 'start_date' not in existing_columns:
                        logger.info("Adding missing column 'start_date' to calendar_events table")
                        # Check if table has any rows
                        cursor.execute("SELECT COUNT(*) FROM calendar_events")
                        row_count = cursor.fetchone()[0]
                        if row_count == 0:
                            # Table is empty, can add NOT NULL column
                            cursor.execute("""
                                ALTER TABLE calendar_events 
                                ADD COLUMN start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                            """)
                        else:
                            # Table has data, add as nullable first
                            cursor.execute("""
                                ALTER TABLE calendar_events 
                                ADD COLUMN start_date TIMESTAMP WITH TIME ZONE
                            """)
                    if 'end_date' not in existing_columns:
                        logger.info("Adding missing column 'end_date' to calendar_events table")
                        # Check if table has any rows
                        cursor.execute("SELECT COUNT(*) FROM calendar_events")
                        row_count = cursor.fetchone()[0]
                        if row_count == 0:
                            # Table is empty, can add NOT NULL column
                            cursor.execute("""
                                ALTER TABLE calendar_events 
                                ADD COLUMN end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                            """)
                        else:
                            # Table has data, add as nullable first
                            cursor.execute("""
                                ALTER TABLE calendar_events 
                                ADD COLUMN end_date TIMESTAMP WITH TIME ZONE
                            """)
                    if 'status' not in existing_columns:
                        logger.info("Adding missing column 'status' to calendar_events table")
                        cursor.execute("""
                            ALTER TABLE calendar_events 
                            ADD COLUMN status VARCHAR(20) DEFAULT 'active'
                        """)
                    if 'created_by' not in existing_columns:
                        logger.info("Adding missing column 'created_by' to calendar_events table")
                        cursor.execute("""
                            ALTER TABLE calendar_events 
                            ADD COLUMN created_by VARCHAR(100)
                        """)
                    if 'tags' not in existing_columns:
                        logger.info("Adding missing column 'tags' to calendar_events table")
                        cursor.execute("""
                            ALTER TABLE calendar_events 
                            ADD COLUMN tags JSONB DEFAULT '[]'
                        """)
                    if 'task_id' not in existing_columns:
                        logger.info("Adding missing column 'task_id' to calendar_events table")
                        cursor.execute("""
                            ALTER TABLE calendar_events 
                            ADD COLUMN task_id INTEGER REFERENCES scheduled_tasks(id) ON DELETE SET NULL
                        """)
                    if 'created_at' not in existing_columns:
                        logger.info("Adding missing column 'created_at' to calendar_events table")
                        cursor.execute("""
                            ALTER TABLE calendar_events 
                            ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        """)
                    if 'updated_at' not in existing_columns:
                        logger.info("Adding missing column 'updated_at' to calendar_events table")
                        cursor.execute("""
                            ALTER TABLE calendar_events 
                            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        """)
                
                # Create indexes
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_name ON scheduled_tasks(name)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_task_executions_task_id ON task_executions(task_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_task_executions_started_at ON task_executions(started_at)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON task_logs(task_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_task_logs_timestamp ON task_logs(timestamp)")
                
                # Only create calendar_events indexes if the columns exist
                cursor.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'calendar_events' AND column_name IN ('start_date', 'end_date', 'status', 'task_id')
                """)
                calendar_columns = {row[0] for row in cursor.fetchall()}
                
                if 'start_date' in calendar_columns:
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date)")
                if 'end_date' in calendar_columns:
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_calendar_events_end_date ON calendar_events(end_date)")
                if 'status' in calendar_columns:
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status)")
                if 'task_id' in calendar_columns:
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id)")
                
                conn.commit()
                logger.info("Database tables created/verified successfully")
    
    def get_fred_calendar_events(self, start_date: Optional[str] = None, 
                                  end_date: Optional[str] = None,
                                  importance: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get FRED economic calendar events from the database"""
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT 
                        id,
                        series_id,
                        date,
                        time,
                        indicator,
                        country,
                        importance,
                        actual,
                        forecast,
                        previous,
                        unit,
                        description,
                        frequency,
                        title,
                        created_at,
                        updated_at
                    FROM fred_calendar
                    WHERE 1=1
                """
                params = []
                
                if start_date:
                    query += " AND date >= %s"
                    params.append(start_date)
                
                if end_date:
                    query += " AND date <= %s"
                    params.append(end_date)
                
                if importance:
                    query += " AND importance = %s"
                    params.append(importance)
                
                query += " ORDER BY date ASC, importance DESC, indicator ASC"
                
                cursor.execute(query, params)
                results = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                
                events = []
                for row in results:
                    event = dict(zip(columns, row))
                    # Convert to CalendarEvent format
                    calendar_event = {
                        "id": event.get("id"),
                        "title": event.get("indicator") or event.get("series_id"),
                        "description": event.get("description") or f"{event.get('indicator')} Release",
                        "startDate": event.get("date").isoformat() if event.get("date") else None,
                        "endDate": (event.get("date") + datetime.timedelta(hours=1)).isoformat() if event.get("date") else None,
                        "status": "active",
                        "created_by": "fred_system",
                        "tags": ["fred", "economic", event.get("importance", "").lower()],
                        "task_id": None,
                        "fred_data": {
                            "series_id": event.get("series_id"),
                            "actual": event.get("actual"),
                            "forecast": event.get("forecast"),
                            "previous": event.get("previous"),
                            "unit": event.get("unit"),
                            "frequency": event.get("frequency"),
                            "importance": event.get("importance")
                        }
                    }
                    events.append(calendar_event)
                
                return events

# Global instance
database_service = DatabaseService()
