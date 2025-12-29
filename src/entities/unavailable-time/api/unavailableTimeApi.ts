import { db } from "@shared/config/firebase";
import type { UnavailableTime } from "@shared/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const COLLECTION_NAME = "unavailableTimes";

/**
 * 불가 시간 생성
 */
export const createUnavailableTime = async (
  data: Omit<UnavailableTime, "id" | "createdAt">
): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

/**
 * 불가 시간 수정
 */
export const updateUnavailableTime = async (
  id: string,
  data: Partial<Omit<UnavailableTime, "id" | "createdAt">>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
};

/**
 * 불가 시간 삭제
 */
export const deleteUnavailableTime = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

/**
 * 사용자의 불가 시간 목록 조회
 */
export const getUserUnavailableTimes = async (
  userId: string
): Promise<UnavailableTime[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UnavailableTime[];
};

/**
 * 특정 기간의 불가 시간 조회
 */
export const getUnavailableTimesInRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<UnavailableTime[]> => {
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("startTime", ">=", startTimestamp),
    where("startTime", "<=", endTimestamp)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UnavailableTime[];
};

/**
 * 모든 불가 시간 조회 (모든 사용자)
 */
export const getAllUnavailableTimes = async (): Promise<UnavailableTime[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UnavailableTime[];
};
