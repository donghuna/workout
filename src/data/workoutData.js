// 운동 타입별 이모지와 색상 정의
export const workoutTypes = {
  swimming: { emoji: '🏊‍♂️', label: '수영', color: '#2196f3' },
  running: { emoji: '🏃‍♂️', label: '런닝', color: '#4caf50' },
  pullup: { emoji: '💪', label: '풀업', color: '#ff9800' },
  pushup: { emoji: '🤸‍♂️', label: '푸시업', color: '#f44336' },
  cycling: { emoji: '🚴‍♂️', label: '자전거', color: '#9c27b0' },
  yoga: { emoji: '🧘‍♀️', label: '요가', color: '#795548' },
  gym: { emoji: '🏋️‍♂️', label: '헬스', color: '#607d8b' },
  hiking: { emoji: '🏔️', label: '등산', color: '#8bc34a' }
};

// 가상의 운동 데이터 (실제로는 데이터베이스에서 가져올 데이터)
const mockWorkoutData = {
  // 2023년 데이터
  '2023-03-15': [
    { type: 'running', duration: 25, distance: 4 },
    { type: 'pushup', sets: 2, reps: 10 }
  ],
  '2023-06-20': [
    { type: 'swimming', duration: 30, distance: 1 },
    { type: 'yoga', duration: 15 }
  ],
  '2023-09-10': [
    { type: 'gym', duration: 45 },
    { type: 'pullup', sets: 3, reps: 5 }
  ],
  '2023-12-25': [
    { type: 'hiking', duration: 90, distance: 5 }
  ],

  // 2024년 데이터
  '2024-01-15': [
    { type: 'running', duration: 30, distance: 5 },
    { type: 'pushup', sets: 3, reps: 15 }
  ],
  '2024-01-17': [
    { type: 'swimming', duration: 45, distance: 1.5 }
  ],
  '2024-01-20': [
    { type: 'pullup', sets: 4, reps: 8 },
    { type: 'gym', duration: 60 }
  ],
  '2024-01-22': [
    { type: 'cycling', duration: 60, distance: 20 }
  ],
  '2024-01-25': [
    { type: 'yoga', duration: 30 }
  ],
  '2024-01-28': [
    { type: 'hiking', duration: 120, distance: 8 }
  ],
  '2024-01-30': [
    { type: 'running', duration: 45, distance: 8 },
    { type: 'pushup', sets: 4, reps: 20 }
  ],
  '2024-03-05': [
    { type: 'running', duration: 35, distance: 6 },
    { type: 'gym', duration: 50 }
  ],
  '2024-05-12': [
    { type: 'swimming', duration: 40, distance: 1.8 },
    { type: 'yoga', duration: 25 }
  ],
  '2024-07-18': [
    { type: 'cycling', duration: 80, distance: 25 },
    { type: 'pushup', sets: 4, reps: 18 }
  ],
  '2024-10-03': [
    { type: 'hiking', duration: 150, distance: 10 },
    { type: 'pullup', sets: 3, reps: 10 }
  ],
  '2024-12-20': [
    { type: 'gym', duration: 90 },
    { type: 'running', duration: 30, distance: 5 }
  ],

  // 2025년 데이터
  '2025-08-01': [
    { type: 'running', duration: 40, distance: 6 },
    { type: 'pushup', sets: 3, reps: 20 }
  ],
  '2025-08-03': [
    { type: 'swimming', duration: 60, distance: 2 },
    { type: 'yoga', duration: 20 }
  ],
  '2025-08-05': [
    { type: 'gym', duration: 90 },
    { type: 'pullup', sets: 5, reps: 10 }
  ],
  '2025-08-07': [
    { type: 'cycling', duration: 75, distance: 25 },
    { type: 'pushup', sets: 4, reps: 15 }
  ],
  '2025-08-09': [
    { type: 'hiking', duration: 180, distance: 12 }
  ],
  '2025-08-11': [
    { type: 'running', duration: 50, distance: 8 },
    { type: 'yoga', duration: 30 }
  ],
  '2025-08-13': [
    { type: 'swimming', duration: 45, distance: 1.8 },
    { type: 'gym', duration: 60 }
  ],
  '2025-08-15': [
    { type: 'pullup', sets: 6, reps: 12 },
    { type: 'pushup', sets: 5, reps: 25 }
  ],
  '2025-08-17': [
    { type: 'cycling', duration: 90, distance: 30 },
    { type: 'yoga', duration: 25 }
  ],
  '2025-08-19': [
    { type: 'running', duration: 35, distance: 5.5 },
    { type: 'gym', duration: 75 }
  ],
  '2025-08-21': [
    { type: 'hiking', duration: 150, distance: 10 },
    { type: 'pushup', sets: 3, reps: 18 }
  ],
  '2025-08-23': [
    { type: 'swimming', duration: 50, distance: 2.2 },
    { type: 'pullup', sets: 4, reps: 15 }
  ],
  '2025-08-25': [
    { type: 'running', duration: 45, distance: 7 },
    { type: 'yoga', duration: 35 }
  ],
  '2025-08-27': [
    { type: 'gym', duration: 120 },
    { type: 'cycling', duration: 45, distance: 15 }
  ],
  '2025-08-29': [
    { type: 'pushup', sets: 6, reps: 30 },
    { type: 'pullup', sets: 5, reps: 12 },
    { type: 'yoga', duration: 20 }
  ],
  '2025-08-31': [
    { type: 'running', duration: 60, distance: 10 },
    { type: 'swimming', duration: 30, distance: 1.2 }
  ],

  // 2025년 다른 월 데이터
  '2025-01-10': [
    { type: 'running', duration: 30, distance: 5 },
    { type: 'gym', duration: 45 }
  ],
  '2025-02-14': [
    { type: 'swimming', duration: 40, distance: 1.5 },
    { type: 'yoga', duration: 20 }
  ],
  '2025-03-22': [
    { type: 'cycling', duration: 60, distance: 20 },
    { type: 'pushup', sets: 3, reps: 15 }
  ],
  '2025-04-05': [
    { type: 'hiking', duration: 120, distance: 8 },
    { type: 'pullup', sets: 4, reps: 8 }
  ],
  '2025-05-18': [
    { type: 'running', duration: 50, distance: 8 },
    { type: 'gym', duration: 75 }
  ],
  '2025-06-30': [
    { type: 'swimming', duration: 55, distance: 2.5 },
    { type: 'yoga', duration: 30 }
  ],
  '2025-07-12': [
    { type: 'cycling', duration: 85, distance: 28 },
    { type: 'pushup', sets: 5, reps: 20 }
  ],
  '2025-09-15': [
    { type: 'running', duration: 40, distance: 6.5 },
    { type: 'gym', duration: 60 }
  ],
  '2025-10-28': [
    { type: 'hiking', duration: 160, distance: 11 },
    { type: 'pullup', sets: 5, reps: 10 }
  ],
  '2025-11-08': [
    { type: 'swimming', duration: 45, distance: 1.8 },
    { type: 'yoga', duration: 25 }
  ],
  '2025-12-24': [
    { type: 'running', duration: 35, distance: 5 },
    { type: 'gym', duration: 50 },
    { type: 'pushup', sets: 3, reps: 12 }
  ]
};

