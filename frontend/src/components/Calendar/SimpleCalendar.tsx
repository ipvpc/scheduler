import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface SimpleCalendarProps {
  events: any[];
  onEventCreate: (event: any) => void;
  onEventUpdate: (id: string, event: any) => void;
  onEventDelete: (id: string) => void;
  loading?: boolean;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  events,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  loading = false,
}) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ color: '#F0F6FC', fontWeight: 700, mb: 3 }}>
        Calendar
      </Typography>
      
      <Paper
        sx={{
          flex: 1,
          backgroundColor: '#0D1117',
          border: '1px solid #30363D',
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#F0F6FC', mb: 2 }}>
            Calendar View
          </Typography>
          <Typography variant="body1" sx={{ color: '#8B949E' }}>
            Events: {events.length}
          </Typography>
          <Typography variant="body2" sx={{ color: '#8B949E', mt: 1 }}>
            Loading: {loading ? 'Yes' : 'No'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SimpleCalendar;
