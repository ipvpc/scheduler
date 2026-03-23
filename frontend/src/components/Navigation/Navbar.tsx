import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Button,
  Chip,
} from '@mui/material';
import {
  Activity,
  Settings,
  BarChart3,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  RefreshCw,
  Database,
  Calendar as CalendarIcon,
  List,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface NavbarProps {
  currentTab: number;
  onTabChange: (tab: number) => void;
  onRefresh: () => void;
  stats?: {
    total_tasks: number;
    active_tasks: number;
    total_executions: number;
  };
}

const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onRefresh,
  stats,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navigationItems = [
    {
      id: 0,
      label: 'Dashboard',
      icon: <List size={20} />,
      description: 'Task Management',
    },
    {
      id: 1,
      label: 'Calendar',
      icon: <CalendarIcon size={20} />,
      description: 'Schedule Events',
    },
    {
      id: 2,
      label: 'Analytics',
      icon: <TrendingUp size={20} />,
      description: 'Performance Metrics',
    },
    {
      id: 3,
      label: 'Monitoring',
      icon: <Clock size={20} />,
      description: 'System Health',
    },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#0A0E13',
        borderBottom: '1px solid #30363D',
        boxShadow: 'none',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Activity size={32} color="#00D4AA" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F0F6FC' }}>
              Alpha5 Scheduler
            </Typography>
          </Box>
          
          {/* Status Indicator */}
          <Chip
            label="Live"
            size="small"
            sx={{
              backgroundColor: '#00D4AA',
              color: '#0A0E13',
              fontWeight: 600,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 },
              },
            }}
          />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
          {navigationItems.map((item) => (
            <Tooltip key={item.id} title={item.description} placement="bottom">
              <Button
                onClick={() => onTabChange(item.id)}
                startIcon={item.icon}
                sx={{
                  color: currentTab === item.id ? '#00D4AA' : '#8B949E',
                  backgroundColor: currentTab === item.id ? '#00D4AA20' : 'transparent',
                  border: currentTab === item.id ? '1px solid #00D4AA' : '1px solid transparent',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: currentTab === item.id ? '#00D4AA30' : '#161B22',
                    color: '#00D4AA',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 212, 170, 0.15)',
                  },
                }}
              >
                {item.label}
              </Button>
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Stats Display */}
        {stats && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Tooltip title="Total Tasks">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Database size={16} color="#8B949E" />
                <Typography variant="body2" sx={{ color: '#8B949E' }}>
                  {stats.total_tasks}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Active Tasks">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Activity size={16} color="#00D4AA" />
                <Typography variant="body2" sx={{ color: '#00D4AA' }}>
                  {stats.active_tasks}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Total Executions">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart3 size={16} color="#8B949E" />
                <Typography variant="body2" sx={{ color: '#8B949E' }}>
                  {stats.total_executions}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Refresh Button */}
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={onRefresh}
              sx={{
                color: '#8B949E',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#00D4AA',
                  backgroundColor: '#00D4AA20',
                  transform: 'rotate(180deg)',
                },
              }}
            >
              <RefreshCw size={20} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationsOpen}
              sx={{
                color: '#8B949E',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#00D4AA',
                  backgroundColor: '#00D4AA20',
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                color: '#8B949E',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#00D4AA',
                  backgroundColor: '#00D4AA20',
                },
              }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              onClick={handleSettingsOpen}
              sx={{
                color: '#8B949E',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#00D4AA',
                  backgroundColor: '#00D4AA20',
                },
              }}
            >
              <Settings size={20} />
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="User Menu">
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: '#8B949E',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#00D4AA',
                  backgroundColor: '#00D4AA20',
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, backgroundColor: '#00D4AA', color: '#0A0E13' }}>
                <User size={16} />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: '#0D1117',
              border: '1px solid #30363D',
              borderRadius: 2,
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={handleMenuClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <User size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <Settings size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText>Account Settings</ListItemText>
          </MenuItem>
          <Divider sx={{ borderColor: '#30363D' }} />
          <MenuItem onClick={handleMenuClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <LogOut size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText>Sign Out</ListItemText>
          </MenuItem>
        </Menu>

        {/* Settings Menu */}
        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={handleSettingsClose}
          PaperProps={{
            sx: {
              backgroundColor: '#0D1117',
              border: '1px solid #30363D',
              borderRadius: 2,
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={handleSettingsClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <Database size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText>Database Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <BarChart3 size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText>Analytics Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <Bell size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText>Notification Settings</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              backgroundColor: '#0D1117',
              border: '1px solid #30363D',
              borderRadius: 2,
              mt: 1,
              minWidth: 300,
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #30363D' }}>
            <Typography variant="h6" sx={{ color: '#F0F6FC' }}>
              Notifications
            </Typography>
          </Box>
          <MenuItem onClick={handleNotificationsClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <Activity size={16} color="#00D4AA" />
            </ListItemIcon>
            <ListItemText 
              primary="Task Completed"
              secondary="Market data sync finished successfully"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <Bell size={16} color="#FFA500" />
            </ListItemIcon>
            <ListItemText 
              primary="System Alert"
              secondary="High memory usage detected"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose} sx={{ color: '#F0F6FC' }}>
            <ListItemIcon>
              <CalendarIcon size={16} color="#8B949E" />
            </ListItemIcon>
            <ListItemText 
              primary="Scheduled Event"
              secondary="Weekly report generation in 2 hours"
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
