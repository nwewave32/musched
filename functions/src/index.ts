import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Lesson 인터페이스
 * 참고: src/shared/types/index.ts의 Lesson 타입과 동기화 필요
 * (Firebase Functions는 별도 Node.js 환경이라 클라이언트 타입 직접 import 불가)
 */
interface Lesson {
  proposedBy: string;
  confirmedBy?: string;
  cancelledBy?: string;
  startTime: admin.firestore.Timestamp;
  endTime: admin.firestore.Timestamp;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  cancellationReason?: string;
}

/**
 * Firestore 트리거: lessons 컬렉션 변경 감지
 * 수업 제안, 확정, 취소 시 알림 전송
 */
export const onLessonChange = functions.firestore
  .document("lessons/{lessonId}")
  .onWrite(async (change, context) => {
    const before = change.before.data() as Lesson | undefined;
    const after = change.after.data() as Lesson | undefined;

    // 삭제된 경우 무시
    if (!after) {
      return null;
    }

    // 1. 신규 수업 제안 (onCreate with status='pending')
    if (!before && after.status === "pending") {
      const recipientId = await getPartnerId(after.proposedBy);
      if (!recipientId) {
        console.log(`No partner found for user ${after.proposedBy}`);
        return null;
      }

      return sendNotification({
        type: "lesson_proposed",
        lesson: after,
        recipientId,
        lessonId: context.params.lessonId,
      });
    }

    // 2. 수업 확정 (status: pending → confirmed)
    if (
      before &&
      after &&
      before.status === "pending" &&
      after.status === "confirmed"
    ) {
      return sendNotification({
        type: "lesson_confirmed",
        lesson: after,
        recipientId: after.proposedBy, // 제안자에게 알림
        lessonId: context.params.lessonId,
      });
    }

    // 3. 수업 취소 (status: confirmed → cancelled)
    if (
      before &&
      after &&
      before.status === "confirmed" &&
      after.status === "cancelled"
    ) {
      // cancelledBy가 있으면 취소자가 아닌 상대방에게 알림
      // cancelledBy가 없으면 proposedBy의 파트너에게 알림 (fallback)
      let recipientId: string | null = null;

      if (after.cancelledBy) {
        // 취소자의 파트너에게 알림
        recipientId = await getPartnerId(after.cancelledBy);
      } else {
        // fallback: proposedBy의 파트너에게 알림
        recipientId = await getPartnerId(after.proposedBy);
      }

      if (!recipientId) {
        console.log(`No partner found for cancellation notification`);
        return null;
      }

      return sendNotification({
        type: "lesson_cancelled",
        lesson: after,
        recipientId,
        lessonId: context.params.lessonId,
      });
    }

    return null;
  });

/**
 * Callable Function: 지각 알림 전송
 * 클라이언트에서 직접 호출하여 상대방에게 지각 알림 푸시
 */
export const sendTardinessAlert = functions.https.onCall(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (data, context) => {
    const { lessonId, senderId } = data as {
      lessonId: string;
      senderId: string;
    };

    if (!lessonId || !senderId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "lessonId and senderId are required"
      );
    }

    // 1. 레슨 조회
    const lessonDoc = await admin
      .firestore()
      .collection("lessons")
      .doc(lessonId)
      .get();

    if (!lessonDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Lesson not found");
    }

    const lesson = lessonDoc.data() as Lesson;

    // 2. 레슨 상태 검증
    if (lesson.status !== "confirmed") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Lesson is not confirmed"
      );
    }

    // 3. 현재 시간이 수업 시간 범위인지 검증
    const now = admin.firestore.Timestamp.now();
    if (now < lesson.startTime || now > lesson.endTime) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Current time is not within lesson time"
      );
    }

    // 4. sender 이름 조회
    const senderDoc = await admin
      .firestore()
      .collection("users")
      .doc(senderId)
      .get();
    const senderName = senderDoc.data()?.name || senderDoc.data()?.email || "상대방";

    // 5. 수신자 (sender의 파트너) 조회
    const recipientId = await getPartnerId(senderId);
    if (!recipientId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Partner not found"
      );
    }

    // 6. 알림 전송
    await sendNotification({
      type: "tardiness_alert",
      lesson,
      recipientId,
      lessonId,
      senderName,
    });

    return { success: true };
  }
);

/**
 * 상대방 ID 조회 (partnerId 필드)
 */
async function getPartnerId(userId: string): Promise<string | null> {
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data()?.partnerId || null;
  } catch (error) {
    console.error("Failed to get partner ID:", error);
    return null;
  }
}

/**
 * FCM 푸시 알림 전송
 */
async function sendNotification(params: {
  type: "lesson_proposed" | "lesson_confirmed" | "lesson_cancelled" | "tardiness_alert";
  lesson: Lesson;
  recipientId: string;
  lessonId: string;
  senderName?: string;
}) {
  const { type, lesson, recipientId, lessonId, senderName } = params;

  try {
    // 1. 수신자의 FCM 토큰 조회
    const recipientDoc = await admin
      .firestore()
      .collection("users")
      .doc(recipientId)
      .get();

    if (!recipientDoc.exists) {
      console.log(`User ${recipientId} not found`);
      return null;
    }

    const recipientData = recipientDoc.data();
    const fcmToken = recipientData?.fcmToken;
    const recipientTimezone = recipientData?.timezone || "Asia/Seoul";

    if (!fcmToken) {
      console.log(`No FCM token for user ${recipientId}`);
      return null;
    }

    // 2. 알림 메시지 구성 (수신자의 timezone으로 시간 포맷)
    const messages = {
      lesson_proposed: {
        title: "새로운 수업 제안",
        body: `수업이 제안되었습니다: ${formatDateTime(lesson.startTime, recipientTimezone)}`,
      },
      lesson_confirmed: {
        title: "수업 확정",
        body: `수업이 확정되었습니다: ${formatDateTime(lesson.startTime, recipientTimezone)}`,
      },
      lesson_cancelled: {
        title: "수업 취소",
        body: `수업이 취소되었습니다${
          lesson.cancellationReason ? `: ${lesson.cancellationReason}` : ""
        }`,
      },
      tardiness_alert: {
        title: "수업 지각 알림",
        body: `${senderName || "상대방"}님이 수업 대기 중입니다`,
      },
    };

    const notification = messages[type];

    // notification + data 전송 (iOS PWA는 notification 필드 필수)
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type,
        lessonId,
        clickAction: "/",
      },
      token: fcmToken,
    };

    // 3. FCM 전송
    await admin.messaging().send(message);
    console.log(`✅ Notification sent to ${recipientId}: ${type}`);

    return null;
  } catch (error) {
    console.error("❌ Failed to send notification:", error);
    return null;
  }
}

/**
 * Timestamp를 수신자의 timezone에 맞게 포맷팅
 * @param timestamp - Firestore Timestamp
 * @param timezone - IANA timezone (e.g., 'Asia/Seoul', 'Asia/Manila')
 */
function formatDateTime(
  timestamp: admin.firestore.Timestamp,
  timezone: string
): string {
  const date = timestamp.toDate();
  return date.toLocaleString("ko-KR", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
