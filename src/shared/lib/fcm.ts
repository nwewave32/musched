import { onMessage } from "firebase/messaging";
import { messaging } from "@shared/config/firebase";

/**
 * Foreground 메시지 리스너 설정
 * 앱이 열려있을 때 메시지를 수신합니다
 *
 * 참고: entities 의존성이 있는 FCM 관련 함수들은
 * features/notification/api/notificationApi.ts에 위치합니다.
 */
export const setupForegroundMessageListener = () => {
  if (!messaging) {
    console.log("Messaging not supported, skipping foreground listener");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);

    // notification 필드 우선, 없으면 data에서 추출
    const notificationTitle = payload.notification?.title || payload.data?.title || "MuSched";
    const notificationBody = payload.notification?.body || payload.data?.body || "";
    const notificationOptions = {
      body: notificationBody,
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
