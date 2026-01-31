import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
let app;
let database;

try {
  // Firebase 설정 확인
  const isConfigured = Object.values(firebaseConfig).every(
    value => value && value !== 'undefined' && !value.includes('여기에_')
  );

  if (!isConfigured) {
    console.warn('⚠️ Firebase가 설정되지 않았습니다. .env 파일을 확인하세요.');
    console.warn('FIREBASE_SETUP.md 파일을 참고하여 Firebase를 설정하세요.');
  } else {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('✅ Firebase 초기화 완료');
  }
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

export { app, database };
