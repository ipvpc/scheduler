-- =============================================================================
-- ALPHA5 SCHEDULER - DATABASE ENUM FIX
-- =============================================================================

-- Check if the enum types exist and fix them
DO $$
BEGIN
    -- Create or replace TaskStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskstatus') THEN
        CREATE TYPE taskstatus AS ENUM ('active', 'inactive', 'paused', 'error');
    ELSE
        -- Drop and recreate if it exists with wrong values
        DROP TYPE IF EXISTS taskstatus CASCADE;
        CREATE TYPE taskstatus AS ENUM ('active', 'inactive', 'paused', 'error');
    END IF;
    
    -- Create or replace TaskType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasktype') THEN
        CREATE TYPE tasktype AS ENUM ('http_request', 'data_sync', 'market_scan', 'alert_check', 'custom_script');
    ELSE
        -- Drop and recreate if it exists with wrong values
        DROP TYPE IF EXISTS tasktype CASCADE;
        CREATE TYPE tasktype AS ENUM ('http_request', 'data_sync', 'market_scan', 'alert_check', 'custom_script');
    END IF;
    
    -- Create or replace ScheduleType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheduletype') THEN
        CREATE TYPE scheduletype AS ENUM ('cron', 'interval', 'once');
    ELSE
        -- Drop and recreate if it exists with wrong values
        DROP TYPE IF EXISTS scheduletype CASCADE;
        CREATE TYPE scheduletype AS ENUM ('cron', 'interval', 'once');
    END IF;
END $$;

-- Create the scheduled_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type tasktype NOT NULL DEFAULT 'http_request',
    status taskstatus NOT NULL DEFAULT 'active',
    schedule_type scheduletype NOT NULL DEFAULT 'cron',
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
    tags JSONB DEFAULT '[]'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_task_type ON scheduled_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_name ON scheduled_tasks(name);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_created_at ON scheduled_tasks(created_at);

-- Create task_executions table if it doesn't exist
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
);

-- Create indexes for task_executions
CREATE INDEX IF NOT EXISTS idx_task_executions_task_id ON task_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status);
CREATE INDEX IF NOT EXISTS idx_task_executions_started_at ON task_executions(started_at);

-- Create task_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
    execution_id INTEGER REFERENCES task_executions(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'
);

-- Create indexes for task_logs
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_execution_id ON task_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_timestamp ON task_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_task_logs_level ON task_logs(level);

-- Create task_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    task_type tasktype NOT NULL,
    default_config JSONB NOT NULL,
    required_fields JSONB DEFAULT '[]'::jsonb,
    optional_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0
);

-- Create indexes for task_templates
CREATE INDEX IF NOT EXISTS idx_task_templates_name ON task_templates(name);
CREATE INDEX IF NOT EXISTS idx_task_templates_task_type ON task_templates(task_type);
CREATE INDEX IF NOT EXISTS idx_task_templates_is_active ON task_templates(is_active);

-- Insert some sample data if tables are empty
INSERT INTO scheduled_tasks (
    name, description, task_type, status, schedule_type, cron_expression, 
    url, http_method, timeout_seconds, max_retries, created_by
) VALUES (
    'Sample Health Check',
    'A sample health check task',
    'http_request',
    'active',
    'cron',
    '0 */5 * * * *',
    'https://httpbin.org/status/200',
    'GET',
    30,
    3,
    'system'
) ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_scheduled_tasks_updated_at ON scheduled_tasks;
CREATE TRIGGER update_scheduled_tasks_updated_at
    BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_templates_updated_at ON task_templates;
CREATE TRIGGER update_task_templates_updated_at
    BEFORE UPDATE ON task_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
