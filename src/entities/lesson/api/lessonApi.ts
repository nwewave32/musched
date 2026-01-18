import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@shared/config/firebase";
import type { Lesson } from "@shared/types";

const COLLECTION_NAME = "lessons";

/**
 * 수업 생성
 */
export const createLesson = async (
  data: Omit<Lesson, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

/**
 * 수업 수정
 */
export const updateLesson = async (
  id: string,
  data: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);

  // 현재 수업 상태 확인
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("Lesson not found");
  }

  const lesson = docSnap.data() as Lesson;

  // 확정된 수업은 수정 불가
  if (lesson.status === "confirmed") {
    throw new Error("Cannot update a confirmed lesson");
  }

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

/**
 * 수업 삭제
 */
export const deleteLesson = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);

  // 현재 수업 상태 확인
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("Lesson not found");
  }

  const lesson = docSnap.data() as Lesson;

  // 확정된 수업은 삭제 불가
  if (lesson.status === "confirmed") {
    throw new Error("Cannot delete a confirmed lesson");
  }

  await deleteDoc(docRef);
};

/**
 * 사용자 관련 수업 목록 조회 (제안했거나 확인한 수업)
 */
export const getUserLessons = async (userId: string): Promise<Lesson[]> => {
  // proposedBy로 조회
  const q1 = query(
    collection(db, COLLECTION_NAME),
    where("proposedBy", "==", userId)
  );

  // confirmedBy로 조회
  const q2 = query(
    collection(db, COLLECTION_NAME),
    where("confirmedBy", "==", userId)
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  const lessons = new Map<string, Lesson>();

  snapshot1.docs.forEach((doc) => {
    lessons.set(doc.id, { id: doc.id, ...doc.data() } as Lesson);
  });

  snapshot2.docs.forEach((doc) => {
    if (!lessons.has(doc.id)) {
      lessons.set(doc.id, { id: doc.id, ...doc.data() } as Lesson);
    }
  });

  return Array.from(lessons.values());
};

/**
 * 특정 기간의 수업 조회
 */
export const getLessonsInRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Lesson[]> => {
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const q = query(
    collection(db, COLLECTION_NAME),
    where("startTime", ">=", startTimestamp),
    where("startTime", "<=", endTimestamp)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Lesson))
    .filter(
      (lesson) =>
        lesson.proposedBy === userId || lesson.confirmedBy === userId
    );
};

/**
 * 모든 수업 조회 (모든 사용자)
 */
export const getAllLessons = async (): Promise<Lesson[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Lesson[];
};

/**
 * 수업 취소
 */
export const cancelLesson = async (
  id: string,
  cancellationReason: string,
  cancelledBy: string
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);

  // 현재 수업 상태 확인
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("Lesson not found");
  }

  const lesson = docSnap.data() as Lesson;

  // confirmed 상태인 수업만 취소 가능
  if (lesson.status !== "confirmed") {
    throw new Error("Only confirmed lessons can be cancelled");
  }

  await updateDoc(docRef, {
    status: "cancelled",
    cancellationReason,
    cancelledBy,
    updatedAt: Timestamp.now(),
  });
};
