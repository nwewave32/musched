import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface Lesson {
  proposedBy: string;
  confirmedBy?: string;
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
      // 취소하지 않은 사람에게 알림 (confirmedBy 또는 proposedBy)
      const recipientId = after.confirmedBy || after.proposedBy;

      return sendNotification({
        type: "lesson_cancelled",
        lesson: after,
        recipientId: recipientId!,
        lessonId: context.params.lessonId,
      });
    }

    return null;
  });

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
  type: "lesson_proposed" | "lesson_confirmed" | "lesson_cancelled";
  lesson: Lesson;
  recipientId: string;
  lessonId: string;
}) {
  const { type, lesson, recipientId, lessonId } = params;

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

    const fcmToken = recipientDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token for user ${recipientId}`);
      return null;
    }

    // 2. 알림 메시지 구성
    const messages = {
      lesson_proposed: {
        title: "새로운 수업 제안",
        body: `수업이 제안되었습니다: ${formatDateTime(lesson.startTime)}`,
      },
      lesson_confirmed: {
        title: "수업 확정",
        body: `수업이 확정되었습니다: ${formatDateTime(lesson.startTime)}`,
      },
      lesson_cancelled: {
        title: "수업 취소",
        body: `수업이 취소되었습니다${
          lesson.cancellationReason ? `: ${lesson.cancellationReason}` : ""
        }`,
      },
    };

    const notification = messages[type];

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
 * Timestamp를 한국어 형식으로 포맷팅
 */
function formatDateTime(timestamp: admin.firestore.Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
