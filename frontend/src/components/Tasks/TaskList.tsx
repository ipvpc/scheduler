import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  MoreVertical,
  Play,
  Pause,
  Square,
  Edit,
  Delete,
  Eye,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Task } from '../../types';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onTaskAction: (action: string, taskId: number) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onTaskAction,
  onEditTask,
  onViewTask,
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#00B894';
      case 'inactive':
        return '#6E7681';
      case 'paused':
        return '#FDCB6E';
      case 'error':
        return '#E17055';
      default:
        return '#6E7681';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'http_request':
        return '#74B9FF';
      case 'data_sync':
        return '#00D4AA';
      case 'market_scan':
        return '#6C5CE7';
      case 'alert_check':
        return '#FDCB6E';
      case 'custom_script':
        return '#A29BFE';
      default:
        return '#6E7681';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleAction = (action: string) => {
    if (selectedTask) {
      onTaskAction(action, selectedTask.id);
    }
    handleMenuClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Task Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#F0F6FC' }}>
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" sx={{ color: '#8B949E' }}>
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: `${getStatusColor(params.value)}20`,
            color: getStatusColor(params.value),
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'task_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          sx={{
            backgroundColor: `${getTaskTypeColor(params.value)}20`,
            color: getTaskTypeColor(params.value),
            fontWeight: 500,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'schedule_type',
      headerName: 'Clock',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Clock size={16} color="#8B949E" />
          <Typography variant="body2" sx={{ color: '#8B949E', textTransform: 'capitalize' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'url',
      headerName: 'URL',
      width: 250,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: '#8B949E',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#8B949E' }}>
          {format(new Date(params.value), 'MMM dd, yyyy')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Details">
              <Eye size={16} />
            </Tooltip>
          }
          label="View"
          onClick={() => onViewTask(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit Task">
              <Edit size={16} />
            </Tooltip>
          }
          label="Edit"
          onClick={() => onEditTask(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="More Actions">
              <MoreVertical size={16} />
            </Tooltip>
          }
          label="More"
          onClick={(event) => handleMenuOpen(event, params.row)}
        />,
      ],
    },
  ];

  return (
    <Card
      sx={{
        background: '#161B22',
        border: '1px solid #30363D',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #30363D' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#F0F6FC' }}>
              Clockd Tasks
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={() => onTaskAction('refresh', 0)}
                  sx={{ color: '#8B949E' }}
                >
                  <RotateCcw size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={tasks}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection as number[]);
            }}
            rowSelectionModel={selectedRows}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #30363D',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#0A0E13',
                borderBottom: '2px solid #30363D',
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: '#00D4AA10',
                },
                '&.Mui-selected': {
                  backgroundColor: '#00D4AA20',
                  '&:hover': {
                    backgroundColor: '#00D4AA30',
                  },
                },
              },
              '& .MuiDataGrid-toolbar': {
                backgroundColor: '#0A0E13',
                borderBottom: '1px solid #30363D',
              },
            }}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Box>

        {selectedRows.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #30363D',
              backgroundColor: '#0A0E13',
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#8B949E', mr: 2 }}>
              {selectedRows.length} selected
            </Typography>
            <IconButton
              size="small"
              onClick={() => onTaskAction('bulk_start', selectedRows[0])}
              sx={{ color: '#00B894' }}
            >
              <Play size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onTaskAction('bulk_stop', selectedRows[0])}
              sx={{ color: '#E17055' }}
            >
              <Square size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onTaskAction('bulk_pause', selectedRows[0])}
              sx={{ color: '#FDCB6E' }}
            >
              <Pause size={16} />
            </IconButton>
          </Box>
        )}
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#161B22',
            border: '1px solid #30363D',
            borderRadius: '8px',
          },
        }}
      >
        <MenuItem onClick={() => handleAction('start')} sx={{ color: '#F0F6FC' }}>
          <Play size={16} style={{ marginRight: 8 }} />
          Start
        </MenuItem>
        <MenuItem onClick={() => handleAction('stop')} sx={{ color: '#F0F6FC' }}>
          <Square size={16} style={{ marginRight: 8 }} />
          Square
        </MenuItem>
        <MenuItem onClick={() => handleAction('pause')} sx={{ color: '#F0F6FC' }}>
          <Pause size={16} style={{ marginRight: 8 }} />
          Pause
        </MenuItem>
        <MenuItem onClick={() => handleAction('execute')} sx={{ color: '#F0F6FC' }}>
          <Clock size={16} style={{ marginRight: 8 }} />
          Execute Now
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')} sx={{ color: '#F0F6FC' }}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#E17055' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskList;
