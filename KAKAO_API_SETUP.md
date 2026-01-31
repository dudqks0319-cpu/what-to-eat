# 🗺️ 카카오 지도 API 설정 가이드

## 1단계: 카카오 개발자 계정 생성

1. **카카오 개발자 사이트 접속**
   - URL: https://developers.kakao.com/
   - 우측 상단 "로그인" 클릭
   - 카카오톡 계정으로 로그인

2. **약관 동의**
   - 처음 로그인 시 개발자 약관 동의 필요
   - 모두 동인 후 계속 진행

---

## 2단계: 애플리케이션 등록

1. **내 애플리케이션 메뉴로 이동**
   - 상단 메뉴에서 "내 애플리케이션" 클릭
   - "애플리케이션 추가하기" 버튼 클릭

2. **앱 정보 입력**
   - 앱 이름: `뭐 먹지` (또는 원하는 이름)
   - 사업자명: 개인 이름 입력
   - "저장" 클릭

3. **앱 키 확인**
   - 생성된 앱 클릭
   - "앱 키" 탭에서 확인
   - **JavaScript 키**를 복사 (예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

---

## 3단계: 플랫폼 등록

1. **플랫폼 설정**
   - 좌측 메뉴 "플랫폼" 클릭
   - "Web 플랫폼 등록" 클릭

2. **사이트 도메인 등록**
   ```
   http://localhost:5173
   ```
   - 개발 서버 주소 입력
   - "저장" 클릭

3. **배포 시 추가 도메인 등록**
   - 나중에 Vercel, Netlify 등 배포 시
   - 실제 도메인도 추가 등록 필요
   - 예: `https://your-app.vercel.app`

---

## 4단계: 사이트 도메인 활성화

1. **좌측 메뉴에서 "카카오 로그인" 클릭**
   - "활성화 설정" ON으로 변경
   - (선택사항이지만 권장)

---

## 5단계: API 키 환경변수 설정

### 로컬 개발 환경

1. **프로젝트 루트에 `.env` 파일 생성**
   ```bash
   # /Users/jyb-m3max/Desktop/what-to-eat/.env
   ```

2. **API 키 입력**
   ```env
   VITE_KAKAO_APP_KEY=여기에_발급받은_JavaScript_키_입력
   ```

3. **`.gitignore`에 추가** (보안)
   ```
   .env
   .env.local
   ```

### 배포 환경 (Vercel)

1. **Vercel 대시보드 접속**
2. **프로젝트 Settings → Environment Variables**
3. **변수 추가:**
   - Name: `VITE_KAKAO_APP_KEY`
   - Value: `발급받은_JavaScript_키`
   - Environment: Production, Preview, Development 모두 체크

---

## 6단계: 코드에 적용

**이미 준비되어 있습니다!** ✅

아래 파일들이 자동으로 생성/수정됩니다:
- `.env` - API 키 저장
- `index.html` - Kakao SDK 스크립트 추가
- `src/components/KakaoMap.jsx` - 지도 컴포넌트
- `src/App.jsx` - 결과 화면에 지도 통합

---

## 7단계: 테스트

1. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

2. **브라우저에서 확인**
   - http://localhost:5173
   - 메뉴 선택 후 결과 화면에 지도 표시 확인

---

## 🔍 API 키 찾는 곳 요약

```
카카오 개발자 콘솔
  → 내 애플리케이션
    → 앱 선택
      → 앱 키 탭
        → JavaScript 키 복사
```

---

## ⚠️ 주의사항

1. **JavaScript 키만 사용**
   - REST API 키가 아닌 JavaScript 키 사용
   - 브라우저에서 실행되는 코드용

2. **도메인 등록 필수**
   - 등록하지 않은 도메인에서는 API 작동 안 함
   - 개발: `http://localhost:5173`
   - 배포: 실제 도메인 추가 등록

3. **보안**
   - `.env` 파일은 절대 GitHub에 올리지 마세요
   - `.gitignore`에 반드시 추가

4. **무료 할당량**
   - 지도 API는 무료로 제공
   - 일일 호출 제한 있음 (충분히 사용 가능)

---

## 📞 문제 해결

### 지도가 안 보여요
- F12 개발자 도구 → Console 탭 확인
- "Invalid API key" → API 키 확인
- "Invalid domain" → 플랫폼 도메인 등록 확인

### 검색이 안 돼요
- Kakao REST API도 활성화되었는지 확인
- 네트워크 요청 확인 (F12 → Network 탭)

---

**준비가 되면 API 키를 알려주세요!** 🚀
자동으로 모든 설정을 완료해드리겠습니다.
