import { onMessage } from "firebase/messaging";
import { messaging } from "@shared/config/firebase";

/**
 * 포그라운드 알림 클릭 시 발생하는 커스텀 이벤트 타입
 */
export const FOREGROUND_NOTIFICATION_CLICK_EVENT = "foreground-notification-click";

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

    // 브라우저 알림 표시
    if (Notification.permission === "granted") {
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: "/pwa-192x192.png",
        badge: "/favicon-32x32.png",
        data: payload.data,
      });

      // 알림 클릭 핸들러 - 데이터 리로딩 트리거
      notification.onclick = () => {
        console.log("Foreground notification clicked, triggering data refresh");
        notification.close();

        // 윈도우 포커스
        window.focus();

        // 커스텀 이벤트 발생 - CalendarPage에서 수신하여 데이터 리로딩
        window.dispatchEvent(
          new CustomEvent(FOREGROUND_NOTIFICATION_CLICK_EVENT, {
            detail: payload.data,
          })
        );
      };
    }
  });

  console.log("Foreground message listener setup complete");
};
