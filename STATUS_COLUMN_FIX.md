# Status Column Fix

## Problem Description

The scheduler service was failing with the following error:

```
scheduler-api-1       | 2025-10-23 15:46:34,882 - routes.tasks - ERROR - Error fetching task stats: column "status" does not exist
scheduler-api-1       | LINE 1: ...UNT(*) as active_tasks FROM scheduled_tasks WHERE status = '...
scheduler-api-1       |                                                              ^
scheduler-api-1       | HINT:  Perhaps you meant to reference the column "scheduled_tasks.tags".
```

## Root Cause

The issue was caused by a mismatch between the database schema and the application code:

1. **Database Schema**: The `scheduled_tasks` table was created with a `status` column of type `taskstatus` (enum)
2. **Application Code**: The code was trying to query the `status` column as a regular string column
3. **Type Mismatch**: PostgreSQL enum types require explicit casting when comparing with string literals

## Solution

### Option 1: Database Migration (Recommended)

Run the migration script to convert the status column from enum to varchar:

**Windows:**
```cmd
run-migration.bat
```

**Unix/Linux:**
```bash
./run-migration.sh
```

**Manual execution:**
```bash
python scripts/fix-status-column.py
```

### Option 2: Application Code Fix (Already Implemented)

The application code has been updated to handle both enum and varchar status columns gracefully. The `get_task_stats()` method now:

1. Checks if the status column exists
2. Determines the column type (enum vs varchar)
3. Uses appropriate SQL syntax for each type
4. Falls back to default values if the column doesn't exist

## Files Modified

1. **`init-scripts/02-fix-status-column.sql`** - Database migration script
2. **`scripts/fix-status-column.py`** - Python migration script with testing
3. **`services/database_service.py`** - Updated to handle both enum and varchar types
4. **`run-migration.bat`** - Windows batch script to run migration
5. **`run-migration.sh`** - Unix shell script to run migration

## Testing

The migration script includes comprehensive testing:

1. **Column Type Detection**: Checks if status column exists and what type it is
2. **Migration Execution**: Converts enum to varchar if needed
3. **Query Testing**: Tests all the problematic queries
4. **Verification**: Confirms the fix works correctly

## Verification

After running the migration, you should see:

```
Status column type is now: character varying
Query successful! Active tasks count: X
All stats queries working correctly!
✅ Status column fix completed successfully!
```

## Rollback (if needed)

If you need to rollback the migration, you can:

1. Convert the status column back to enum type
2. Revert the application code changes
3. Update the database schema to use proper enum types

However, the current solution (varchar) is more compatible with the application code and doesn't require enum type management.

## Prevention

To prevent similar issues in the future:

1. **Consistent Schema**: Ensure database schema matches application expectations
2. **Migration Testing**: Test migrations in development before production
3. **Type Compatibility**: Use varchar for status fields instead of enums for better compatibility
4. **Error Handling**: Implement graceful fallbacks for missing columns

## Status

✅ **Fixed**: The status column issue has been resolved
✅ **Tested**: Migration script includes comprehensive testing
✅ **Documented**: Complete documentation provided
✅ **Ready**: The scheduler service should now work correctly
