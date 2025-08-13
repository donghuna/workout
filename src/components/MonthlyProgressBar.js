import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Divider,
  TextField,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  FitnessCenter as FitnessCenterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
  subDays
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { workoutTypes, getWorkoutData } from '../data/workoutData';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MonthlyProgressBar = ({ currentDate, onWorkoutClick }) => {
  const [workoutData, setWorkoutData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    // 모든 운동 타입에 대한 기본 목표 설정
    const defaultGoals = {
      totalWorkouts: 20,
      workoutDays: 15
    };
    
    // workoutTypes의 모든 타입에 대해 기본값 설정
    Object.keys(workoutTypes).forEach(type => {
      defaultGoals[type] = 5; // 기본값 5회
    });
    
    return defaultGoals;
  });

  // 이전 달의 운동 기록을 분석하여 자동 목표 설정
  const calculateAutoGoals = useMemo(() => {
    const previousMonth = new Date(currentDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const prevMonthStart = startOfMonth(previousMonth);
    const prevMonthEnd = endOfMonth(previousMonth);
    const prevMonthDays = eachDayOfInterval({ start: prevMonthStart, end: prevMonthEnd });
    
    // 이전 달의 운동 데이터 수집
    const prevMonthWorkouts = {};
    const prevMonthWorkoutDays = new Set();
    
    prevMonthDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayWorkouts = workoutData[dateKey] || [];
      
      if (dayWorkouts.length > 0) {
        prevMonthWorkoutDays.add(dateKey);
        
        dayWorkouts.forEach(workout => {
          if (!prevMonthWorkouts[workout.type]) {
            prevMonthWorkouts[workout.type] = 0;
          }
          prevMonthWorkouts[workout.type]++;
        });
      }
    });
    
    // 이전 달 총 운동 횟수
    const prevTotalWorkouts = Object.values(prevMonthWorkouts).reduce((sum, count) => sum + count, 0);
    const prevWorkoutDays = prevMonthWorkoutDays.size;
    
    // 자동 목표 계산 (이전 달 대비 10% 증가, 최소값 보장)
    const autoGoals = {
      totalWorkouts: Math.max(10, Math.round(prevTotalWorkouts * 1.1)),
      workoutDays: Math.max(8, Math.round(prevWorkoutDays * 1.1))
    };
    
    // 운동 타입별 자동 목표
    Object.keys(workoutTypes).forEach(type => {
      const prevCount = prevMonthWorkouts[type] || 0;
      autoGoals[type] = Math.max(3, Math.round(prevCount * 1.1));
    });
    
    return autoGoals;
  }, [currentDate, workoutData]);

  // 운동 추이 데이터 계산
  const workoutTrendData = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // 일별 운동 데이터 수집
    const dailyData = monthDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayWorkouts = workoutData[dateKey] || [];
      
      // 운동 타입별 개수 계산
      const workoutCounts = {};
      Object.keys(workoutTypes).forEach(type => {
        workoutCounts[type] = dayWorkouts.filter(w => w.type === type).length;
      });
      
      return {
        date: format(day, 'M/d'),
        fullDate: format(day, 'yyyy-MM-dd'),
        total: dayWorkouts.length,
        isToday: isSameDay(day, today),
        ...workoutCounts
      };
    });
    
    return dailyData;
  }, [currentDate, workoutData]);

  // 운동 타입별 월간 통계 데이터
  const workoutTypeStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const typeStats = {};
    Object.keys(workoutTypes).forEach(type => {
      let totalCount = 0;
      let totalDays = 0;
      
      monthDays.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayWorkouts = workoutData[dateKey] || [];
        const typeWorkouts = dayWorkouts.filter(w => w.type === type);
        
        if (typeWorkouts.length > 0) {
          totalCount += typeWorkouts.length;
          totalDays++;
        }
      });
      
      typeStats[type] = {
        name: workoutTypes[type].label,
        count: totalCount,
        days: totalDays,
        color: workoutTypes[type].color
      };
    });
    
    return Object.values(typeStats).filter(stat => stat.count > 0);
  }, [currentDate, workoutData]);

  // 스트릭 정보 계산
  const streakInfo = useMemo(() => {
    const today = new Date();
    const allDates = Object.keys(workoutData).sort();
    
    if (allDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        currentMonthStreak: 0,
        longestMonthStreak: 0,
        lastWorkoutDate: null,
        nextMilestone: 0
      };
    }
    
    // 현재 스트릭 계산 (오늘부터 역순으로)
    let currentStreak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      if (workoutData[dateKey] && workoutData[dateKey].length > 0) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // 최고 스트릭 계산
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;
    
    for (let i = allDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(allDates[i]);
      const nextDate = i > 0 ? new Date(allDates[i - 1]) : null;
      
      if (nextDate && isSameDay(addDays(currentDate, 1), nextDate)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // 이번 달 스트릭 계산
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let currentMonthStreak = 0;
    let tempMonthStreak = 0;
    
    for (let i = monthDays.length - 1; i >= 0; i--) {
      const day = monthDays[i];
      const dateKey = format(day, 'yyyy-MM-dd');
      
      if (workoutData[dateKey] && workoutData[dateKey].length > 0) {
        tempMonthStreak++;
        currentMonthStreak = Math.max(currentMonthStreak, tempMonthStreak);
      } else {
        tempMonthStreak = 0;
      }
    }
    
    // 최고 월간 스트릭 계산
    let longestMonthStreak = 0;
    const lastWorkoutDate = new Date(allDates[allDates.length - 1]);
    
    // 다음 마일스톤 계산
    const nextMilestone = Math.ceil(currentStreak / 10) * 10;
    
    return {
      currentStreak,
      longestStreak,
      currentMonthStreak,
      longestMonthStreak,
      lastWorkoutDate,
      nextMilestone
    };
  }, [workoutData, currentDate]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  }, [currentDate]); // currentDate가 변경될 때마다 데이터 다시 로드

  // 월이 변경될 때 자동으로 목표 업데이트
  useEffect(() => {
    if (Object.keys(workoutData).length > 0) {
      const newGoals = { ...monthlyGoal };
      let hasChanges = false;
      
      // 자동 목표와 현재 목표 비교하여 업데이트
      Object.keys(calculateAutoGoals).forEach(key => {
        if (calculateAutoGoals[key] > monthlyGoal[key]) {
          newGoals[key] = calculateAutoGoals[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setMonthlyGoal(newGoals);
      }
    }
  }, [currentDate, workoutData]); // currentDate나 workoutData가 변경될 때 실행

  // 현재 월의 진행률 계산
  const monthlyProgress = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const today = new Date();
    const isCurrentMonth = isSameMonth(currentDate, today);
    
    // 현재 월의 운동 데이터 수집
    const monthWorkouts = {};
    const workoutDays = new Set();
    
    monthDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayWorkouts = workoutData[dateKey] || [];
      
      if (dayWorkouts.length > 0) {
        workoutDays.add(dateKey);
        
        dayWorkouts.forEach(workout => {
          if (!monthWorkouts[workout.type]) {
            monthWorkouts[workout.type] = 0;
          }
          monthWorkouts[workout.type]++;
        });
      }
    });

    // 디버깅을 위한 로그
    console.log('월간 진행률 계산:', {
      currentDate: format(currentDate, 'yyyy-MM'),
      monthStart: format(monthStart, 'yyyy-MM-dd'),
      monthEnd: format(monthEnd, 'yyyy-MM-dd'),
      monthWorkouts,
      workoutDays: Array.from(workoutDays),
      totalWorkouts: Object.values(monthWorkouts).reduce((sum, count) => sum + count, 0),
      workoutDaysCount: workoutDays.size,
      monthlyGoal
    });

    // 목표 대비 달성률 계산
    const progress = {
      totalWorkouts: {
        current: Object.values(monthWorkouts).reduce((sum, count) => sum + count, 0),
        goal: monthlyGoal.totalWorkouts,
        percentage: 0
      },
      workoutDays: {
        current: workoutDays.size,
        goal: monthlyGoal.workoutDays,
        percentage: 0
      },
      byType: {}
    };

    // 전체 운동 횟수 달성률
    progress.totalWorkouts.percentage = Math.min(
      Math.round((progress.totalWorkouts.current / progress.totalWorkouts.goal) * 100),
      100
    );

    // 운동일 달성률
    progress.workoutDays.percentage = Math.min(
      Math.round((progress.workoutDays.current / progress.workoutDays.goal) * 100),
      100
    );

    console.log('진행률 계산 결과:', {
      totalWorkouts: {
        current: progress.totalWorkouts.current,
        goal: progress.totalWorkouts.goal,
        percentage: progress.totalWorkouts.percentage
      },
      workoutDays: {
        current: progress.workoutDays.current,
        goal: progress.workoutDays.goal,
        percentage: progress.workoutDays.percentage
      }
    });

    // 운동 타입별 달성률
    Object.keys(workoutTypes).forEach(type => {
      const current = monthWorkouts[type] || 0;
      const goal = monthlyGoal[type] || 0;
      
      // 목표가 0인 경우 처리
      let percentage, status, remaining;
      
      if (goal === 0) {
        percentage = 0;
        status = 'no-goal'; // 목표 미설정
        remaining = 0;
      } else {
        percentage = Math.min(Math.round((current / goal) * 100), 100);
        status = current >= goal ? 'completed' : 'in-progress';
        remaining = Math.max(0, goal - current);
      }
      
      progress.byType[type] = {
        current,
        goal,
        percentage,
        remaining,
        status
      };
    });

    // 주간 진행률 계산
    const weeklyProgress = [];
    const weeksInMonth = Math.ceil(monthDays.length / 7);
    
    for (let week = 0; week < weeksInMonth; week++) {
      const weekStart = addDays(monthStart, week * 7);
      const weekEnd = subDays(addDays(weekStart, 6), 1);
      
      const weekDays = eachDayOfInterval({ 
        start: weekStart > monthStart ? weekStart : monthStart, 
        end: weekEnd < monthEnd ? weekEnd : monthEnd 
      });
      
      let weekWorkouts = 0;
      let weekWorkoutDays = 0;
      
      weekDays.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayWorkouts = workoutData[dateKey] || [];
        
        if (dayWorkouts.length > 0) {
          weekWorkouts += dayWorkouts.length;
          weekWorkoutDays++;
        }
      });
      
      weeklyProgress.push({
        week: week + 1,
        workouts: weekWorkouts,
        workoutDays: weekWorkoutDays,
        totalDays: weekDays.length
      });
    }

    return {
      ...progress,
      weeklyProgress,
      monthDays: monthDays.length,
      remainingDays: isCurrentMonth ? monthDays.filter(day => day > today).length : 0,
      isCurrentMonth
    };
  }, [currentDate, workoutData, monthlyGoal]);

  // 목표 설정 핸들러
  const handleGoalChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setMonthlyGoal(prev => ({
      ...prev,
      [type]: Math.max(0, numValue)
    }));
  };

  // 진행률 바 색상 결정
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'error';
  };

  // 진행률 바 스타일
  const getProgressBarStyle = (percentage) => ({
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
      borderRadius: 6,
      background: `linear-gradient(90deg, 
        ${theme.palette[getProgressColor(percentage)].main} 0%, 
        ${theme.palette[getProgressColor(percentage)].light || theme.palette[getProgressColor(percentage)].main} 100%)`
    }
  });

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            진행률을 계산하는 중...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
      <CardContent>
        {/* 헤더 */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={2}
          flexDirection={isMobile ? "column" : "row"}
          gap={isMobile ? 1 : 0}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {format(currentDate, 'M월', { locale: ko })} 진행률
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<CalendarTodayIcon />}
              label={`${monthlyProgress.workoutDays.current}/${monthlyProgress.workoutDays.goal}일`}
              color={getProgressColor(monthlyProgress.workoutDays.percentage)}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            />
            <Chip
              icon={<FitnessCenterIcon />}
              label={`${monthlyProgress.totalWorkouts.current}/${monthlyProgress.totalWorkouts.goal}회`}
              color={getProgressColor(monthlyProgress.totalWorkouts.percentage)}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            />
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 전체 진행률 요약 */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  운동일 달성률
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {monthlyProgress.workoutDays.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={monthlyProgress.workoutDays.percentage}
                sx={getProgressBarStyle(monthlyProgress.workoutDays.percentage)}
              />
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  현재: {monthlyProgress.workoutDays.current}일
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  목표: {monthlyProgress.workoutDays.goal}일
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  총 운동 횟수
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {monthlyProgress.totalWorkouts.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={monthlyProgress.totalWorkouts.percentage}
                sx={getProgressBarStyle(monthlyProgress.totalWorkouts.percentage)}
              />
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  현재: {monthlyProgress.totalWorkouts.current}회
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  목표: {monthlyProgress.totalWorkouts.goal}회
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* 운동 타입별 진행률 */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom mb={2}>
            운동별 진행률
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(workoutTypes).map(([type, info]) => {
              const progress = monthlyProgress.byType[type];
              if (!progress) return null;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={type}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                    onClick={() => onWorkoutClick && onWorkoutClick(null, { type })}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h5">
                          {info.emoji}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {info.label}
                        </Typography>
                      </Box>
                      
                      <Box mb={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {progress.current}/{progress.goal}회
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {progress.status === 'no-goal' ? '목표 미설정' : `${progress.percentage}%`}
                          </Typography>
                        </Box>
                        
                        {progress.status === 'no-goal' ? (
                          <Box 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4, 
                              backgroundColor: theme.palette.grey[300],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              목표를 설정해주세요
                            </Typography>
                          </Box>
                        ) : (
                          <LinearProgress
                            variant="determinate"
                            value={progress.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: info.color
                              }
                            }}
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        {progress.status === 'no-goal' ? (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              목표 미설정
                            </Typography>
                          </>
                        ) : progress.remaining > 0 ? (
                          <>
                            <CancelIcon color="error" sx={{ fontSize: '1rem' }} />
                            <Typography variant="caption" color="error.main">
                              {progress.remaining}회 남음
                            </Typography>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon color="success" sx={{ fontSize: '1rem' }} />
                            <Typography variant="caption" color="success.main">
                              목표 달성!
                            </Typography>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* 스트릭 정보 */}
        <Box 
          sx={{ 
            p: 2, 
            mb: 2,
            backgroundColor: 'success.50', 
            borderRadius: 2,
            border: 1,
            borderColor: 'success.200'
          }}
        >
          <Typography variant="body2" fontWeight="bold" color="success.main" gutterBottom>
            🔥 연속 운동 스트릭
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">현재 스트릭</Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {streakInfo.currentStreak}일
                </Typography>
                <Typography variant="caption" color="success.main" fontWeight="bold">
                  {streakInfo.currentStreak > 0 ? '🔥 활발한 운동 중!' : '시작해보세요!'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">최고 스트릭</Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {streakInfo.longestStreak}일
                </Typography>
                <Typography variant="caption" color="primary.main">
                  {streakInfo.currentStreak === streakInfo.longestStreak ? '🏆 신기록!' : '도전해보세요!'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">이번 달 최고</Typography>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {streakInfo.currentMonthStreak}일
                </Typography>
                <Typography variant="caption" color="warning.main">
                  이번 달 연속 기록
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">다음 마일스톤</Typography>
                <Typography variant="h5" color="info.main" fontWeight="bold">
                  {streakInfo.nextMilestone}일
                </Typography>
                <Typography variant="caption" color="info.main">
                  {streakInfo.nextMilestone - streakInfo.currentStreak > 0 
                    ? `${streakInfo.nextMilestone - streakInfo.currentStreak}일 남음` 
                    : '달성!'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* 스트릭 진행률 바 */}
          {streakInfo.currentStreak > 0 && (
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  다음 마일스톤까지 진행률
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round((streakInfo.currentStreak / streakInfo.nextMilestone) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(streakInfo.currentStreak / streakInfo.nextMilestone) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'success.100',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                  }
                }}
              />
            </Box>
          )}
          
          {/* 마지막 운동일 정보 */}
          {streakInfo.lastWorkoutDate && (
            <Box mt={2} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                마지막 운동일: {format(streakInfo.lastWorkoutDate, 'M월 d일 (E)', { locale: ko })}
              </Typography>
            </Box>
          )}
        </Box>



        {/* 확장 가능한 상세 정보 */}
        <Collapse in={expanded}>
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            
            {/* 목표 설정 */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" gutterBottom>
                목표 설정
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setMonthlyGoal(calculateAutoGoals)}
                sx={{ 
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': {
                    borderColor: 'success.dark',
                    backgroundColor: 'success.50'
                  }
                }}
              >
                🎯 자동 목표 적용
              </Button>
            </Box>
            
            {/* 이전 달 기록 요약 */}
            <Box 
              sx={{ 
                p: 2, 
                mb: 2,
                backgroundColor: 'info.50', 
                borderRadius: 2,
                border: 1,
                borderColor: 'info.200'
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="info.main" gutterBottom>
                📊 이전 달 기록 ({format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1), 'M월')})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">총 운동</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {(() => {
                        const prevMonth = new Date(currentDate);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        const prevMonthStart = startOfMonth(prevMonth);
                        const prevMonthEnd = endOfMonth(prevMonth);
                        const prevMonthDays = eachDayOfInterval({ start: prevMonthStart, end: prevMonthEnd });
                        
                        let totalWorkouts = 0;
                        prevMonthDays.forEach(day => {
                          const dateKey = format(day, 'yyyy-MM-dd');
                          const dayWorkouts = workoutData[dateKey] || [];
                          totalWorkouts += dayWorkouts.length;
                        });
                        return totalWorkouts;
                      })()}회
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">운동일</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {(() => {
                        const prevMonth = new Date(currentDate);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        const prevMonthStart = startOfMonth(prevMonth);
                        const prevMonthEnd = endOfMonth(prevMonth);
                        const prevMonthDays = eachDayOfInterval({ start: prevMonthStart, end: prevMonthEnd });
                        
                        const workoutDays = new Set();
                        prevMonthDays.forEach(day => {
                          const dateKey = format(day, 'yyyy-MM-dd');
                          const dayWorkouts = workoutData[dateKey] || [];
                          if (dayWorkouts.length > 0) {
                            workoutDays.add(dateKey);
                          }
                        });
                        return workoutDays.size;
                      })()}일
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">자동 목표</Typography>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      +10%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">권장</Typography>
                    <Typography variant="h6" color="info.main" fontWeight="bold">
                      자동 적용
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="전체 운동 횟수"
                  type="number"
                  value={monthlyGoal.totalWorkouts}
                  onChange={(e) => handleGoalChange('totalWorkouts', e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText={`이전 달: ${calculateAutoGoals.totalWorkouts}회`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="운동일"
                  type="number"
                  value={monthlyGoal.workoutDays}
                  onChange={(e) => handleGoalChange('workoutDays', e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText={`이전 달: ${calculateAutoGoals.workoutDays}일`}
                />
              </Grid>
              {Object.entries(workoutTypes).map(([type, info]) => (
                <Grid item xs={12} sm={6} md={3} key={type}>
                  <TextField
                    label={`${info.label} 목표`}
                    type="number"
                    value={monthlyGoal[type] || 0}
                    onChange={(e) => handleGoalChange(type, e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0 }}
                    placeholder="0"
                    helperText={`이전 달: ${calculateAutoGoals[type] || 0}회`}
                  />
                </Grid>
              ))}
            </Grid>
            


            {/* 주간 진행률 */}
            <Typography variant="h6" gutterBottom mb={2}>
              주간 진행률
            </Typography>
            <Grid container spacing={1} mb={3}>
              {monthlyProgress.weeklyProgress.map((week, index) => (
                <Grid item xs={6} sm={3} md={2} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      textAlign: 'center',
                      backgroundColor: week.workoutDays > 0 ? 'success.50' : 'grey.50',
                      borderColor: week.workoutDays > 0 ? 'success.200' : 'grey.200'
                    }}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {week.week}주차
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {week.workoutDays}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {week.workouts}회
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* 남은 기간 및 예상 달성률 */}
            {monthlyProgress.isCurrentMonth && monthlyProgress.remainingDays > 0 && (
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'info.50', 
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'info.200'
                }}
              >
                <Typography variant="body2" fontWeight="bold" color="info.main" gutterBottom>
                  📅 남은 {monthlyProgress.remainingDays}일 동안의 계획
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  현재 진행률을 유지한다면, 이번 달 목표 달성률은{' '}
                  <strong>
                    {Math.round(
                      (monthlyProgress.totalWorkouts.current + 
                       (monthlyProgress.totalWorkouts.current / (monthlyProgress.monthDays - monthlyProgress.remainingDays)) * monthlyProgress.remainingDays) / 
                      monthlyProgress.totalWorkouts.goal * 100
                    )}%
                  </strong>
                  에 도달할 것으로 예상됩니다.
                </Typography>
              </Box>
            )}

            {/* 운동 추이 그래프 */}
            <Box 
              sx={{ 
                p: 2, 
                mt: 3,
                backgroundColor: 'background.paper', 
                borderRadius: 2,
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                📈 {format(currentDate, 'M월', { locale: ko })} 운동 추이
              </Typography>
              
              {/* 일별 운동 횟수 차트 */}
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  일별 총 운동 횟수
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={workoutTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div
                              style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                padding: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                {label}
                              </div>
                              <div style={{ color: '#1976d2' }}>
                                총 운동: {payload[0].value}회
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

              {/* 운동 타입별 분포 파이 차트 */}
              {workoutTypeStats.length > 0 && (
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    운동 타입별 분포
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={workoutTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                          // 퍼센트가 15% 이상일 때만 라벨 표시
                          if (percent > 0.15) {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#333"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                fontSize="11"
                                fontWeight="500"
                              >
                                {`${name} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }
                          return null;
                        }}
                        outerRadius={70}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {workoutTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div
                                style={{
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '4px',
                                  padding: '8px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                  minWidth: '120px',
                                  fontSize: '12px'
                                }}
                              >
                                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                                  {data.name}
                                </div>
                                <div style={{ color: '#1976d2', fontSize: '10px' }}>
                                  {data.count}회 ({data.days}일)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {/* 운동 타입별 일별 추이 */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  운동 타입별 일별 추이
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={workoutTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div
                              style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                padding: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                {label}
                              </div>
                              {payload.map((entry, index) => (
                                <div 
                                  key={index} 
                                  style={{ 
                                    color: entry.color,
                                    marginBottom: '2px',
                                    fontSize: '11px'
                                  }}
                                >
                                  {entry.name}: {entry.value}회
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {Object.keys(workoutTypes).map((type, index) => (
                      <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        stroke={workoutTypes[type].color}
                        strokeWidth={2}
                        dot={{ fill: workoutTypes[type].color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: workoutTypes[type].color, strokeWidth: 2 }}
                        hide={workoutTrendData.every(day => day[type] === 0)}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default MonthlyProgressBar; 