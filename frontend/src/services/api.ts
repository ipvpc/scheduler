import axios from 'axios';
import { Task, TaskExecution, TaskLog, TaskStats, CreateTaskRequest, UpdateTaskRequest, BulkActionRequest, CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest } from '../types';

// Get API URL from environment variable, or use current origin (for HTTPS compatibility)
// This ensures we use HTTPS when the page is served over HTTPS
const getApiBaseUrl = () => {
  // Always prefer current origin when available (respects HTTPS/HTTP of current page)
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    // If page is served over HTTPS, always use HTTPS for API
    if (window.location.protocol === 'https:') {
      // If env var is set and uses HTTPS, use it; otherwise use current origin
      const envUrl = process.env.REACT_APP_API_URL;
      if (envUrl && envUrl.startsWith('https://')) {
        return envUrl;
      }
      return currentOrigin;
    }
    // For HTTP (development), use env var or current origin
    const envUrl = process.env.REACT_APP_API_URL;
    if (envUrl) {
      return envUrl;
    }
    return currentOrigin;
  }
  // Fallback for SSR or build time - always use HTTPS
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.startsWith('https://')) {
    return envUrl;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:8001';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Full URL:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Task API endpoints
export const taskApi = {
  // Get all tasks with filtering and pagination
  getTasks: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    task_type?: string;
    search?: string;
  }): Promise<Task[]> => {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/api/tasks', task);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, task: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put(`/api/tasks/${id}`, task);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },

  // Start task
  startTask: async (id: number): Promise<void> => {
    await api.post(`/api/tasks/${id}/start`);
  },

  // Stop task
  stopTask: async (id: number): Promise<void> => {
    await api.post(`/api/tasks/${id}/stop`);
  },

  // Execute task immediately
  executeTask: async (id: number): Promise<void> => {
    await api.post(`/api/tasks/${id}/execute`);
  },

  // Get task executions
  getTaskExecutions: async (
    id: number,
    params?: { skip?: number; limit?: number }
  ): Promise<TaskExecution[]> => {
    const response = await api.get(`/api/tasks/${id}/executions`, { params });
    return response.data;
  },

  // Get task logs
  getTaskLogs: async (
    id: number,
    params?: { skip?: number; limit?: number; level?: string }
  ): Promise<TaskLog[]> => {
    const response = await api.get(`/api/tasks/${id}/logs`, { params });
    return response.data;
  },

  // Get task status
  getTaskStatus: async (id: number): Promise<any> => {
    const response = await api.get(`/api/tasks/${id}/status`);
    return response.data;
  },

  // Bulk actions
  bulkAction: async (action: BulkActionRequest): Promise<any> => {
    const response = await api.post('/api/tasks/bulk-action', action);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async (): Promise<TaskStats> => {
    const response = await api.get('/api/tasks/stats/overview');
    return response.data;
  },
};

// Calendar API endpoints
export const calendarApi = {
  // Get all calendar events
  getEvents: async (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    search?: string;
  }): Promise<CalendarEvent[]> => {
    const response = await api.get('/api/calendar/events', { params });
    return response.data;
  },

  // Get event by ID
  getEvent: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get(`/api/calendar/events/${id}`);
    return response.data;
  },

  // Create new event
  createEvent: async (event: CreateCalendarEventRequest): Promise<CalendarEvent> => {
    const response = await api.post('/api/calendar/events', event);
    return response.data;
  },

  // Update event
  updateEvent: async (id: string, event: UpdateCalendarEventRequest): Promise<CalendarEvent> => {
    const response = await api.put(`/api/calendar/events/${id}`, event);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/calendar/events/${id}`);
  },

  // Get events for date range
  getEventsByDateRange: async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    const response = await api.get('/api/calendar/events/range', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Link event to task
  linkEventToTask: async (eventId: string, taskId: number): Promise<CalendarEvent> => {
    const response = await api.post(`/api/calendar/events/${eventId}/link-task`, { task_id: taskId });
    return response.data;
  },

  // Unlink event from task
  unlinkEventFromTask: async (eventId: string): Promise<CalendarEvent> => {
    const response = await api.delete(`/api/calendar/events/${eventId}/link-task`);
    return response.data;
  },

  // Get FRED economic calendar events
  getFredEvents: async (params?: {
    start_date?: string;
    end_date?: string;
    importance?: string;
  }): Promise<CalendarEvent[]> => {
    const response = await api.get('/api/calendar/fred-events', { params });
    return response.data;
  },
};

// Health check
export const healthApi = {
  checkHealth: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },

  getStatus: async (): Promise<any> => {
    const response = await api.get('/status');
    return response.data;
  },
};

export default api;
