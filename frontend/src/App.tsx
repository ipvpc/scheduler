import React, { useState, useEffect, useCallback } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Container,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Plus,
  BarChart3,
  Clock,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import hedgeFundTheme from './theme/theme';
import StatsCards from './components/Dashboard/StatsCards';
import TaskList from './components/Tasks/TaskList';
import TaskForm from './components/Tasks/TaskForm';
import Calendar from './components/Calendar/EnhancedCalendar';
import Navbar from './components/Navigation/Navbar';
import { Task, TaskStats, CreateTaskRequest, UpdateTaskRequest, CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest } from './types';
import { taskApi, calendarApi } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        taskApi.getTasks(),
        taskApi.getTaskStats(),
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      // Load both regular calendar events and FRED events
      const [regularEvents, fredEvents] = await Promise.all([
        calendarApi.getEvents().catch(() => []),
        calendarApi.getFredEvents().catch(() => [])
      ]);
      
      // Combine both event types
      setEvents([...regularEvents, ...fredEvents]);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      // Initialize with empty array if API is not available
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadEvents();
  }, [loadTasks, loadEvents]);

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      await taskApi.createTask(taskData);
      showSnackbar('Task created successfully');
      setFormOpen(false);
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      showSnackbar('Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskRequest) => {
    if (!editingTask) return;
    
    try {
      await taskApi.updateTask(editingTask.id, taskData);
      showSnackbar('Task updated successfully');
      setFormOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleTaskAction = async (action: string, taskId: number) => {
    try {
      switch (action) {
        case 'start':
          await taskApi.startTask(taskId);
          showSnackbar('Task started');
          break;
        case 'stop':
          await taskApi.stopTask(taskId);
          showSnackbar('Task stopped');
          break;
        case 'pause':
          // Handle pause if needed
          showSnackbar('Task paused');
          break;
        case 'execute':
          await taskApi.executeTask(taskId);
          showSnackbar('Task executed');
          break;
        case 'delete':
          await taskApi.deleteTask(taskId);
          showSnackbar('Task deleted');
          break;
        case 'refresh':
          loadTasks();
          return;
        default:
          break;
      }
      loadTasks();
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      showSnackbar(`Failed to ${action} task`, 'error');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleViewTask = (task: Task) => {
    // Implement task view functionality
    console.log('View task:', task);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (taskData: CreateTaskRequest | UpdateTaskRequest) => {
    if (editingTask) {
      handleUpdateTask(taskData as UpdateTaskRequest);
    } else {
      handleCreateTask(taskData as CreateTaskRequest);
    }
  };

  // Calendar event handlers
  const handleEventCreate = async (eventData: CreateCalendarEventRequest) => {
    try {
      await calendarApi.createEvent(eventData);
      showSnackbar('Event created successfully');
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      showSnackbar('Failed to create event', 'error');
    }
  };

  const handleEventUpdate = async (id: string, eventData: UpdateCalendarEventRequest) => {
    try {
      await calendarApi.updateEvent(id, eventData);
      showSnackbar('Event updated successfully');
      loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      showSnackbar('Failed to update event', 'error');
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      await calendarApi.deleteEvent(id);
      showSnackbar('Event deleted successfully');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      showSnackbar('Failed to delete event', 'error');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={hedgeFundTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Navbar */}
          <Navbar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onRefresh={() => {
              loadTasks();
              loadEvents();
            }}
            stats={stats ? {
              total_tasks: stats.total_tasks,
              active_tasks: stats.active_tasks,
              total_executions: stats.total_executions,
            } : undefined}
          />

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
            {/* Tab Content */}
            {currentTab === 0 && (
              <>
                {/* Stats Cards */}
                <Box sx={{ mb: 4 }}>
                  <StatsCards stats={stats} loading={loading} />
                </Box>

                {/* Task List */}
                <TaskList
                  tasks={tasks}
                  loading={loading}
                  onTaskAction={handleTaskAction}
                  onEditTask={handleEditTask}
                  onViewTask={handleViewTask}
                />
              </>
            )}

            {currentTab === 1 && (
              <Calendar
                events={events}
                onEventCreate={handleEventCreate}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
                loading={loading}
              />
            )}

            {currentTab === 2 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <BarChart3 size={64} color="#8B949E" style={{ marginBottom: 16 }} />
                <Typography variant="h4" sx={{ color: '#F0F6FC', mb: 2 }}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: '#8B949E' }}>
                  Performance metrics and analytics coming soon...
                </Typography>
              </Box>
            )}

            {currentTab === 3 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Clock size={64} color="#8B949E" style={{ marginBottom: 16 }} />
                <Typography variant="h4" sx={{ color: '#F0F6FC', mb: 2 }}>
                  System Monitoring
                </Typography>
                <Typography variant="body1" sx={{ color: '#8B949E' }}>
                  Real-time system health monitoring coming soon...
                </Typography>
              </Box>
            )}
          </Container>

          {/* Floating Action Button - Only show on Dashboard */}
          {currentTab === 0 && (
            <Fab
              color="primary"
              aria-label="add task"
              onClick={() => setFormOpen(true)}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                backgroundColor: '#00D4AA',
                '&:hover': {
                  backgroundColor: '#00B894',
                },
              }}
            >
              <Plus size={24} />
            </Fab>
          )}

          {/* Task Form Dialog */}
          <TaskForm
            open={formOpen}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
            task={editingTask || undefined}
            loading={false}
          />

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161B22',
                color: '#F0F6FC',
                border: '1px solid #30363D',
              },
            }}
          />
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
