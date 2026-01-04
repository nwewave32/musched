import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// Firebase 설정 - 환경변수로 관리 권장
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
export const app = initializeApp(firebaseConfig);

// Firebase 서비스
export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging은 지원되는 경우에만 초기화
let messaging: ReturnType<typeof getMessaging> | null = null;

console.log("🔥 [Firebase] Checking messaging support...");
console.log("🔥 [Firebase] User Agent:", navigator.userAgent);
console.log("🔥 [Firebase] Service Worker support:", "serviceWorker" in navigator);

isSupported()
  .then((supported) => {
    console.log("🔥 [Firebase] Messaging supported:", supported);
    if (supported) {
      messaging = getMessaging(app);
      console.log("✅ [Firebase] Messaging initialized successfully!");
    } else {
      console.error("❌ [Firebase] Messaging is NOT supported on this device/browser");
      console.error("❌ [Firebase] Possible reasons:");
      console.error("  - iOS version < 16.4");
      console.error("  - Not running as PWA (must use home screen icon)");
      console.error("  - Service Worker not supported");
      console.error("  - Third-party cookies disabled");
    }
  })
  .catch((error) => {
    console.error("❌ [Firebase] Error checking messaging support:", error);
  });

export { messaging };
