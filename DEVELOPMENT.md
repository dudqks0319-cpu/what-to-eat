# 🛠️ 개발 가이드

## 🚀 빠른 시작

### 1. 프로젝트 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작
npm run dev

# 3. 브라우저에서 열기
# http://localhost:5173
```

### 2. 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 📁 프로젝트 구조

```
what-to-eat/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── MindMap.jsx     # 마인드맵 시각화
│   │   ├── Roulette.jsx    # 룰렛 애니메이션
│   │   ├── ErrorBoundary.jsx  # 에러 처리
│   │   └── *.css           # 컴포넌트별 스타일
│   │
│   ├── context/            # Context API
│   │   ├── AppContext.jsx  # 앱 전역 상태
│   │   └── FeaturesContext.jsx  # 기능 상태 (즐겨찾기, 히스토리)
│   │
│   ├── data/               # 데이터
│   │   └── foodData.js     # 음식 카테고리, 메뉴 데이터
│   │
│   ├── App.jsx             # 메인 앱 컴포넌트
│   ├── App.css             # 앱 스타일
│   ├── index.css           # 글로벌 스타일
│   └── main.jsx            # 엔트리 포인트
│
├── public/                 # 정적 파일
├── package.json            # 의존성
├── vite.config.js          # Vite 설정
├── CHANGELOG.md            # 변경 사항
└── DEVELOPMENT.md          # 이 파일
```

---

## 🎨 주요 기능 설명

### 1. **5단계 선택 플로우**

```
START → YESTERDAY → WANTED → EXCLUDE → PRICE → PEOPLE → SELECT_MENU → ROULETTE → RESULT
```

#### 각 단계별 설명:

- **YESTERDAY**: 어제 먹은 음식 선택 (자동 제외)
- **WANTED**: 먹고 싶은 음식 선택 (중복 가능)
- **EXCLUDE**: 제외할 태그 선택 (매운, 느끼, 튀김 등)
- **PRICE**: 가격대 선택 (저렴/보통/비싸도 OK)
- **PEOPLE**: 인원 선택 (1~3명)
- **SELECT_MENU**: 최종 메뉴 선택
- **ROULETTE**: 여러 선택 시 룰렛으로 랜덤 선택
- **RESULT**: 결과 화면

### 2. **상태 관리**

#### FeaturesContext
```javascript
{
  favorites: [],      // 즐겨찾기 카테고리 ID 배열
  blacklist: [],      // 블랙리스트 카테고리 ID 배열
  history: [],        // 선택 기록 (최근 50개)
}
```

#### localStorage 키
- `food_favorites` - 즐겨찾기
- `food_blacklist` - 블랙리스트
- `food_history` - 히스토리

### 3. **필터링 로직**

```javascript
// 1. 어제 먹은 것 제외
filteredCategories = categories.filter(cat =>
  !yesterdayChoices.includes(cat.id)
);

// 2. 블랙리스트 제외
filteredCategories = filteredCategories.filter(cat =>
  !isBlacklisted(cat.id)
);

// 3. 태그 필터
tagFilteredCategories = filteredCategories.filter(cat =>
  cat.items.some(item =>
    !item.tags.some(tag => excludedTags.includes(tag))
  )
);

// 4. 가격대 필터
priceFilteredCategories = tagFilteredCategories.filter(cat =>
  !selectedPriceRange || cat.priceRange === selectedPriceRange
);
```

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* 주요 색상 */
--primary: #2AC1BC;           /* 청록색 */
--primary-dark: #23a09c;      /* 어두운 청록색 */
--primary-light: #e0f6f6;     /* 밝은 청록색 */
--accent: #FF6B35;            /* 주황색 */

/* 배경 */
--bg-main: #F4F6F8;           /* 메인 배경 */
--bg-card: #FFFFFF;           /* 카드 배경 */

/* 텍스트 */
--text-main: #2D3436;         /* 메인 텍스트 */
--text-muted: #636E72;        /* 보조 텍스트 */
--text-light: #B2BEC3;        /* 연한 텍스트 */

/* 그라데이션 배경 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

### 애니메이션

```css
/* 페이드 인 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 바운스 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 펄스 */
@keyframes pulse {
  0%, 100% { box-shadow: 0 12px 40px rgba(42, 193, 188, 0.3); }
  50% { box-shadow: 0 12px 40px rgba(42, 193, 188, 0.5); }
}

