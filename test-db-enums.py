#!/usr/bin/env python3
"""
Test script to check database enum values and fix any mismatches
"""

import psycopg2
import os
from config.database import get_db

def test_database_enums():
    """Test database enum values and fix if needed"""
    
    print("🔍 Testing database enum values...")
    
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check if enum types exist
                cursor.execute("""
                    SELECT typname, enumlabel 
                    FROM pg_type t 
                    JOIN pg_enum e ON t.oid = e.enumtypid 
                    WHERE typname IN ('taskstatus', 'tasktype', 'scheduletype')
                    ORDER BY typname, e.enumsortorder;
                """)
                
                enum_values = cursor.fetchall()
                print("📊 Current enum values:")
                for enum_name, enum_value in enum_values:
                    print(f"  {enum_name}: {enum_value}")
                
                # Test querying with different status values
                test_statuses = ['active', 'inactive', 'paused', 'error']
                
                for status in test_statuses:
                    try:
                        cursor.execute("SELECT COUNT(*) FROM scheduled_tasks WHERE status = %s", (status,))
                        count = cursor.fetchone()[0]
                        print(f"✅ Status '{status}': {count} tasks found")
                    except Exception as e:
                        print(f"❌ Status '{status}': Error - {e}")
                
                # Check table structure
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'scheduled_tasks' 
                    AND column_name IN ('status', 'task_type', 'schedule_type')
                    ORDER BY column_name;
                """)
                
                columns = cursor.fetchall()
                print("\n📋 Table structure:")
                for col in columns:
                    print(f"  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
                
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False
    
    return True

def fix_database_enums():
    """Fix database enum values if needed"""
    
    print("\n🔧 Attempting to fix database enums...")
    
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Read and execute the SQL fix script
                with open('init-scripts/01-fix-enums.sql', 'r') as f:
                    sql_script = f.read()
                
                cursor.execute(sql_script)
                conn.commit()
                print("✅ Database enums fixed successfully!")
                
    except Exception as e:
        print(f"❌ Error fixing database enums: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Alpha5 Scheduler - Database Enum Test")
    print("=" * 50)
    
    # Test current state
    if test_database_enums():
        print("\n✅ Database connection successful")
    else:
        print("\n❌ Database connection failed")
        exit(1)
    
    # Try to fix enums
    if fix_database_enums():
        print("\n🔄 Re-testing after fix...")
        test_database_enums()
    
    print("\n✅ Database enum test completed!")
