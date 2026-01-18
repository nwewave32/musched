// Firebase Messaging Service Worker
// Background 메시지를 처리합니다 (앱이 닫혀있거나 백그라운드일 때)

importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js');

// Firebase 초기화
firebase.initializeApp({
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "musched.firebaseapp.com",
  projectId: "musched",
  storageBucket: "musched.firebasestorage.app",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__"
});

const messaging = firebase.messaging();

// Background 메시지 핸들러
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'MuSched';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/pwa-192x192.png',
    badge: '/favicon-32x32.png',
    data: payload.data || {},
    tag: payload.data?.lessonId || 'default',
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 핸들러
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);

  event.notification.close();

  const notificationData = event.notification.data;

  // 클릭 시 앱 열기 (캘린더 페이지로 이동)
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 창이 있으면 포커스하고 메시지 전송
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          // 클라이언트에게 데이터 새로고침 요청
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: notificationData
          });
          return client.focus();
        }
      }
      // 없으면 새 창 열기 (URL 파라미터로 새로고침 트리거)
      if (clients.openWindow) {
        return clients.openWindow('/?refresh=true');
      }
    })
  );
});
