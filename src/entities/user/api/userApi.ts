import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@shared/config/firebase";
import type { User } from "@shared/types";

const COLLECTION_NAME = "users";

/**
 * 사용자 프로필 조회
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as User;
};

/**
 * 사용자 프로필 생성
 */
export const createUserProfile = async (
  userId: string,
  data: Omit<User, "id" | "createdAt">
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
};

/**
 * 사용자 프로필 수정
 */
export const updateUserProfile = async (
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  await updateDoc(docRef, data);
};

/**
 * 사용자 프로필 실시간 구독
 */
export const subscribeToUserProfile = (
  userId: string,
  onUpdate: (user: User | null) => void
): (() => void) => {
  const docRef = doc(db, COLLECTION_NAME, userId);
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      onUpdate(null);
      return;
    }
    onUpdate({
      id: docSnap.id,
      ...docSnap.data(),
    } as User);
  });
};
