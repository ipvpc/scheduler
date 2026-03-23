import React, { useState } from 'react';
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
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, addDays, isSameDay, isSameMonth, isToday } from 'date-fns';

interface BasicCalendarProps {
  events: any[];
  onEventCreate: (event: any) => void;
  onEventUpdate: (id: string, event: any) => void;
  onEventDelete: (id: string) => void;
  loading?: boolean;
}

const BasicCalendar: React.FC<BasicCalendarProps> = ({
  events,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  loading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const renderCalendar = () => {
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
            
            {dayEvents.slice(0, 2).map((event, index) => (
              <Chip
                key={event.id}
                label={event.title}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  height: 20,
                  mb: 0.5,
                  backgroundColor: event.status === 'active' ? '#00D4AA' : '#8B949E',
                  color: '#0A0E13',
                  fontWeight: 600,
                  display: 'block',
                  textAlign: 'left',
                }}
              />
            ))}
            
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ color: '#F0F6FC', fontWeight: 700 }}>
            Calendar
          </Typography>
          <Chip
            label={`${events.length} events`}
            sx={{
              backgroundColor: '#00D4AA',
              color: '#0A0E13',
              fontWeight: 600,
            }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => onEventCreate({
            title: 'New Event',
            description: '',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            status: 'active'
          })}
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

      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigateMonth('prev')}
            sx={{ color: '#F0F6FC' }}
          >
            <ChevronLeft size={24} />
          </IconButton>
          
          <Typography variant="h5" sx={{ color: '#F0F6FC', fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          
          <IconButton
            onClick={() => navigateMonth('next')}
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

      {/* Calendar Grid */}
      <Paper
        sx={{
          flex: 1,
          backgroundColor: '#0D1117',
          border: '1px solid #30363D',
          overflow: 'hidden',
        }}
      >
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
          {renderCalendar()}
        </Grid>
      </Paper>
    </Box>
  );
};

export default BasicCalendar;
