-- Fix status column type issue
-- This script converts the status column from enum to varchar to match application expectations

-- First, let's check if the status column exists and what type it is
DO $$
BEGIN
    -- Check if the status column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'scheduled_tasks' 
        AND column_name = 'status'
    ) THEN
        -- Check if it's an enum type
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'scheduled_tasks' 
            AND column_name = 'status'
            AND data_type = 'USER-DEFINED'
        ) THEN
            -- Convert enum to varchar
            ALTER TABLE scheduled_tasks 
            ALTER COLUMN status TYPE VARCHAR(20) 
            USING status::text;
            
            RAISE NOTICE 'Converted status column from enum to varchar';
        ELSE
            RAISE NOTICE 'Status column is already varchar type';
        END IF;
    ELSE
        -- Add status column if it doesn't exist
        ALTER TABLE scheduled_tasks 
        ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
        
        RAISE NOTICE 'Added status column as varchar';
    END IF;
END $$;

-- Update any existing records to have proper status values
UPDATE scheduled_tasks 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- Create index on status column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);

-- Verify the fix
DO $$
DECLARE
    column_type text;
BEGIN
    SELECT data_type 
    INTO column_type
    FROM information_schema.columns 
    WHERE table_name = 'scheduled_tasks' 
    AND column_name = 'status';
    
    RAISE NOTICE 'Status column type is now: %', column_type;
END $$;
