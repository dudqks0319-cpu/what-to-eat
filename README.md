# 🍽️ 점심 저녁 뭐먹지?

> 선택장애 탈출 프로젝트 - 오늘 뭐 먹을지 고민될 때 사용하는 음식 추천 웹앱

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 주요 기능

### 🎯 5단계 음식 추천 플로우

1. **어제 뭐 먹었어?** - 어제 먹은 음식은 자동 제외
2. **먹고 싶은 거 있어?** - 원하는 음식 중복 선택 가능
3. **빼고 싶은 거?** - 매운/느끼한/튀긴 음식 등 제외
4. **몇 명이서 먹어?** - 1~3명 선택
5. **어떤 게 땡겨?** - 최종 선택 (중복 선택 시 룰렛)

### 🎰 재미있는 룰렛

- 여러 개 선택하면 SVG 룰렛으로 랜덤 선택
- 룰렛 판에 음식 이름과 이모지 표시
- 부드러운 스핀 애니메이션

### 🗺️ 마인드맵 시각화

- 시작 화면에서 전체 카테고리 마인드맵 표시
- 결과 화면에서 선택된 카테고리의 메뉴들 시각화

### ⭐ 즐겨찾기 & 히스토리

- 자주 먹는 음식 즐겨찾기 저장
- 블랙리스트로 특정 음식 영구 제외
- 최근 선택 기록 확인 및 통계

### 🕐 시간대 자동 인식

- 점심/저녁/야식 시간대 자동 감지
- 시간대에 맞는 UI 표시

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + Vite |
| 상태관리 | React Context + useReducer |
| 애니메이션 | React Spring, CSS Animations |
| 마인드맵 | @xyflow/react |
| 스타일링 | Vanilla CSS |
| 저장소 | localStorage |

## 📦 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/what-to-eat.git
cd what-to-eat

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

<http://localhost:5173> 에서 확인

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── MindMap.jsx      # 마인드맵 시각화
│   ├── MindMap.css
│   ├── Roulette.jsx     # 룰렛 컴포넌트
│   └── Roulette.css
├── context/
│   └── FeaturesContext.jsx  # 즐겨찾기/히스토리 상태
├── data/
│   └── foodData.js      # 음식 데이터
├── App.jsx              # 메인 앱
├── App.css
├── index.css
└── main.jsx
```

## 🍔 음식 카테고리

17개 카테고리, 100+ 메뉴 지원:

- 한식 🍚, 중식 🥢, 일식 🍣, 양식 🍝
- 패스트푸드 🍔, 분식 🍜, 치킨 🍗, 피자 🍕
- 카페/디저트 ☕, 도시락 🍱, 돈까스 🥩, 찜/탕 🥘
- 국밥 🍲, 고기 🥓, 족발/보쌈 🐷, 아시안 🍜, 야식 🌙

## 📝 라이센스

MIT License

## 🙏 기여

PR과 이슈는 언제든 환영합니다!
