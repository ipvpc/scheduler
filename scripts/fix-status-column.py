#!/usr/bin/env python3
"""
Script to fix the status column issue in the scheduled_tasks table.
This script converts the status column from enum to varchar to match application expectations.
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Add the parent directory to the path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import get_db_connection_params

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_status_column():
    """Fix the status column type issue"""
    try:
        # Get database connection parameters
        db_params = get_db_connection_params()
        
        # Connect to database
        conn = psycopg2.connect(**db_params)
        conn.autocommit = True
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            logger.info("Checking current status column type...")
            
            # Check if the status column exists and what type it is
            cursor.execute("""
                SELECT data_type, column_name 
                FROM information_schema.columns 
                WHERE table_name = 'scheduled_tasks' 
                AND column_name = 'status'
            """)
            
            result = cursor.fetchone()
            
            if not result:
                logger.info("Status column doesn't exist, creating it...")
                cursor.execute("""
                    ALTER TABLE scheduled_tasks 
                    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
                """)
                logger.info("Status column created successfully")
            else:
                current_type = result['data_type']
                logger.info(f"Status column exists with type: {current_type}")
                
                if current_type == 'USER-DEFINED':
                    logger.info("Converting status column from enum to varchar...")
                    cursor.execute("""
                        ALTER TABLE scheduled_tasks 
                        ALTER COLUMN status TYPE VARCHAR(20) 
                        USING status::text
                    """)
                    logger.info("Status column converted successfully")
                else:
                    logger.info("Status column is already varchar type")
            
            # Update any existing records to have proper status values
            cursor.execute("""
                UPDATE scheduled_tasks 
                SET status = 'active' 
                WHERE status IS NULL OR status = ''
            """)
            
            # Create index on status column if it doesn't exist
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status 
                ON scheduled_tasks(status)
            """)
            
            # Verify the fix
            cursor.execute("""
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'scheduled_tasks' 
                AND column_name = 'status'
            """)
            
            final_type = cursor.fetchone()['data_type']
            logger.info(f"Status column type is now: {final_type}")
            
            # Test the query that was failing
            logger.info("Testing the problematic query...")
            cursor.execute("SELECT COUNT(*) as active_tasks FROM scheduled_tasks WHERE status = 'active'")
            result = cursor.fetchone()
            logger.info(f"Query successful! Active tasks count: {result['active_tasks']}")
            
        conn.close()
        logger.info("Status column fix completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing status column: {e}")
        return False

def test_stats_query():
    """Test the stats query that was failing"""
    try:
        db_params = get_db_connection_params()
        conn = psycopg2.connect(**db_params)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Test all the queries from get_task_stats
            queries = [
                "SELECT COUNT(*) as total_tasks FROM scheduled_tasks",
                "SELECT COUNT(*) as active_tasks FROM scheduled_tasks WHERE status = 'active'",
                "SELECT COUNT(*) as inactive_tasks FROM scheduled_tasks WHERE status = 'inactive'",
                "SELECT COUNT(*) as error_tasks FROM scheduled_tasks WHERE status = 'error'"
            ]
            
            for query in queries:
                logger.info(f"Testing query: {query}")
                cursor.execute(query)
                result = cursor.fetchone()
                logger.info(f"Result: {dict(result)}")
                
        conn.close()
        logger.info("All stats queries working correctly!")
        return True
        
    except Exception as e:
        logger.error(f"Error testing stats queries: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting status column fix...")
    
    if fix_status_column():
        logger.info("Testing stats queries...")
        if test_stats_query():
            logger.info("✅ Status column fix completed successfully!")
            sys.exit(0)
        else:
            logger.error("❌ Stats queries still failing")
            sys.exit(1)
    else:
        logger.error("❌ Failed to fix status column")
        sys.exit(1)