// 데이터베이스에서 운동 데이터를 가져오는 메서드 (임시)
export const getWorkoutData = async (options = {}) => {
  // 실제로는 여기서 데이터베이스 쿼리를 실행
  // 예: const data = await db.query('SELECT * FROM workouts WHERE date BETWEEN ? AND ?', [startDate, endDate]);
  
  // 현재는 가상 데이터를 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockWorkoutData);
    }, 100); // 실제 데이터베이스 호출을 시뮬레이션하기 위한 지연
  });
};

// 특정 날짜의 운동 데이터를 가져오는 메서드
export const getWorkoutDataByDate = async (date) => {
  const dateKey = date.toISOString().split('T')[0].replace(/-/g, '-');
  const allData = await getWorkoutData();
  return allData[dateKey] || [];
};

// 특정 기간의 운동 데이터를 가져오는 메서드
export const getWorkoutDataByDateRange = async (startDate, endDate) => {
  const allData = await getWorkoutData();
  const filteredData = {};
  
  Object.entries(allData).forEach(([date, workouts]) => {
    const workoutDate = new Date(date);
    if (workoutDate >= startDate && workoutDate <= endDate) {
      filteredData[date] = workouts;
    }
  });
  
  return filteredData;
};

// 특정 운동 타입의 데이터를 가져오는 메서드
export const getWorkoutDataByType = async (workoutType) => {
  const allData = await getWorkoutData();
  const filteredData = {};
  
  Object.entries(allData).forEach(([date, workouts]) => {
    const filteredWorkouts = workouts.filter(workout => workout.type === workoutType);
    if (filteredWorkouts.length > 0) {
      filteredData[date] = filteredWorkouts;
    }
  });
  
  return filteredData;
};

