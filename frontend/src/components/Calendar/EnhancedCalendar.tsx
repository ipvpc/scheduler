import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth, 
  isToday,
  addWeeks,
  subWeeks,
  startOfWeek as getStartOfWeek,
  endOfWeek as getEndOfWeek,
} from 'date-fns';

interface EnhancedCalendarProps {
  events: any[];
  onEventCreate: (event: any) => void;
  onEventUpdate: (id: string, event: any) => void;
  onEventDelete: (id: string) => void;
  loading?: boolean;
}

type ViewType = 'month' | 'week' | 'day';

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  events,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventDialog, setEventDialog] = useState<{
    open: boolean;
    event?: any;
    date?: Date;
  }>({ open: false });
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getFilteredEvents = () => {
    if (filterStatus === 'all') return events;
    return events.filter(event => event.status === filterStatus);
  };

  const getEventsForDate = (date: Date) => {
    return getFilteredEvents().filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isTodayDate = isToday(day);

      days.push(
        <Grid item xs={12/7} key={day.toISOString()}>
          <Box
            sx={{
              minHeight: 120,
              border: '1px solid #30363D',
              p: 1,
              backgroundColor: isCurrentMonth ? 'transparent' : '#0D1117',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#161B22',
              },
              ...(isTodayDate && {
                backgroundColor: '#0D4F3C',
                border: '2px solid #00D4AA',
              }),
            }}
            onClick={() => setSelectedDate(day)}
          >
            <Typography
              variant="body2"
              sx={{
                color: isCurrentMonth ? '#F0F6FC' : '#8B949E',
                fontWeight: isTodayDate ? 700 : 400,
                mb: 1,
              }}
            >
              {format(day, 'd')}
            </Typography>
            
            {dayEvents.slice(0, 2).map((event) => {
              const currentDay = day;
              return (
                <Chip
                  key={event.id}
                  label={event.title}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 20,
                    mb: 0.5,
                    backgroundColor: event.status === 'active' ? '#00D4AA' : 
                                  event.status === 'paused' ? '#FFA500' : '#8B949E',
                    color: '#0A0E13',
                    fontWeight: 600,
                    display: 'block',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventDialog({ open: true, event });
                  }}
                />
              );
            })}
            
            {dayEvents.length > 2 && (
              <Typography variant="caption" sx={{ color: '#8B949E' }}>
                +{dayEvents.length - 2} more
              </Typography>
            )}
          </Box>
        </Grid>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const renderWeekView = () => {
    const weekStart = getStartOfWeek(currentDate);

    const days = [];
    let day = weekStart;

    for (let i = 0; i < 7; i++) {
      const dayEvents = getEventsForDate(day);
      const isTodayDate = isToday(day);

      days.push(
        <Grid item xs={12/7} key={day.toISOString()}>
          <Box
            sx={{
              minHeight: 200,
              border: '1px solid #30363D',
              p: 2,
              backgroundColor: isTodayDate ? '#0D4F3C' : 'transparent',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#F0F6FC',
                  fontWeight: isTodayDate ? 700 : 600,
                }}
              >
                {format(day, 'EEE')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#8B949E',
                  ml: 1,
                }}
              >
                {format(day, 'MMM d')}
              </Typography>
            </Box>

            {dayEvents.map(event => (
              <Card
                key={event.id}
                sx={{
                  mb: 1,
                  backgroundColor: event.status === 'active' ? '#00D4AA20' : 
                                event.status === 'paused' ? '#FFA50020' : '#8B949E20',
                  border: `1px solid ${event.status === 'active' ? '#00D4AA' : 
                                        event.status === 'paused' ? '#FFA500' : '#8B949E'}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: event.status === 'active' ? '#00D4AA30' : 
                                    event.status === 'paused' ? '#FFA50030' : '#8B949E30',
                  },
                }}
                onClick={() => setEventDialog({ open: true, event })}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle2" sx={{ color: '#F0F6FC', mb: 0.5 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8B949E' }}>
                    {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const renderDayView = () => {
    const dayEvents = selectedDate ? getEventsForDate(selectedDate) : [];
    const displayDate = selectedDate || currentDate;

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#F0F6FC', mb: 1 }}>
            {format(displayDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Divider sx={{ borderColor: '#30363D' }} />
        </Box>

        {dayEvents.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: '#8B949E',
            }}
          >
            <CalendarIcon size={48} style={{ marginBottom: 16 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No events scheduled
            </Typography>
            <Typography variant="body2">
              Click the + button to add a new event
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {dayEvents.map(event => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card
                  sx={{
                    backgroundColor: event.status === 'active' ? '#00D4AA20' : 
                                  event.status === 'paused' ? '#FFA50020' : '#8B949E20',
                    border: `1px solid ${event.status === 'active' ? '#00D4AA' : 
                                      event.status === 'paused' ? '#FFA500' : '#8B949E'}`,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: event.status === 'active' ? '#00D4AA30' : 
                                      event.status === 'paused' ? '#FFA50030' : '#8B949E30',
                    },
                  }}
                  onClick={() => setEventDialog({ open: true, event })}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#F0F6FC', flexGrow: 1 }}>
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.status}
                        size="small"
                        sx={{
                          backgroundColor: event.status === 'active' ? '#00D4AA' : 
                                        event.status === 'paused' ? '#FFA500' : '#8B949E',
                          color: '#0A0E13',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8B949E', mb: 1 }}>
                      {event.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} color="#8B949E" />
                      <Typography variant="caption" sx={{ color: '#8B949E' }}>
                        {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const handleEventSubmit = (eventData: any) => {
    if (eventDialog.event) {
      onEventUpdate(eventDialog.event.id, eventData);
    } else {
      onEventCreate(eventData);
    }
    setEventDialog({ open: false });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ color: '#F0F6FC', fontWeight: 700 }}>
            Calendar
          </Typography>
          <Chip
            label={`${getFilteredEvents().length} events`}
            sx={{
              backgroundColor: '#00D4AA',
              color: '#0A0E13',
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* View Toggle */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['month', 'week', 'day'] as ViewType[]).map(viewType => (
              <Button
                key={viewType}
                variant={view === viewType ? 'contained' : 'outlined'}
                onClick={() => setView(viewType)}
                sx={{
                  textTransform: 'capitalize',
                  backgroundColor: view === viewType ? '#00D4AA' : 'transparent',
                  borderColor: '#30363D',
                  color: view === viewType ? '#0A0E13' : '#F0F6FC',
                  '&:hover': {
                    backgroundColor: view === viewType ? '#00B894' : '#161B22',
                  },
                }}
              >
                {viewType}
              </Button>
            ))}
          </Box>

          {/* Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#8B949E' }}>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{
                color: '#F0F6FC',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#30363D',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00D4AA',
                },
              }}
            >
              <MenuItem value="all">All Events</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          {/* Add Event Button */}
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setEventDialog({ open: true, date: selectedDate || currentDate })}
            sx={{
              backgroundColor: '#00D4AA',
              '&:hover': {
                backgroundColor: '#00B894',
              },
            }}
          >
            Add Event
          </Button>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
            sx={{ color: '#F0F6FC' }}
          >
            <ChevronLeft size={24} />
          </IconButton>
          
          <Typography variant="h5" sx={{ color: '#F0F6FC', fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
            {view === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : view === 'week'
              ? `${format(getStartOfWeek(currentDate), 'MMM d')} - ${format(getEndOfWeek(currentDate), 'MMM d, yyyy')}`
              : format(selectedDate || currentDate, 'MMMM d, yyyy')
            }
          </Typography>
          
          <IconButton
            onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
            sx={{ color: '#F0F6FC' }}
          >
            <ChevronRight size={24} />
          </IconButton>
        </Box>

        <Button
          variant="outlined"
          onClick={() => setCurrentDate(new Date())}
          sx={{
            borderColor: '#30363D',
            color: '#F0F6FC',
            '&:hover': {
              borderColor: '#00D4AA',
              backgroundColor: '#00D4AA20',
            },
          }}
        >
          Today
        </Button>
      </Box>

      {/* Calendar Content */}
      <Paper
        sx={{
          flex: 1,
          backgroundColor: '#0D1117',
          border: '1px solid #30363D',
          overflow: 'hidden',
        }}
      >
        {view === 'month' && (
          <Grid container spacing={0}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Grid item xs={12/7} key={day}>
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#161B22',
                    borderBottom: '1px solid #30363D',
                    borderRight: '1px solid #30363D',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#F0F6FC', fontWeight: 600 }}>
                    {day}
                  </Typography>
                </Box>
              </Grid>
            ))}
            {renderMonthView()}
          </Grid>
        )}

        {view === 'week' && (
          <Grid container spacing={0}>
            {renderWeekView()}
          </Grid>
        )}

        {view === 'day' && (
          <Box sx={{ p: 3 }}>
            {renderDayView()}
          </Box>
        )}
      </Paper>

      {/* Event Dialog */}
      <EventDialog
        open={eventDialog.open}
        onClose={() => setEventDialog({ open: false })}
        onSubmit={handleEventSubmit}
        event={eventDialog.event}
        defaultDate={eventDialog.date}
      />
    </Box>
  );
};

// Event Dialog Component
interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: any) => void;
  event?: any;
  defaultDate?: Date;
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  onSubmit,
  event,
  defaultDate,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'paused' | 'completed';
  }>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
      });
    } else if (defaultDate) {
      const dateStr = format(defaultDate, 'yyyy-MM-dd');
      setFormData(prev => ({
        ...prev,
        startDate: `${dateStr}T09:00`,
        endDate: `${dateStr}T17:00`,
      }));
    }
  }, [event, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#F0F6FC', backgroundColor: '#0D1117' }}>
        {event ? 'Edit Event' : 'Create Event'}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#0D1117' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F0F6FC',
                    '& fieldset': { borderColor: '#30363D' },
                    '&:hover fieldset': { borderColor: '#00D4AA' },
                  },
                  '& .MuiInputLabel-root': { color: '#8B949E' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F0F6FC',
                    '& fieldset': { borderColor: '#30363D' },
                    '&:hover fieldset': { borderColor: '#00D4AA' },
                  },
                  '& .MuiInputLabel-root': { color: '#8B949E' },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F0F6FC',
                    '& fieldset': { borderColor: '#30363D' },
                    '&:hover fieldset': { borderColor: '#00D4AA' },
                  },
                  '& .MuiInputLabel-root': { color: '#8B949E' },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#F0F6FC',
                    '& fieldset': { borderColor: '#30363D' },
                    '&:hover fieldset': { borderColor: '#00D4AA' },
                  },
                  '& .MuiInputLabel-root': { color: '#8B949E' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#8B949E' }}>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  sx={{
                    color: '#F0F6FC',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363D' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00D4AA' },
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#0D1117' }}>
        <Button onClick={onClose} sx={{ color: '#8B949E' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#00D4AA',
            '&:hover': { backgroundColor: '#00B894' },
          }}
        >
          {event ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedCalendar;
