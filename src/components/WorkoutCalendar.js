import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Divider,
  Modal,
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarMonth as CalendarMonthIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  Add as AddIcon
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  setMonth,
  setYear,
  startOfYear,
  endOfYear,
  eachMonthOfInterval
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  workoutTypes, 
  getWorkoutData, 
  getWorkoutDataByDate,
  getWorkoutStats 
} from '../data/workoutData';

const WorkoutCalendar = ({ currentDate, onDateChange, onWorkoutClick, onAddWorkout }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [workoutData, setWorkoutData] = useState({});
  const [loading, setLoading] = useState(true);

  // 운동 데이터 로드
  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        const data = await getWorkoutData();
        setWorkoutData(data);
      } catch (error) {
        console.error('운동 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, []);

  // 현재 월의 모든 날짜 계산
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfWeek = getDay(start);
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return [...emptyDays, ...days];
  }, [currentDate]);

  // 연도별 월 데이터 계산
  const yearData = useMemo(() => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return months.map(month => {
      const monthKey = format(month, 'yyyy-MM');
      const monthWorkouts = Object.entries(workoutData)
        .filter(([date]) => date.startsWith(monthKey))
        .flatMap(([, workouts]) => workouts);
      
      const workoutStats = {};
      monthWorkouts.forEach(workout => {
        if (!workoutStats[workout.type]) {
          workoutStats[workout.type] = {
            count: 0,
            totalDuration: 0,
            totalDistance: 0,
            totalSets: 0,
            totalReps: 0
          };
        }
        workoutStats[workout.type].count++;
        if (workout.duration) workoutStats[workout.type].totalDuration += workout.duration;
        if (workout.distance) workoutStats[workout.type].totalDistance += workout.distance;
        if (workout.sets) workoutStats[workout.type].totalSets += workout.sets;
        if (workout.reps) workoutStats[workout.type].totalReps += workout.reps;
      });
      
      return {
        month,
        workouts: monthWorkouts,
        stats: workoutStats,
        totalWorkouts: monthWorkouts.length,
        totalDays: Object.keys(workoutData).filter(date => date.startsWith(monthKey)).length
      };
    });
  }, [currentDate, workoutData]);

  // 이전/다음 월 이동
  const handlePrevMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  // 월 선택 핸들러
  const handleMonthChange = (month) => {
    const newDate = setMonth(currentDate, month);
    onDateChange(newDate);
    setMonthMenuOpen(false);
  };

  // 년도 선택 핸들러
  const handleYearChange = (year) => {
    const newDate = setYear(currentDate, year);
    onDateChange(newDate);
    setYearMenuOpen(false);
  };

  // 특정 날짜의 운동 데이터 가져오기
  const getWorkoutsForDate = (date) => {
    if (!date) return [];
    const dateKey = format(date, 'yyyy-MM-dd');
    return workoutData[dateKey] || [];
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    if (date) {
      // 이미 선택된 날짜를 다시 클릭하면 선택 해제
      if (selectedDate && isSameDay(selectedDate, date)) {
        setSelectedDate(null);
      } else {
        setSelectedDate(date);
      }
    }
  };

  // 뷰 모드 변경 핸들러
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // 월 이름 배열
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  // 년도 배열 (현재 년도 기준 전후 10년)
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // 모달 스타일
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    outline: 'none',
  };

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          운동 데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  // 연별 뷰 렌더링
  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    const monthlyGroups = [];
    for (let i = 0; i < 12; i++) {
      const monthDays = allDays.filter(day => day.getMonth() === i);
      const monthWorkouts = Object.entries(workoutData)
        .filter(([date]) => date.startsWith(format(monthDays[0], 'yyyy-MM')))
        .flatMap(([, workouts]) => workouts);
      
      const monthStats = {
        totalWorkouts: monthWorkouts.length,
        totalDays: Object.keys(workoutData).filter(date => date.startsWith(format(monthDays[0], 'yyyy-MM'))).length,
        workoutTypes: {}
      };
      
      monthWorkouts.forEach(workout => {
        if (!monthStats.workoutTypes[workout.type]) {
          monthStats.workoutTypes[workout.type] = 0;
        }
        monthStats.workoutTypes[workout.type]++;
      });
      
      monthlyGroups.push({
        month: monthDays[0],
        days: monthDays,
        stats: monthStats
      });
    }

    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box flex={1} />
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                }
              }}
              onClick={() => setYearMenuOpen(true)}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                {format(currentDate, 'yyyy')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'medium'
                }}
              >
                년
              </Typography>
              <KeyboardArrowDownIcon 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1.2rem'
                }} 
              />
            </Box>
          </Box>
          <Box flex={1} />
        </Box>
        
        <Grid container spacing={2}>
          {monthlyGroups.map((monthData, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom textAlign="center" fontWeight="bold">
                    {format(monthData.month, 'M월')}
                  </Typography>
                  
                  {monthData.stats.totalWorkouts > 0 && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 1, 
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" textAlign="center" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                        운동일: {monthData.stats.totalDays}일 / 총 운동: {monthData.stats.totalWorkouts}회
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.3, justifyContent: 'center' }}>
                        {Object.entries(monthData.stats.workoutTypes).map(([type, count]) => (
                          <Tooltip key={type} title={`${workoutTypes[type].label} ${count}회`} arrow>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                backgroundColor: workoutTypes[type].color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {count}
                            </Box>
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
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

                  <Box 
                    sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: 0.5
                    }}
                  >
                    {(() => {
                      const start = startOfMonth(monthData.month);
                      const end = endOfMonth(monthData.month);
                      const days = eachDayOfInterval({ start, end });
                      
                      const firstDayOfWeek = getDay(start);
                      const emptyDays = Array(firstDayOfWeek).fill(null);
                      const allDays = [...emptyDays, ...days];
                      
                      return allDays.map((day, dayIndex) => {
                        if (!day) {
                          return (
                            <Box
                              key={dayIndex}
                              sx={{
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem'
                              }}
                            />
                          );
                        }

                        const dateKey = format(day, 'yyyy-MM-dd');
                        const workouts = workoutData[dateKey] || [];
                        const isToday = isSameDay(day, new Date());

                        return (
                          <Box
                            key={dayIndex}
                            sx={{
                              aspectRatio: '1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: isToday ? 'bold' : 'normal',
                              color: 'text.primary',
                              backgroundColor: workouts.length > 0 ? (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200' : 'transparent',
                              border: workouts.length > 0 ? 1 : 0,
                              borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
                              borderRadius: 1,
                              cursor: workouts.length > 0 ? 'pointer' : 'default',
                              '&:hover': workouts.length > 0 ? {
                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                                color: 'text.primary',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s'
                              } : {}
                            }}
                            title={workouts.length > 0 ? 
                              `${format(day, 'M월 d일')} - ${workouts.length}개 운동` : 
                              `${format(day, 'M월 d일')}`
                            }
                          >
                            {format(day, 'd')}
                          </Box>
                        );
                      });
                    })()}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            📊 {format(currentDate, 'yyyy')}년 총계
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {yearData.reduce((sum, month) => sum + month.totalDays, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  총 운동일
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {yearData.reduce((sum, month) => sum + month.totalWorkouts, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  총 운동 횟수
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {Math.round(yearData.reduce((sum, month) => sum + month.totalWorkouts, 0) / 12 * 10) / 10}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  월평균 운동
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {yearData.filter(month => month.totalWorkouts > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  운동한 월
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddWorkout}
          size="small"
          sx={{ minWidth: 100 }}
        >
          Add Workout
        </Button>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontWeight: 'bold',
              fontSize: '0.8rem',
            }
          }}
        >
          <ToggleButton value="month" aria-label="month view">
            <CalendarViewMonthIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
            Monthly
          </ToggleButton>
          <ToggleButton value="year" aria-label="year view">
            <CalendarMonthIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
            Yearly
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 년도/월 네비게이션 - 월별 보기에서만 표시 */}
      {viewMode === 'month' && (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <IconButton onClick={handlePrevMonth} size="large">
            <ChevronLeftIcon />
          </IconButton>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                }
              }}
              onClick={() => setYearMenuOpen(true)}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                {format(currentDate, 'yyyy')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'medium'
                }}
              >
                년
              </Typography>
              <KeyboardArrowDownIcon 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1.2rem'
                }} 
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                }
              }}
              onClick={() => setMonthMenuOpen(true)}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  minWidth: 50,
                  textAlign: 'center'
                }}
              >
                {format(currentDate, 'M')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'medium'
                }}
              >
                월
              </Typography>
              <KeyboardArrowDownIcon 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1.2rem'
                }} 
              />
            </Box>
          </Box>

          <IconButton onClick={handleNextMonth} size="large">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}

      {viewMode === 'month' ? (
        <>

          <Grid container spacing={1} mb={1}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Grid item xs key={day}>
                <Box
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: day === '일' ? 'error.main' : day === '토' ? 'primary.main' : 'text.primary'
                  }}
                >
                  {day}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box 
            sx={{ 
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
              mt: 2
            }}
          >
            {calendarDays.map((day, index) => {
              const workouts = getWorkoutsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = day && isSameMonth(day, currentDate);
              const isToday = day && isSameDay(day, new Date());

              return (
                <Card
                  key={index}
                  sx={{
                    height: isSelected && workouts.length > 1 ? Math.max(100 + (workouts.length * 25), 150) : 100,
                    width: '100%',
                    cursor: day ? 'pointer' : 'default',
                    backgroundColor: isSelected ? (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200' : 'background.paper',
                    border: isToday ? 2 : 1,
                    borderColor: isToday ? 'primary.main' : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': day ? {
                      backgroundColor: isSelected ? (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300' : 'action.hover',
                      transform: isSelected ? 'none' : 'scale(1.02)',
                    } : {}
                  }}
                  onClick={() => handleDateClick(day)}
                >
                  <CardContent sx={{ p: 1, height: '100%' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                        mb: 1
                      }}
                    >
                      {day ? format(day, 'd') : ''}
                    </Typography>
                    
                    {!isSelected ? (
                      // 선택되지 않은 상태: 기존 운동 점 표시
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, justifyContent: 'center' }}>
                        {workouts.slice(0, 4).map((workout, idx) => (
                          <Tooltip
                            key={idx}
                            title={`${workoutTypes[workout.type].label}${workout.duration ? ` - ${workout.duration}분` : ''}${workout.distance ? ` - ${workout.distance}km` : ''}${workout.sets ? ` - ${workout.sets}세트` : ''}`}
                            arrow
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: workoutTypes[workout.type].color,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.3)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onWorkoutClick(day, workout);
                              }}
                            />
                          </Tooltip>
                        ))}
                        {workouts.length > 4 && (
                          <Tooltip title={`${workouts.length - 4}개 더`} arrow>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: 'grey.500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6rem',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              +
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      // 선택된 상태: 상세 운동 정보 표시
                      <Box sx={{ height: workouts.length > 1 ? 'calc(100% - 30px)' : '100%' }}>
                        {workouts.length > 0 ? (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 0.3, 
                            height: '100%',
                            justifyContent: workouts.length === 1 ? 'center' : 'flex-start'
                          }}>
                            {workouts.map((workout, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.2,
                                  p: 0.2,
                                  backgroundColor: workoutTypes[workout.type].color + '20',
                                  borderRadius: 0.5,
                                  border: 1,
                                  borderColor: workoutTypes[workout.type].color + '40'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: workoutTypes[workout.type].color,
                                    flexShrink: 0
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: 'text.primary',
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontSize: '0.7rem',
                                      lineHeight: 1.1,
                                      mb: 0
                                    }}
                                  >
                                    {workoutTypes[workout.type].label}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.6rem',
                                      lineHeight: 1,
                                      mt: 0
                                    }}
                                  >
                                    {workout.duration && `${workout.duration}분`}
                                    {workout.distance && `${workout.distance}km`}
                                    {workout.sets && `${workout.sets}세트`}
                                    {workout.reps && `${workout.reps}회`}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              color: 'text.secondary',
                              fontSize: '0.8rem'
                            }}
                          >
                            운동 기록 없음
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>



          {/* 운동 종류 */}
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              운동 종류
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
              {Object.entries(workoutTypes).map(([key, value]) => (
                <Box 
                  key={key} 
                  display="flex" 
                  alignItems="center" 
                  gap={0.5}
                  sx={{
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.05)'
                    }
                  }}
                  onClick={() => onWorkoutClick(null, { type: key })}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: value.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {value.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 운동별 진행상황 */}
          <Box mt={4}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              📊 운동별 진행상황
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {Object.entries(workoutTypes).map(([key, value]) => {
                // 해당 월의 운동 데이터 계산
                const monthStart = startOfMonth(currentDate);
                const monthEnd = endOfMonth(currentDate);
                const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                
                const workoutDays = monthDays.filter(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayWorkouts = workoutData[dateKey] || [];
                  return dayWorkouts.some(workout => workout.type === key);
                });

                const today = new Date();
                const todayKey = format(today, 'yyyy-MM-dd');
                const todayWorkouts = workoutData[todayKey] || [];
                const didWorkoutToday = todayWorkouts.some(workout => workout.type === key);

                // 연속 기록 계산 (최근 7일)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  return date;
                }).reverse();

                const streak = last7Days.reduce((count, day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayWorkouts = workoutData[dateKey] || [];
                  const didWorkout = dayWorkouts.some(workout => workout.type === key);
                  return didWorkout ? count + 1 : 0;
                }, 0);

                // 월별 달성률 계산
                const completionRate = Math.round((workoutDays.length / monthDays.length) * 100);

                return (
                  <Card key={key} sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease'
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" gap={4}>
                        {/* 왼쪽: 운동명과 오늘 완료 여부 */}
                        <Box display="flex" alignItems="center" gap={2} minWidth="200px">
                          <Typography variant="h6" fontWeight="bold">
                            {value.emoji} {value.label}
                          </Typography>
                          <Chip 
                            label={didWorkoutToday ? "오늘 완료" : "오늘 미완료"} 
                            color={didWorkoutToday ? "success" : "default"}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>

                        {/* 미니 캘린더 */}
                        <Box>
                          <Box 
                            sx={{ 
                              display: 'grid',
                              gridTemplateColumns: 'repeat(7, 1fr)',
                              gap: 0.5,
                              p: 1,
                              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                              borderRadius: 0.5
                            }}
                          >
                            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                              <Box
                                key={day}
                                sx={{
                                  p: 0.5,
                                  textAlign: 'center',
                                  fontSize: '0.6rem',
                                  fontWeight: 'bold',
                                  color: day === '일' ? 'error.main' : day === '토' ? 'primary.main' : 'text.secondary'
                                }}
                              >
                                {day}
                              </Box>
                            ))}
                            {(() => {
                              const start = startOfMonth(currentDate);
                              const end = endOfMonth(currentDate);
                              const days = eachDayOfInterval({ start, end });
                              
                              const firstDayOfWeek = getDay(start);
                              const emptyDays = Array(firstDayOfWeek).fill(null);
                              const allDays = [...emptyDays, ...days];
                              
                              return allDays.map((day, dayIndex) => {
                                if (!day) {
                                  return (
                                    <Box
                                      key={dayIndex}
                                      sx={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.6rem'
                                      }}
                                    />
                                  );
                                }

                                const dateKey = format(day, 'yyyy-MM-dd');
                                const dayWorkouts = workoutData[dateKey] || [];
                                const didWorkout = dayWorkouts.some(workout => workout.type === key);
                                const isToday = isSameDay(day, new Date());

                                return (
                                  <Box
                                    key={dayIndex}
                                    sx={{
                                      aspectRatio: '1',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.6rem',
                                      fontWeight: isToday ? 'bold' : 'normal',
                                      color: 'text.primary',
                                      backgroundColor: didWorkout ? value.color + '20' : 'transparent',
                                      border: didWorkout ? 1 : 0,
                                      borderColor: value.color,
                                      borderRadius: 0.3,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: didWorkout ? value.color + '30' : (theme) => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.100'
                                      }
                                    }}
                                    title={didWorkout ? 
                                      `${format(day, 'M월 d일')} - ${value.label} 완료` : 
                                      `${format(day, 'M월 d일')}`
                                    }
                                  >
                                    {format(day, 'd')}
                                  </Box>
                                );
                              });
                            })()}
                          </Box>
                        </Box>

                        {/* 통계 정보 */}
                        <Box display="flex" alignItems="center" gap={4}>
                          <Box textAlign="center" minWidth="80px">
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                              연속 기록
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {streak}일
                            </Typography>
                          </Box>

                          <Box textAlign="center" minWidth="80px">
                            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                              달성률
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              {completionRate}%
                            </Typography>
                          </Box>
                        </Box>

                        {/* 상세 보기 버튼 */}
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onWorkoutClick(null, { type: key })}
                          sx={{ 
                            borderColor: value.color,
                            color: value.color,
                            minWidth: '100px',
                            '&:hover': {
                              backgroundColor: value.color + '10',
                              borderColor: value.color
                            }
                          }}
                        >
                          상세 보기
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>
        </>
      ) : (
        renderYearView()
      )}

      {/* 년도 선택 모달 */}
      <Modal
        open={yearMenuOpen}
        onClose={() => setYearMenuOpen(false)}
        aria-labelledby="year-selection-modal"
      >
        <Paper sx={modalStyle}>
          <Typography variant="h5" component="h2" gutterBottom textAlign="center" color="text.primary">
            년도 선택
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              {yearRange.map((year) => (
                <Grid item xs={4} key={year}>
                  <Button
                    fullWidth
                    variant={format(currentDate, 'yyyy') === year.toString() ? 'contained' : 'outlined'}
                    onClick={() => handleYearChange(year)}
                    sx={{
                      py: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      backgroundColor: format(currentDate, 'yyyy') === year.toString() ? 'grey.700' : 'transparent',
                      color: format(currentDate, 'yyyy') === year.toString() ? 'white' : 'text.primary',
                      borderColor: 'grey.400',
                      '&:hover': {
                        backgroundColor: format(currentDate, 'yyyy') === year.toString() ? 'grey.800' : 'grey.100',
                        color: format(currentDate, 'yyyy') === year.toString() ? 'white' : 'text.primary',
                      },
                    }}
                  >
                    {year}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => setYearMenuOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              취소
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* 월 선택 모달 */}
      <Modal
        open={monthMenuOpen}
        onClose={() => setMonthMenuOpen(false)}
        aria-labelledby="month-selection-modal"
      >
        <Paper sx={modalStyle}>
          <Typography variant="h5" component="h2" gutterBottom textAlign="center" color="text.primary">
            월 선택
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              {monthNames.map((month, index) => (
                <Grid item xs={4} key={index}>
                  <Button
                    fullWidth
                    variant={format(currentDate, 'M') === (index + 1).toString() ? 'contained' : 'outlined'}
                    onClick={() => handleMonthChange(index)}
                    sx={{
                      py: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      backgroundColor: format(currentDate, 'M') === (index + 1).toString() ? 'grey.700' : 'transparent',
                      color: format(currentDate, 'M') === (index + 1).toString() ? 'white' : 'text.primary',
                      borderColor: 'grey.400',
                      '&:hover': {
                        backgroundColor: format(currentDate, 'M') === (index + 1).toString() ? 'grey.800' : 'grey.100',
                        color: format(currentDate, 'M') === (index + 1).toString() ? 'white' : 'text.primary',
                      },
                    }}
                  >
                    {month}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => setMonthMenuOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              취소
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default WorkoutCalendar; 