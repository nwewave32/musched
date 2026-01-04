import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { messaging } from "@shared/config/firebase";
import { updateUserProfile } from "@entities/user/api/userApi";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * FCM 푸시 알림 권한 요청 및 토큰 생성
 * @param userId - 사용자 ID
 * @returns 성공 여부
 */
export const requestNotificationPermission = async (
  userId: string
): Promise<boolean> => {
  try {
    console.log("🔔 [FCM] Starting notification permission request...");
    console.log("🔔 [FCM] User ID:", userId);
    console.log("🔔 [FCM] Messaging object:", messaging);
    console.log("🔔 [FCM] VAPID_KEY:", VAPID_KEY ? "✅ Set" : "❌ Not set");

    if (!messaging) {
      console.error("❌ [FCM] Messaging not supported in this browser");
      alert("Push notifications are not supported in this browser.");
      return false;
    }

    // 1. 브라우저 알림 권한 요청
    console.log("🔔 [FCM] Requesting browser notification permission...");
    const permission = await Notification.requestPermission();
    console.log("🔔 [FCM] Permission result:", permission);

    if (permission !== "granted") {
      console.log("❌ [FCM] Notification permission denied");
      alert("Notification permission was denied. Please allow notifications in your browser settings.");
      return false;
    }

    // 2. FCM 토큰 생성
    console.log("🔔 [FCM] Generating FCM token...");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("🔔 [FCM] Token generated:", token ? "✅ Success" : "❌ Failed");

    if (!token) {
      console.error("❌ [FCM] Failed to get FCM token");
      alert("Failed to generate FCM token. Please check console for details.");
      return false;
    }

    console.log("✅ [FCM] Token:", token);

    // 3. Firestore에 토큰 저장
    console.log("🔔 [FCM] Saving token to Firestore...");
    await updateUserProfile(userId, { fcmToken: token });
    console.log("✅ [FCM] Token saved to Firestore successfully!");

    alert("Push notifications enabled successfully!");
    return true;
  } catch (error) {
    console.error("❌ [FCM] Error during permission request:", error);
    alert(`Failed to enable notifications: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
};

/**
 * Foreground 메시지 리스너 설정
 * 앱이 열려있을 때 메시지를 수신합니다
 */
export const setupForegroundMessageListener = () => {
  if (!messaging) {
    console.log("Messaging not supported, skipping foreground listener");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    // 알림 표시
    const notificationTitle = payload.notification?.title || "MuSched";
    const notificationOptions = {
      body: payload.notification?.body || "",
      icon: "/pwa-192x192.png",
      badge: "/favicon-32x32.png",
      data: payload.data,
    };

    // 브라우저 알림 표시
    if (Notification.permission === "granted") {
      new Notification(notificationTitle, notificationOptions);
    }
  });

  console.log("Foreground message listener setup complete");
};

/**
 * FCM 토큰 삭제 및 Firestore 업데이트
 * @param userId - 사용자 ID
 */
export const deleteFCMToken = async (userId: string): Promise<void> => {
  try {
    if (!messaging) {
      console.log("Messaging not supported");
      return;
    }

    // FCM 토큰 삭제
    await deleteToken(messaging);
    console.log("FCM token deleted");

    // Firestore에서 토큰 제거
    await updateUserProfile(userId, { fcmToken: undefined });
    console.log("FCM token removed from Firestore");
  } catch (error) {
    console.error("Failed to delete FCM token:", error);
    throw error;
  }
};
