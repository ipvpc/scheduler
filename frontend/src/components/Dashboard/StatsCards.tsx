import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { TaskStats } from '../../types';

interface StatsCardsProps {
  stats: TaskStats | null;
  loading?: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <Card
    sx={{
      background: 'linear-gradient(135deg, #161B22 0%, #0D1117 100%)',
      border: '1px solid #30363D',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0, 212, 170, 0.15)',
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Chip
            icon={trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
            size="small"
            sx={{
              backgroundColor: trend.isPositive ? '#00B89420' : '#E1705520',
              color: trend.isPositive ? '#00B894' : '#E17055',
              fontWeight: 600,
            }}
          />
        )}
      </Box>
      
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#F0F6FC' }}>
        {value}
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#8B949E', mb: 1 }}>
        {title}
      </Typography>
      
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#6E7681' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ background: '#161B22', border: '1px solid #30363D' }}>
              <CardContent sx={{ p: 3 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#8B949E' }}>
                  Loading...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const successRate = stats.total_executions > 0 
    ? ((stats.successful_executions / stats.total_executions) * 100).toFixed(1)
    : 0;

  const failureRate = stats.total_executions > 0 
    ? ((stats.failed_executions / stats.total_executions) * 100).toFixed(1)
    : '0';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <StatCard
          title="Total Tasks"
          value={stats.total_tasks}
          icon={<Clock size={24} />}
          color="#00D4AA"
          trend={{
            value: 12,
            isPositive: true,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <StatCard
          title="Active Tasks"
          value={stats.active_tasks}
          icon={<CheckCircle size={24} />}
          color="#00B894"
          subtitle={`${((stats.active_tasks / stats.total_tasks) * 100).toFixed(1)}% of total`}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={<TrendingUp size={24} />}
          color="#00B894"
          subtitle={`${stats.successful_executions} successful`}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <StatCard
          title="Failed Tasks"
          value={stats.failed_executions}
          icon={<AlertCircle size={24} />}
          color="#E17055"
          trend={{
            value: parseFloat(failureRate),
            isPositive: false,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <StatCard
          title="Avg Duration"
          value={stats.average_execution_time ? `${stats.average_execution_time.toFixed(2)}s` : 'N/A'}
          icon={<Timer size={24} />}
          color="#74B9FF"
          subtitle="Execution time"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <StatCard
          title="24h Executions"
          value={stats.last_24h_executions}
          icon={<Clock size={24} />}
          color="#6C5CE7"
          subtitle={`${stats.last_7d_executions} in 7 days`}
        />
      </Grid>
    </Grid>
  );
};

export default StatsCards;
