# 🔥 Firebase 설정 완벽 가이드 (초보자용)

Firebase를 처음 사용하시는 분들을 위한 **단계별 상세 가이드**입니다.

---

## 📝 목차

1. [Firebase 계정 만들기](#1-firebase-계정-만들기)
2. [프로젝트 생성하기](#2-프로젝트-생성하기)
3. [웹 앱 등록하기](#3-웹-앱-등록하기)
4. [Realtime Database 설정](#4-realtime-database-설정)
5. [보안 규칙 설정](#5-보안-규칙-설정)
6. [환경 변수 설정](#6-환경-변수-설정)

---

## 1. Firebase 계정 만들기

### 1-1. Firebase 콘솔 접속

1. **브라우저를 열고** 아래 주소로 이동:
   ```
   https://console.firebase.google.com
   ```

2. **Google 계정으로 로그인**
   - Gmail 계정이 있으면 바로 로그인
   - 없으면 "계정 만들기" 클릭해서 구글 계정 먼저 생성

3. **로그인 성공하면** Firebase 콘솔 메인 화면 표시

---

## 2. 프로젝트 생성하기

### 2-1. 새 프로젝트 만들기

1. **"프로젝트 추가" 버튼 클릭**
   - 화면 중앙의 큰 "+" 버튼 또는
   - 좌측 상단 "프로젝트 추가" 클릭

2. **프로젝트 이름 입력**
   ```
   프로젝트 이름: what-to-eat
   (또는 원하는 이름)
   ```
   - 입력 후 "계속" 클릭

3. **Google 애널리틱스 설정**
   - "이 프로젝트에 Google 애널리틱스 사용 설정" 스위치 **끄기** (초보자는 불필요)
   - "프로젝트 만들기" 클릭

4. **프로젝트 생성 대기**
   - 30초~1분 정도 소요
   - "프로젝트가 준비되었습니다" 메시지 표시
   - "계속" 클릭

---

## 3. 웹 앱 등록하기

### 3-1. 웹 플랫폼 추가

1. **프로젝트 개요 페이지에서**
   - 중앙에 "시작하려면 앱을 추가하세요" 메시지
   - **웹 아이콘 `</>`** 클릭

2. **앱 닉네임 입력**
   ```
   앱 닉네임: what-to-eat-web
   ```
   - "Firebase 호스팅 설정" 체크박스는 **체크하지 않음**
   - "앱 등록" 클릭

3. **Firebase SDK 추가**
   - 화면에 코드가 표시됨 (잠깐 기다려주세요, 나중에 자동으로 설정됩니다)
   - 지금은 그냥 "콘솔로 이동" 클릭

---

## 4. Realtime Database 설정

### 4-1. Realtime Database 만들기

1. **좌측 메뉴에서**
   - "빌드" (Build) 섹션 펼치기
   - **"Realtime Database"** 클릭

2. **"데이터베이스 만들기" 버튼 클릭**

3. **데이터베이스 위치 선택**
   - 드롭다운에서 선택:
   ```
   asia-southeast1 (싱가포르)
   ```
   - 한국과 가장 가까운 서버
   - "다음" 클릭

4. **보안 규칙 시작 모드 선택**
   - **"테스트 모드에서 시작"** 선택
   - ⚠️ 주의: 30일 후 자동으로 비활성화됨 (나중에 수정 가능)
   - "사용 설정" 클릭

5. **데이터베이스 생성 완료**
   - 빈 데이터베이스 화면 표시
   - URL 확인: `https://프로젝트이름-default-rtdb.asia-southeast1.firebasedatabase.app`

---

## 5. 보안 규칙 설정

### 5-1. 규칙 수정 (중요!)

1. **"규칙" 탭 클릭**
   - Realtime Database 페이지 상단의 "데이터" 옆에 "규칙" 탭

2. **기존 규칙을 다음으로 변경:**

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt"]
      }
    }
  }
}
```

3. **"게시" 버튼 클릭**
   - 경고 메시지 무시하고 "게시" 확인

**설명:**
- `rooms`: 투표방 데이터 저장 위치
- `.read: true`: 누구나 읽기 가능
- `.write: true`: 누구나 쓰기 가능 (개발용)
- `.indexOn`: 성능 최적화

⚠️ **주의**: 프로덕션 배포 시 더 강력한 보안 규칙 필요

---

## 6. 환경 변수 설정

### 6-1. Firebase 설정 정보 복사

1. **프로젝트 설정 열기**
   - 좌측 상단 톱니바퀴 ⚙️ 아이콘 클릭
   - "프로젝트 설정" 선택

2. **스크롤 다운** → "내 앱" 섹션으로 이동

3. **SDK 설정 및 구성 섹션**
   - "구성" 라디오 버튼 선택
   - 아래와 같은 코드 표시:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "what-to-eat-xxxxx.firebaseapp.com",
  databaseURL: "https://what-to-eat-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "what-to-eat-xxxxx",
  storageBucket: "what-to-eat-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. **값들을 복사해서 메모장에 저장**
   - 7개의 값이 있습니다
   - 각각 나중에 사용됩니다

### 6-2. .env 파일 수정

프로젝트 폴더의 `.env` 파일을 열어서 **아래 내용 추가**:

```env
# 카카오 지도 API 키 (기존)
VITE_KAKAO_APP_KEY=여기에_발급받은_JavaScript_키_입력

# Firebase 설정 (새로 추가)
VITE_FIREBASE_API_KEY=여기에_apiKey_값_붙여넣기
VITE_FIREBASE_AUTH_DOMAIN=여기에_authDomain_값_붙여넣기
VITE_FIREBASE_DATABASE_URL=여기에_databaseURL_값_붙여넣기
VITE_FIREBASE_PROJECT_ID=여기에_projectId_값_붙여넣기
VITE_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_값_붙여넣기
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_값_붙여넣기
VITE_FIREBASE_APP_ID=여기에_appId_값_붙여넣기
```

**예시:**
```env
VITE_FIREBASE_API_KEY=AIzaSyD1234567890abcdefghijklmnop
VITE_FIREBASE_AUTH_DOMAIN=what-to-eat-12345.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://what-to-eat-12345-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=what-to-eat-12345
VITE_FIREBASE_STORAGE_BUCKET=what-to-eat-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## 7. 완료 확인

### 7-1. 체크리스트

- ✅ Firebase 계정 생성
- ✅ 프로젝트 생성 (what-to-eat)
- ✅ 웹 앱 등록
- ✅ Realtime Database 생성 (asia-southeast1)
- ✅ 보안 규칙 설정
- ✅ `.env` 파일에 Firebase 설정 추가

### 7-2. 테스트

설정이 완료되면 **개발 서버 재시작 필요**:

```bash
# 현재 서버 종료 (Ctrl + C)
# 서버 재시작
npm run dev
```

---

## 🆘 문제 해결

### Q1. "권한이 거부되었습니다" 오류
**A:** 보안 규칙이 올바르게 설정되지 않았습니다.
- Firebase 콘솔 → Realtime Database → 규칙 탭
- 위의 5단계 규칙으로 다시 설정

### Q2. "프로젝트를 찾을 수 없습니다" 오류
**A:** `.env` 파일의 Firebase 설정 확인
- 따옴표 없이 값만 입력했는지 확인
- 공백이나 줄바꿈 없는지 확인

### Q3. 데이터베이스 URL이 다름
**A:** Realtime Database 위치에 따라 URL 형식이 다릅니다
- asia-southeast1: `https://프로젝트-default-rtdb.asia-southeast1.firebasedatabase.app`
- us-central1: `https://프로젝트-default-rtdb.firebaseio.com`
- 복사한 URL을 그대로 사용하세요

### Q4. 무료 플랜 제한
**A:** Firebase Spark (무료) 플랜 제한:
- Realtime Database: 1GB 저장공간
- 동시 연결: 100명
- **충분합니다!** 개인 프로젝트로 사용 가능

---

## 📞 도움이 필요하면

설정 중 막히는 부분이 있으면 알려주세요!
- 스크린샷을 보내주시면 더 정확히 도와드릴 수 있습니다.
- 어떤 단계에서 막혔는지 말씀해주세요.

---

**다음 단계:** Firebase 설정이 완료되면 코드가 자동으로 연동됩니다! 🚀