// 운동 데이터를 추가하는 메서드 (임시)
export const addWorkoutData = async (date, workoutData) => {
  // 실제로는 여기서 데이터베이스에 INSERT 쿼리 실행
  // 예: await db.query('INSERT INTO workouts (date, type, duration, distance, sets, reps) VALUES (?, ?, ?, ?, ?, ?)', [date, workoutData.type, workoutData.duration, workoutData.distance, workoutData.sets, workoutData.reps]);
  
  const dateKey = date.toISOString().split('T')[0].replace(/-/g, '-');
  mockWorkoutData[dateKey] = mockWorkoutData[dateKey] || [];
  mockWorkoutData[dateKey].push(workoutData);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '운동 데이터가 추가되었습니다.' });
    }, 100);
  });
};

// 운동 데이터를 업데이트하는 메서드 (임시)
export const updateWorkoutData = async (date, workoutId, workoutData) => {
  // 실제로는 여기서 데이터베이스에 UPDATE 쿼리 실행
  // 예: await db.query('UPDATE workouts SET type = ?, duration = ?, distance = ?, sets = ?, reps = ? WHERE id = ?', [workoutData.type, workoutData.duration, workoutData.distance, workoutData.sets, workoutData.reps, workoutId]);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '운동 데이터가 업데이트되었습니다.' });
    }, 100);
  });
};

// 운동 데이터를 삭제하는 메서드 (임시)
export const deleteWorkoutData = async (date, workoutId) => {
  // 실제로는 여기서 데이터베이스에 DELETE 쿼리 실행
  // 예: await db.query('DELETE FROM workouts WHERE id = ?', [workoutId]);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '운동 데이터가 삭제되었습니다.' });
    }, 100);
  });
};

// 통계 데이터를 가져오는 메서드
export const getWorkoutStats = async (options = {}) => {
  const { startDate, endDate, workoutType } = options;
  let data;
  
  if (workoutType) {
    data = await getWorkoutDataByType(workoutType);
  } else if (startDate && endDate) {
    data = await getWorkoutDataByDateRange(startDate, endDate);
  } else {
    data = await getWorkoutData();
  }
  
  const stats = {
    totalWorkouts: 0,
    totalDays: 0,
    totalDuration: 0,
    totalDistance: 0,
    totalSets: 0,
    totalReps: 0,
    workoutTypes: {}
  };
  
  Object.values(data).forEach(workouts => {
    workouts.forEach(workout => {
      stats.totalWorkouts++;
      stats.totalDuration += workout.duration || 0;
      stats.totalDistance += workout.distance || 0;
      stats.totalSets += workout.sets || 0;
      stats.totalReps += workout.reps || 0;
      
      if (!stats.workoutTypes[workout.type]) {
        stats.workoutTypes[workout.type] = 0;
      }
      stats.workoutTypes[workout.type]++;
    });
  });
  
  stats.totalDays = Object.keys(data).length;
  
  return stats;
}; 