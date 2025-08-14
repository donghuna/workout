import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import WorkoutCalendar from './components/WorkoutCalendar';
import WorkoutDetailView from './components/WorkoutDetailView';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            borderColor: darkMode ? '#404040' : '#e0e0e0',
          },
        },
      },
    },
  }), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleWorkoutClick = (date, workout) => {
    setSelectedWorkout(workout.type);
  };

  const handleBackFromDetail = () => {
    setSelectedWorkout(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Tooltip title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'} arrow>
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                color: darkMode ? '#fff' : '#000',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
              size="large"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            {selectedWorkout ? (
              <WorkoutDetailView
                selectedWorkoutType={selectedWorkout}
                onBack={handleBackFromDetail}
              />
            ) : (
              <WorkoutCalendar
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onWorkoutClick={handleWorkoutClick}
              />
            )}
          </Paper>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 