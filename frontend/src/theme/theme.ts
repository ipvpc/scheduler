import { createTheme } from '@mui/material/styles';

// Hedge fund color palette
const colors = {
  primary: {
    main: '#00D4AA', // Teal green
    dark: '#00B894',
    light: '#55EFC4',
  },
  secondary: {
    main: '#6C5CE7', // Purple
    dark: '#5A4FCF',
    light: '#A29BFE',
  },
  success: {
    main: '#00B894',
    dark: '#00A085',
    light: '#55EFC4',
  },
  error: {
    main: '#E17055',
    dark: '#D63031',
    light: '#FDCB6E',
  },
  warning: {
    main: '#FDCB6E',
    dark: '#E17055',
    light: '#FDCB6E',
  },
  info: {
    main: '#74B9FF',
    dark: '#0984E3',
    light: '#A29BFE',
  },
  background: {
    default: '#0D1117', // GitHub dark
    paper: '#161B22',
    dark: '#0A0E13',
  },
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    disabled: '#6E7681',
  },
  divider: '#30363D',
  border: '#30363D',
};

export const hedgeFundTheme = createTheme({
  palette: {
    mode: 'dark',
    ...colors,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.default,
          color: colors.text.primary,
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.divider} ${colors.background.paper}`,
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: colors.background.paper,
        },
        '*::-webkit-scrollbar-thumb': {
          background: colors.divider,
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: colors.text.secondary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.background.default,
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border}`,
        },
        indicator: {
          backgroundColor: colors.primary.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: colors.primary.main,
          },
        },
      },
    },
  },
});

export default hedgeFundTheme;
