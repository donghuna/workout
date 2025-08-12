import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarMonthIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  workoutTypes, 
  getWorkoutDataByType,
  getWorkoutStats 
} from '../data/workoutData';

const WorkoutDetailView = ({ selectedWorkoutType, onBack }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('line');
  const [workoutData, setWorkoutData] = useState({});
  const [loading, setLoading] = useState(true);

  // 선택된 운동 타입 정보
  const workoutInfo = workoutTypes[selectedWorkoutType];

  // 해당 운동 데이터 로드
  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        const data = await getWorkoutDataByType(selectedWorkoutType);
        setWorkoutData(data);
      } catch (error) {
        console.error('운동 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, [selectedWorkoutType]);

  // 해당 운동을 한 날짜들 찾기
  const workoutDates = useMemo(() => {
    const dates = [];
    Object.entries(workoutData).forEach(([date, workouts]) => {
      workouts.forEach(workout => {
        if (workout.type === selectedWorkoutType) {
          dates.push({
            date: new Date(date),
            workout: workout
          });
        }
      });
    });
    return dates.sort((a, b) => a.date - b.date);
  }, [workoutData, selectedWorkoutType]);

  // 월별 데이터 생성
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthWorkouts = workoutDates.filter(item => 
        item.date.getMonth() === i && item.date.getFullYear() === currentYear
      );
      
      months.push({
        month: `${i + 1}월`,
        count: monthWorkouts.length,
        duration: monthWorkouts.reduce((sum, item) => sum + (item.workout.duration || 0), 0),
        distance: monthWorkouts.reduce((sum, item) => sum + (item.workout.distance || 0), 0),
        sets: monthWorkouts.reduce((sum, item) => sum + (item.workout.sets || 0), 0),
        reps: monthWorkouts.reduce((sum, item) => sum + (item.workout.reps || 0), 0)
      });
    }
    return months;
  }, [workoutDates, currentYear]);

  // 주별 데이터 생성
  const weeklyData = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd });
    
    return weeks.map((week, index) => {
      const weekWorkouts = workoutDates.filter(item => {
        const itemDate = item.date;
        const weekStart = startOfWeek(week);
        const weekEnd = endOfWeek(week);
        return itemDate >= weekStart && itemDate <= weekEnd;
      });
      
      return {
        week: `주 ${index + 1}`,
        count: weekWorkouts.length,
        duration: weekWorkouts.reduce((sum, item) => sum + (item.workout.duration || 0), 0),
        distance: weekWorkouts.reduce((sum, item) => sum + (item.workout.distance || 0), 0)
      };
    });
  }, [workoutDates, currentYear]);

  // 운동 기록을 차트 데이터로 변환
  const chartData = useMemo(() => {
    return workoutDates.map((item, index) => ({
      name: format(item.date, 'M/d'),
      date: format(item.date, 'yyyy-MM-dd'),
      duration: item.workout.duration || 0,
      distance: item.workout.distance || 0,
      sets: item.workout.sets || 0,
      reps: item.workout.reps || 0,
      intensity: (item.workout.duration || 0) + (item.workout.distance || 0) * 10 + (item.workout.sets || 0) * 5 + (item.workout.reps || 0) * 0.1
    }));
  }, [workoutDates]);

  // 특정 날짜에 해당 운동을 했는지 확인
  const hasWorkoutOnDate = (date) => {
    return workoutDates.some(item => isSameDay(item.date, date));
  };

  // 특정 날짜의 운동 정보 가져오기
  const getWorkoutOnDate = (date) => {
    return workoutDates.find(item => isSameDay(item.date, date))?.workout;
  };

  // 월별 달력 데이터 생성
  const monthlyCalendars = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const days = eachDayOfInterval({ start, end });
      
      // 첫 주의 시작 부분에 빈 칸 추가
      const firstDayOfWeek = getDay(start);
      const emptyDays = Array(firstDayOfWeek).fill(null);
      
      return {
        month,
        days: [...emptyDays, ...days]
      };
    });
  }, [currentYear]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalWorkouts = workoutDates.length;
    const totalDuration = workoutDates.reduce((sum, item) => sum + (item.workout.duration || 0), 0);
    const totalDistance = workoutDates.reduce((sum, item) => sum + (item.workout.distance || 0), 0);
    const totalSets = workoutDates.reduce((sum, item) => sum + (item.workout.sets || 0), 0);
    const totalReps = workoutDates.reduce((sum, item) => sum + (item.workout.reps || 0), 0);
    
    return {
      totalWorkouts,
      totalDuration,
      totalDistance,
      totalSets,
      totalReps
    };
  }, [workoutDates]);

  // 차트 타입 변경 핸들러
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // 차트 색상
  const chartColors = [workoutInfo.color, '#8884d8', '#82ca9d', '#ffc658'];

  // 차트 렌더링
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke={workoutInfo.color} 
                strokeWidth={2}
                name="운동 강도"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={workoutInfo.color} name="운동 횟수" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="duration" 
                stackId="1"
                stroke={workoutInfo.color} 
                fill={workoutInfo.color + '40'} 
                name="운동 시간"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = [
          { name: '운동 시간', value: stats.totalDuration },
          { name: '운동 거리', value: stats.totalDistance * 10 },
          { name: '운동 세트', value: stats.totalSets * 5 },
          { name: '운동 횟수', value: stats.totalReps * 0.1 }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          {workoutInfo.label} 데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={onBack} size="large">
          <ArrowBackIcon />
        </IconButton>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h3" component="h1" color="primary">
            {workoutInfo.emoji}
          </Typography>
          <Typography variant="h3" component="h1" color="primary">
            {workoutInfo.label} 상세 기록
          </Typography>
        </Box>
      </Box>

      {/* 통계 카드 */}
              <Grid container spacing={1} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {stats.totalWorkouts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              총 운동 횟수
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {stats.totalDuration}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              총 시간 (분)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {stats.totalDistance}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              총 거리 (km)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {stats.totalSets + stats.totalReps}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              총 세트/횟수
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 월별 달력 그리드 */}
      <Typography variant="h5" gutterBottom>
        📅 {currentYear}년 {workoutInfo.label} 운동 기록
      </Typography>
      
      <Grid container spacing={2} mb={4}>
        {monthlyCalendars.map((monthData, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom textAlign="center" fontWeight="bold">
                  {format(monthData.month, 'M월')}
                </Typography>
                
                {/* 요일 헤더 */}
                <Grid container spacing={0.5} mb={1}>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <Grid item xs key={day}>
                      <Box
                        sx={{
                          p: 0.5,
                          textAlign: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          color: day === '일' ? 'error.main' : day === '토' ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        {day}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* 달력 그리드 */}
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 0.5
                  }}
                >
                  {monthData.days.map((day, dayIndex) => {
                    const hasWorkout = day && hasWorkoutOnDate(day);
                    const workout = hasWorkout ? getWorkoutOnDate(day) : null;
                    const isCurrentMonth = day && isSameMonth(day, monthData.month);

                    return (
                      <Box
                        key={dayIndex}
                        sx={{
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: hasWorkout ? 'bold' : 'normal',
                          color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                          backgroundColor: hasWorkout ? (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200' : 'transparent',
                          border: hasWorkout ? 1 : 0,
                          borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
                          borderRadius: 1,
                          cursor: hasWorkout ? 'pointer' : 'default',
                          '&:hover': hasWorkout ? {
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                            color: 'text.primary',
                            transform: 'scale(1.1)',
                            transition: 'all 0.2s'
                          } : {}
                        }}
                        title={hasWorkout ? `${format(day, 'M월 d일')} - ${workoutInfo.label}` : ''}
                      >
                        {day ? format(day, 'd') : ''}
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 차트 섹션 */}
      <Box mt={4}>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5">
            📊 {workoutInfo.label} 운동 분석
          </Typography>
          
          {/* 차트 타입 선택 */}
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
            aria-label="chart type"
          >
            <ToggleButton value="line" aria-label="line chart">
              <ShowChartIcon sx={{ mr: 1, fontSize: '1rem' }} />
              선형
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              <BarChartIcon sx={{ mr: 1, fontSize: '1rem' }} />
              막대
            </ToggleButton>
            <ToggleButton value="area" aria-label="area chart">
              <ShowChartIcon sx={{ mr: 1, fontSize: '1rem' }} />
              영역
            </ToggleButton>
            <ToggleButton value="pie" aria-label="pie chart">
              <PieChartIcon sx={{ mr: 1, fontSize: '1rem' }} />
              파이
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Card sx={{ p: 2 }}>
          {renderChart()}
        </Card>
      </Box>
    </Box>
  );
};

export default WorkoutDetailView; 