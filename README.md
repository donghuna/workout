# 🏃‍♂️ 운동 로그 트래커

MUI(Material-UI)를 활용한 운동 로그 시각화 웹 애플리케이션입니다.

## ✨ 주요 기능

- **월간 달력 뷰**: 이번 달 운동 기록을 달력 형태로 한눈에 확인
- **이모지 기반 시각화**: 각 운동 종류별로 이모지와 색상으로 구분
- **상세 정보 표시**: 날짜 클릭 시 해당 날의 운동 상세 정보 확인
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화된 UI
- **월 이동**: 이전/다음 월로 쉽게 이동 가능

## 🏋️‍♂️ 지원하는 운동 종류

- 🏊‍♂️ 수영
- 🏃‍♂️ 런닝
- 💪 풀업
- 🤸‍♂️ 푸시업
- 🚴‍♂️ 자전거
- 🧘‍♀️ 요가
- 🏋️‍♂️ 헬스
- 🏔️ 등산

## 🚀 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm start
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🛠️ 기술 스택

- **React 18**: 사용자 인터페이스 구축
- **Material-UI (MUI)**: 디자인 시스템 및 컴포넌트
- **date-fns**: 날짜 처리 및 포맷팅
- **Emotion**: CSS-in-JS 스타일링

## 📁 프로젝트 구조

```
src/
├── components/
│   └── WorkoutCalendar.js    # 메인 달력 컴포넌트
├── App.js                    # 메인 앱 컴포넌트
├── index.js                  # 앱 진입점
└── index.css                 # 전역 스타일
```

## 🔧 커스터마이징

### 새로운 운동 종류 추가

`src/components/WorkoutCalendar.js` 파일의 `workoutTypes` 객체에 새로운 운동을 추가할 수 있습니다:

```javascript
const workoutTypes = {
  // 기존 운동들...
  newWorkout: { emoji: '🎯', label: '새운동', color: '#your-color' }
};
```

### 데이터베이스 연동

현재는 `mockWorkoutData` 객체에 하드코딩된 데이터를 사용하고 있습니다. 실제 데이터베이스와 연동하려면 `getWorkoutsForDate` 함수를 수정하세요.

## 📱 반응형 디자인

- 데스크톱: 전체 달력 뷰
- 태블릿: 적응형 그리드 레이아웃
- 모바일: 최적화된 터치 인터페이스

## 🎨 디자인 특징

- Material Design 원칙 준수
- 직관적인 색상 코딩
- 부드러운 애니메이션 효과
- 접근성을 고려한 UI/UX

## �� 라이선스

MIT License