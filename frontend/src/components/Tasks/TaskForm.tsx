import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Plus,
  Minus,
  ChevronDown,
  Save,
} from 'lucide-react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskRequest | UpdateTaskRequest) => void;
  task?: Task;
  loading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`task-tabpanel-${index}`}
    aria-labelledby={`task-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSubmit,
  task,
  loading = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    name: '',
    description: '',
    task_type: 'http_request',
    schedule_type: 'cron',
    cron_expression: '',
    interval_seconds: 60,
    timezone: 'America/New_York',
    http_method: 'GET',
    url: '',
    headers: {},
    query_params: {},
    request_body: '',
    timeout_seconds: 30,
    auth_type: 'none',
    max_retries: 3,
    retry_delay_seconds: 60,
    concurrent_executions: 1,
    tags: [],
  });

  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        task_type: task.task_type,
        schedule_type: task.schedule_type,
        cron_expression: task.cron_expression || '',
        interval_seconds: task.interval_seconds || 60,
        timezone: task.timezone,
        http_method: task.http_method,
        url: task.url,
        headers: task.headers || {},
        query_params: task.query_params || {},
        request_body: task.request_body || '',
        timeout_seconds: task.timeout_seconds,
        auth_type: task.auth_type,
        auth_token: task.auth_token,
        auth_username: task.auth_username,
        auth_password: task.auth_password,
        auth_api_key: task.auth_api_key,
        max_retries: task.max_retries,
        retry_delay_seconds: task.retry_delay_seconds,
        concurrent_executions: task.concurrent_executions,
        tags: task.tags || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        task_type: 'http_request',
        schedule_type: 'cron',
        cron_expression: '',
        interval_seconds: 60,
        timezone: 'America/New_York',
        http_method: 'GET',
        url: '',
        headers: {},
        query_params: {},
        request_body: '',
        timeout_seconds: 30,
        auth_type: 'none',
        max_retries: 3,
        retry_delay_seconds: 60,
        concurrent_executions: 1,
        tags: [],
      });
    }
  }, [task]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHeader = () => {
    if (headerKey && headerValue) {
      setFormData(prev => ({
        ...prev,
        headers: { ...prev.headers, [headerKey]: headerValue },
      }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const handleRemoveHeader = (key: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const handleAddParam = () => {
    if (paramKey && paramValue) {
      setFormData(prev => ({
        ...prev,
        query_params: { ...prev.query_params, [paramKey]: paramValue },
      }));
      setParamKey('');
      setParamValue('');
    }
  };

  const handleRemoveParam = (key: string) => {
    setFormData(prev => {
      const newParams = { ...prev.query_params };
      delete newParams[key];
      return { ...prev, query_params: newParams };
    });
  };

  const handleAddTag = () => {
    if (newTag && formData.tags && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag),
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #30363D', 
        pb: 2,
        color: '#F0F6FC', 
        fontWeight: 600,
        fontSize: '1.25rem'
      }}>
        {task ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: '1px solid #30363D' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: '#8B949E',
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#00D4AA',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00D4AA',
              },
            }}
          >
            <Tab label="Basic Info" />
            <Tab label="Schedule" />
            <Tab label="Request" />
            <Tab label="Authentication" />
            <Tab label="Advanced" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={formData.task_type}
                  onChange={(e) => handleChange('task_type', e.target.value)}
                  label="Task Type"
                  sx={{
                    backgroundColor: '#0D1117',
                  }}
                >
                  <MenuItem value="http_request">HTTP Request</MenuItem>
                  <MenuItem value="data_sync">Data Sync</MenuItem>
                  <MenuItem value="market_scan">Market Scan</MenuItem>
                  <MenuItem value="alert_check">Alert Check</MenuItem>
                  <MenuItem value="custom_script">Custom Script</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddTag} size="small">
                      <Plus size={16} />
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(formData.tags || []).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    sx={{
                      backgroundColor: '#00D4AA20',
                      color: '#00D4AA',
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={formData.schedule_type}
                  onChange={(e) => handleChange('schedule_type', e.target.value)}
                  label="Schedule Type"
                  sx={{
                    backgroundColor: '#0D1117',
                  }}
                >
                  <MenuItem value="cron">Cron Expression</MenuItem>
                  <MenuItem value="interval">Interval</MenuItem>
                  <MenuItem value="once">One Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timezone"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            {formData.schedule_type === 'cron' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cron Expression"
                  value={formData.cron_expression}
                  onChange={(e) => handleChange('cron_expression', e.target.value)}
                  placeholder="0 9 * * 1-5"
                  helperText="Format: minute hour day month day-of-week"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0D1117',
                    },
                  }}
                />
              </Grid>
            )}
            {formData.schedule_type === 'interval' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interval (seconds)"
                  type="number"
                  value={formData.interval_seconds}
                  onChange={(e) => handleChange('interval_seconds', parseInt(e.target.value))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0D1117',
                    },
                  }}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>HTTP Method</InputLabel>
                <Select
                  value={formData.http_method}
                  onChange={(e) => handleChange('http_method', e.target.value)}
                  label="HTTP Method"
                  sx={{
                    backgroundColor: '#0D1117',
                  }}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="HEAD">HEAD</MenuItem>
                  <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={formData.timeout_seconds}
                onChange={(e) => handleChange('timeout_seconds', parseInt(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Accordion sx={{ backgroundColor: '#0D1117' }}>
                <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                  <Typography>Headers</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Key"
                      value={headerKey}
                      onChange={(e) => setHeaderKey(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      value={headerValue}
                      onChange={(e) => setHeaderValue(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button onClick={handleAddHeader} variant="outlined" size="small">
                      <Plus size={16} />
                    </Button>
                  </Box>
                  {Object.entries(formData.headers || {}).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={`${key}: ${value}`} size="small" />
                      <IconButton onClick={() => handleRemoveHeader(key)} size="small">
                        <Minus size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid item xs={12}>
              <Accordion sx={{ backgroundColor: '#0D1117' }}>
                <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                  <Typography>Query Parameters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Key"
                      value={paramKey}
                      onChange={(e) => setParamKey(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      value={paramValue}
                      onChange={(e) => setParamValue(e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button onClick={handleAddParam} variant="outlined" size="small">
                      <Plus size={16} />
                    </Button>
                  </Box>
                  {Object.entries(formData.query_params || {}).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={`${key}: ${value}`} size="small" />
                      <IconButton onClick={() => handleRemoveParam(key)} size="small">
                        <Minus size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>
            {['POST', 'PUT', 'PATCH'].includes(formData.http_method) && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Request Body"
                  value={formData.request_body}
                  onChange={(e) => handleChange('request_body', e.target.value)}
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0D1117',
                    },
                  }}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Authentication Type</InputLabel>
                <Select
                  value={formData.auth_type}
                  onChange={(e) => handleChange('auth_type', e.target.value)}
                  label="Authentication Type"
                  sx={{
                    backgroundColor: '#0D1117',
                  }}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="api_key">API Key</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.auth_type === 'bearer' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bearer Token"
                  type="password"
                  value={formData.auth_token || ''}
                  onChange={(e) => handleChange('auth_token', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0D1117',
                    },
                  }}
                />
              </Grid>
            )}
            {formData.auth_type === 'basic' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.auth_username || ''}
                    onChange={(e) => handleChange('auth_username', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#0D1117',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.auth_password || ''}
                    onChange={(e) => handleChange('auth_password', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#0D1117',
                      },
                    }}
                  />
                </Grid>
              </>
            )}
            {formData.auth_type === 'api_key' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={formData.auth_api_key || ''}
                  onChange={(e) => handleChange('auth_api_key', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0D1117',
                    },
                  }}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Retries"
                type="number"
                value={formData.max_retries}
                onChange={(e) => handleChange('max_retries', parseInt(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Retry Delay (seconds)"
                type="number"
                value={formData.retry_delay_seconds}
                onChange={(e) => handleChange('retry_delay_seconds', parseInt(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Concurrent Executions"
                type="number"
                value={formData.concurrent_executions}
                onChange={(e) => handleChange('concurrent_executions', parseInt(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0D1117',
                  },
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #30363D' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#30363D',
            color: '#8B949E',
            '&:hover': {
              borderColor: '#6E7681',
              backgroundColor: '#30363D20',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<Save size={16} />}
          sx={{
            backgroundColor: '#00D4AA',
            '&:hover': {
              backgroundColor: '#00B894',
            },
          }}
        >
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
