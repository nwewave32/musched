import { getToken, deleteToken } from "firebase/messaging";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { messaging, VAPID_KEY, db } from "@shared/config/firebase";
import { updateUserProfile, getUserProfile } from "@entities/user/api/userApi";

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

    // Firestore에서 토큰 필드 삭제 (deleteField 사용)
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { fcmToken: deleteField() });
    console.log("FCM token removed from Firestore");
  } catch (error) {
    console.error("Failed to delete FCM token:", error);
    throw error;
  }
};

/**
 * FCM 토큰 갱신 확인 및 업데이트
 * 토큰이 변경되었으면 Firestore에 새 토큰 저장
 * @param userId - 사용자 ID
 * @returns 토큰이 갱신되었으면 true
 */
export const refreshFCMTokenIfNeeded = async (
  userId: string
): Promise<boolean> => {
  if (!messaging) {
    console.log("[FCM] Messaging not supported, skipping token refresh");
    return false;
  }

  // 알림 권한이 없으면 스킵
  if (Notification.permission !== "granted") {
    console.log("[FCM] Notification permission not granted, skipping refresh");
    return false;
  }

  try {
    // 현재 유효한 토큰 가져오기 (변경됐으면 새 토큰 반환)
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (!currentToken) {
      console.log("[FCM] No token available");
      return false;
    }

    // Firestore에 저장된 토큰과 비교
    const userProfile = await getUserProfile(userId);
    const savedToken = userProfile?.fcmToken;

    if (currentToken !== savedToken) {
      await updateUserProfile(userId, { fcmToken: currentToken });
      console.log("✅ [FCM] Token refreshed and saved to Firestore");
      return true;
    }

    console.log("[FCM] Token unchanged, no update needed");
    return false;
  } catch (error) {
    console.error("❌ [FCM] Failed to refresh token:", error);
    return false;
  }
};

/**
 * 앱 visibility 변경 시 토큰 갱신 리스너 설정
 *
 * Visibility 상태:
 * - "visible": 탭이 활성화되어 화면에 보임
 * - "hidden": 탭이 비활성화되거나 최소화됨
 *
 * visible로 변경되는 경우:
 * - 다른 탭에서 이 탭으로 돌아옴
 * - 최소화된 브라우저 복원
 * - PWA 앱이 백그라운드 → 포그라운드
 * - 폰 잠금 해제 후 앱 화면 표시
 *
 * 참고: 앱 완전 종료 후 재실행은 visibilitychange가 아닌 새로운 페이지 로드이므로
 * AuthContext의 onAuthStateChanged에서 refreshFCMTokenIfNeeded()를 별도로 호출함
 *
 * @param userId - 사용자 ID
 * @returns cleanup 함수
 */
export const setupTokenRefreshOnVisibility = (userId: string): (() => void) => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      console.log("[FCM] App became visible, checking token...");
      refreshFCMTokenIfNeeded(userId);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  console.log("[FCM] Visibility change listener setup complete");

  // cleanup 함수 반환
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    console.log("[FCM] Visibility change listener removed");
  };
};