/* 아이콘 바운스 */
@keyframes iconBounce {
  0% { opacity: 0; transform: scale(0.3) translateY(50px); }
  50% { transform: scale(1.1) translateY(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
```

---

## 📝 데이터 추가하기

### 새로운 카테고리 추가

```javascript
// src/data/foodData.js

export const categories = [
  // ... 기존 카테고리들
  {
    id: 'new-category',           // 고유 ID
    name: '새 카테고리',           // 표시 이름
    icon: '🍽️',                   // 이모지 아이콘
    priceRange: 'medium',         // low | medium | high
    items: [
      {
        name: '메뉴1',
        tags: ['태그1', '태그2']
      },
      {
        name: '메뉴2',
        tags: ['태그3']
      },
    ]
  },
];
```

### 새로운 태그 추가

```javascript
// src/data/foodData.js

export const excludeTags = [
  // ... 기존 태그들
  {
    id: 'new-tag',
    name: '새로운 태그',
    icon: '🏷️',
    tag: '태그명'
  },
];
```

### 새로운 가격대 추가

```javascript
// src/data/foodData.js

export const priceRanges = [
  // ... 기존 가격대들
  {
    id: 'premium',
    name: '프리미엄 (3만원+)',
    icon: '💎',
    value: 'premium'
  },
];
```

---

## 🧪 테스트

### 수동 테스트 체크리스트

#### ✅ 기본 플로우
- [ ] 시작 화면에서 "시작하기" 클릭
- [ ] 5단계 순서대로 진행
- [ ] 결과 화면 정상 표시

#### ✅ 검색 기능
- [ ] 검색어 입력 시 실시간 필터링
- [ ] 검색 결과 클릭 시 결과 화면 이동
- [ ] 초기화 버튼 작동

#### ✅ 히스토리
- [ ] 선택 후 히스토리에 저장
- [ ] 개별 삭제 버튼 작동
- [ ] 전체 삭제 버튼 작동
- [ ] 날짜 표시 정상

#### ✅ 블랙리스트
- [ ] 결과 화면에서 블랙리스트 추가
- [ ] 블랙리스트 목록 보기
- [ ] 개별 해제 버튼 작동
- [ ] 전체 해제 버튼 작동

#### ✅ 즐겨찾기
- [ ] 결과 화면에서 즐겨찾기 추가
- [ ] 시작 화면에서 즐겨찾기 추천 작동

#### ✅ 가격대 필터
- [ ] 가격대 선택 시 필터링
- [ ] "상관없어" 버튼 작동

#### ✅ 반응형
- [ ] 모바일 화면 (< 500px)
- [ ] 태블릿 화면 (500px ~ 1024px)
- [ ] 데스크톱 화면 (> 1024px)

---

## 🐛 디버깅

### 일반적인 문제

#### 1. MindMap이 표시되지 않음
```
원인: @xyflow/react 라이브러리 이슈
해결: ErrorBoundary가 자동으로 처리
확인: 콘솔에 에러 메시지 확인
```

#### 2. localStorage 초기화
```javascript
// 브라우저 콘솔에서 실행
localStorage.clear();
location.reload();
```

#### 3. 스타일이 적용되지 않음
```bash
# 캐시 삭제 후 재시작
rm -rf node_modules/.vite
npm run dev
```

---

## 🔧 환경 설정

### Vite 설정

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 필요 시 추가 설정
})
```

### ESLint 설정

```javascript
// eslint.config.js
// 기본 설정 사용
```

---

## 📦 배포

### Vercel 배포

```bash
# 1. Vercel 설치
npm i -g vercel

# 2. 배포
vercel

# 3. 프로덕션 배포
vercel --prod
```

### Netlify 배포

```bash
# 1. 빌드
npm run build

# 2. dist 폴더를 Netlify에 드래그 앤 드롭
```

---

## 🎯 개발 팁

### 1. **빠른 개발**
```bash
# 변경 사항 자동 새로고침
npm run dev

# 모바일 테스트
# 같은 네트워크에서: http://<your-ip>:5173
```

### 2. **성능 최적화**
```javascript
// useMemo로 불필요한 재계산 방지
const filteredData = useMemo(() => {
  // 계산 로직
}, [dependencies]);

// useCallback으로 함수 메모이제이션
const handleClick = useCallback(() => {
  // 함수 로직
}, [dependencies]);
```

### 3. **코드 스타일**
```javascript
// ✅ Good
const [data, setData] = useState([]);

// ❌ Bad
const [d, setD] = useState([]);
```

---

## 📚 참고 자료

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [@xyflow/react](https://reactflow.dev)
- [React Spring](https://www.react-spring.dev)

---

**Happy Coding! 🚀**
