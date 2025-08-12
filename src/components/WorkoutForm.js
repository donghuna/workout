import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { workoutTypes, addWorkoutData, getWorkoutDataByDate } from '../data/workoutData';

const WorkoutForm = ({ onBack, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pushupSets, setPushupSets] = useState([{ reps: '' }]);
  const [pullupSets, setPullupSets] = useState([{ reps: '' }]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // 푸시업 세트 추가
  const addPushupSet = () => {
    setPushupSets([...pushupSets, { reps: '' }]);
  };

  // 푸시업 세트 삭제
  const removePushupSet = (index) => {
    setPushupSets(pushupSets.filter((_, i) => i !== index));
  };

  // 푸시업 세트 업데이트
  const updatePushupSet = (index, reps) => {
    const newSets = [...pushupSets];
    newSets[index] = { reps };
    setPushupSets(newSets);
  };

  // 풀업 세트 추가
  const addPullupSet = () => {
    setPullupSets([...pullupSets, { reps: '' }]);
  };

  // 풀업 세트 삭제
  const removePullupSet = (index) => {
    setPullupSets(pullupSets.filter((_, i) => i !== index));
  };

  // 풀업 세트 업데이트
  const updatePullupSet = (index, reps) => {
    const newSets = [...pullupSets];
    newSets[index] = { reps };
    setPullupSets(newSets);
  };

  // 날짜 변경 시 해당 날짜의 기존 데이터 불러오기
  const loadExistingData = async (date) => {
    setLoading(true);
    try {
      const existingWorkouts = await getWorkoutDataByDate(date);
      
      // 푸시업 데이터 처리
      const pushupWorkout = existingWorkouts.find(w => w.type === 'pushup');
      if (pushupWorkout && pushupWorkout.notes && pushupWorkout.notes.includes('세트별:')) {
        const setData = pushupWorkout.notes.match(/세트별: ([\d, ]+)회/);
        if (setData) {
          const reps = setData[1].split(',').map(r => r.trim());
          setPushupSets(reps.map(rep => ({ reps: rep })));
        } else {
          setPushupSets([{ reps: pushupWorkout.reps || '' }]);
        }
      } else if (pushupWorkout) {
        setPushupSets([{ reps: pushupWorkout.reps || '' }]);
      } else {
        setPushupSets([{ reps: '' }]);
      }

      // 풀업 데이터 처리
      const pullupWorkout = existingWorkouts.find(w => w.type === 'pullup');
      if (pullupWorkout && pullupWorkout.notes && pullupWorkout.notes.includes('세트별:')) {
        const setData = pullupWorkout.notes.match(/세트별: ([\d, ]+)회/);
        if (setData) {
          const reps = setData[1].split(',').map(r => r.trim());
          setPullupSets(reps.map(rep => ({ reps: rep })));
        } else {
          setPullupSets([{ reps: pullupWorkout.reps || '' }]);
        }
      } else if (pullupWorkout) {
        setPullupSets([{ reps: pullupWorkout.reps || '' }]);
      } else {
        setPullupSets([{ reps: '' }]);
      }
    } catch (error) {
      console.error('기존 데이터 로드 실패:', error);
      setSnackbar({
        open: true,
        message: '기존 데이터를 불러오는 중 오류가 발생했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    loadExistingData(newDate);
  };

  // 저장 처리
  const handleSave = async () => {
    try {
      const workouts = [];

      // 푸시업 데이터 처리
      const validPushupSets = pushupSets.filter(set => set.reps && set.reps > 0);
      if (validPushupSets.length > 0) {
        workouts.push({
          type: 'pushup',
          sets: validPushupSets.length,
          reps: validPushupSets.reduce((sum, set) => sum + parseInt(set.reps), 0),
          notes: `세트별: ${validPushupSets.map(set => set.reps).join(', ')}회`
        });
      }

      // 풀업 데이터 처리
      const validPullupSets = pullupSets.filter(set => set.reps && set.reps > 0);
      if (validPullupSets.length > 0) {
        workouts.push({
          type: 'pullup',
          sets: validPullupSets.length,
          reps: validPullupSets.reduce((sum, set) => sum + parseInt(set.reps), 0),
          notes: `세트별: ${validPullupSets.map(set => set.reps).join(', ')}회`
        });
      }

      // 유효성 검사
      if (workouts.length === 0) {
        setSnackbar({
          open: true,
          message: '최소 하나의 운동을 입력해주세요.',
          severity: 'warning'
        });
        return;
      }

      // 데이터베이스에 저장
      for (const workout of workouts) {
        const workoutData = {
          type: workout.type,
          sets: workout.sets,
          reps: workout.reps,
          notes: workout.notes
        };

        await addWorkoutData(selectedDate, workoutData);
      }

      setSnackbar({
        open: true,
        message: '운동 기록이 성공적으로 저장되었습니다!',
        severity: 'success'
      });

      // 저장 후 콜백 호출
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('운동 저장 실패:', error);
      setSnackbar({
        open: true,
        message: '운동 저장 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  // 스낵바 닫기
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 총 운동량 계산
  const getTotalWorkouts = () => {
    const pushupTotal = pushupSets
      .filter(set => set.reps && set.reps > 0)
      .reduce((sum, set) => sum + parseInt(set.reps), 0);
    
    const pullupTotal = pullupSets
      .filter(set => set.reps && set.reps > 0)
      .reduce((sum, set) => sum + parseInt(set.reps), 0);
    
    return { pushupTotal, pullupTotal };
  };

  const { pushupTotal, pullupTotal } = getTotalWorkouts();

  // 컴포넌트 마운트 시 현재 날짜의 기존 데이터 로드
  React.useEffect(() => {
    loadExistingData(selectedDate);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box>
        {/* 헤더 */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={onBack} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="primary">
            💪 운동 등록
          </Typography>
        </Box>

        {/* 날짜 선택 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📅 운동 날짜
            </Typography>
            <DatePicker
              label="운동 날짜 선택"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
              maxDate={new Date()}
            />
          </CardContent>
        </Card>

        {/* 푸시업 섹션 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold">
                  {workoutTypes.pushup.emoji} 푸시업
                </Typography>
                {pushupTotal > 0 && (
                  <Chip 
                    label={`총 ${pushupTotal}회`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                {loading && (
                  <Chip 
                    label="로딩 중..." 
                    color="secondary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addPushupSet}
                size="small"
                disabled={loading}
              >
                세트 추가
              </Button>
            </Box>

            <Grid container spacing={1}>
              {pushupSets.map((set, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {index + 1}세트
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePushupSet(index)}
                        sx={{ p: 0.5 }}
                      >
                        <RemoveIcon sx={{ fontSize: '0.8rem' }} />
                      </IconButton>
                    </Box>
                    <TextField
                      type="number"
                      value={set.reps}
                      onChange={(e) => updatePushupSet(index, e.target.value)}
                      inputProps={{ 
                        min: 0, 
                        max: 999,
                        style: { 
                          textAlign: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          padding: '8px 4px'
                        }
                      }}
                      size="small"
                      placeholder="0"
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: '40px',
                          '& input': {
                            textAlign: 'center',
                            padding: '8px 4px'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* 풀업 섹션 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold">
                  {workoutTypes.pullup.emoji} 풀업
                </Typography>
                {pullupTotal > 0 && (
                  <Chip 
                    label={`총 ${pullupTotal}회`} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addPullupSet}
                size="small"
                disabled={loading}
              >
                세트 추가
              </Button>
            </Box>

            <Grid container spacing={1}>
              {pullupSets.map((set, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {index + 1}세트
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePullupSet(index)}
                        sx={{ p: 0.5 }}
                      >
                        <RemoveIcon sx={{ fontSize: '0.8rem' }} />
                      </IconButton>
                    </Box>
                    <TextField
                      type="number"
                      value={set.reps}
                      onChange={(e) => updatePullupSet(index, e.target.value)}
                      inputProps={{ 
                        min: 0, 
                        max: 999,
                        style: { 
                          textAlign: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          padding: '8px 4px'
                        }
                      }}
                      size="small"
                      placeholder="0"
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: '40px',
                          '& input': {
                            textAlign: 'center',
                            padding: '8px 4px'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* 총 운동량 요약 */}
        {(pushupTotal > 0 || pullupTotal > 0) && (
          <Card sx={{ mb: 3, backgroundColor: 'primary.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                📊 오늘의 운동 요약
              </Typography>
              <Grid container spacing={2}>
                {pushupTotal > 0 && (
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {pushupTotal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        푸시업 총 횟수
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {pullupTotal > 0 && (
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {pullupTotal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        풀업 총 횟수
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* 저장 버튼 */}
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="outlined"
            onClick={onBack}
            size="large"
            sx={{ minWidth: 120 }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            size="large"
            disabled={pushupTotal === 0 && pullupTotal === 0 || loading}
            sx={{ minWidth: 120 }}
          >
            저장
          </Button>
        </Box>

        {/* 스낵바 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default WorkoutForm; 