export interface Task {
  id: number;
  name: string;
  description?: string;
  task_type: 'http_request' | 'data_sync' | 'market_scan' | 'alert_check' | 'custom_script';
  status: 'active' | 'inactive' | 'paused' | 'error';
  schedule_type: 'cron' | 'interval' | 'once';
  cron_expression?: string;
  interval_seconds?: number;
  timezone: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  query_params: Record<string, any>;
  request_body?: string;
  timeout_seconds: number;
  auth_type: 'none' | 'bearer' | 'basic' | 'api_key';
  auth_token?: string;
  auth_username?: string;
  auth_password?: string;
  auth_api_key?: string;
  max_retries: number;
  retry_delay_seconds: number;
  concurrent_executions: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  tags: string[];
}

export interface TaskExecution {
  id: number;
  task_id: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  status: 'running' | 'success' | 'failed' | 'timeout';
  http_status_code?: number;
  response_data?: string;
  error_message?: string;
  request_url: string;
  request_method: string;
  request_headers: Record<string, string>;
  request_body?: string;
  response_size_bytes?: number;
  retry_count: number;
}

export interface TaskLog {
  id: number;
  task_id: number;
  execution_id?: number;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  details: Record<string, any>;
}

export interface TaskStats {
  total_tasks: number;
  active_tasks: number;
  inactive_tasks: number;
  error_tasks: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_execution_time?: number;
  last_24h_executions: number;
  last_7d_executions: number;
}

export interface TaskTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  task_type: 'http_request' | 'data_sync' | 'market_scan' | 'alert_check' | 'custom_script';
  default_config: Record<string, any>;
  required_fields: string[];
  optional_fields: string[];
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  usage_count: number;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  task_type: 'http_request' | 'data_sync' | 'market_scan' | 'alert_check' | 'custom_script';
  schedule_type: 'cron' | 'interval' | 'once';
  cron_expression?: string;
  interval_seconds?: number;
  timezone: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  query_params?: Record<string, any>;
  request_body?: string;
  timeout_seconds?: number;
  auth_type?: 'none' | 'bearer' | 'basic' | 'api_key';
  auth_token?: string;
  auth_username?: string;
  auth_password?: string;
  auth_api_key?: string;
  max_retries?: number;
  retry_delay_seconds?: number;
  concurrent_executions?: number;
  created_by?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'paused' | 'error';
  schedule_type?: 'cron' | 'interval' | 'once';
  cron_expression?: string;
  interval_seconds?: number;
  timezone?: string;
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url?: string;
  headers?: Record<string, string>;
  query_params?: Record<string, any>;
  request_body?: string;
  timeout_seconds?: number;
  auth_type?: 'none' | 'bearer' | 'basic' | 'api_key';
  auth_token?: string;
  auth_username?: string;
  auth_password?: string;
  auth_api_key?: string;
  max_retries?: number;
  retry_delay_seconds?: number;
  concurrent_executions?: number;
  tags?: string[];
}

export interface BulkActionRequest {
  action: 'start' | 'stop' | 'pause' | 'resume' | 'delete';
  task_ids: number[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Calendar Types
export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  tags?: string[];
  task_id?: number; // Link to scheduled task if applicable
}

export interface CreateCalendarEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: 'active' | 'paused' | 'completed';
  created_by?: string;
  tags?: string[];
  task_id?: number;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'paused' | 'completed';
  tags?: string[];
  task_id?: number;
}