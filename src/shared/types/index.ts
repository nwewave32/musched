import { Timestamp } from "firebase/firestore";

// User types
export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  timezone: string; // IANA timezone (e.g., 'Asia/Seoul', 'Asia/Manila')
  partnerId?: string;
  fcmToken?: string;
  createdAt: Timestamp;
}

// Unavailable Time types
export type RecurrenceType = "none" | "daily" | "weekdays" | "weekly";

export interface Recurrence {
  type: RecurrenceType;
  daysOfWeek?: number[]; // 0(Sunday) ~ 6(Saturday)
}

export interface UnavailableTime {
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  isAllDay: boolean;
  recurrence: Recurrence;
  createdAt: Timestamp;
}

// Lesson types
export type LessonStatus = "pending" | "confirmed" | "cancelled" | "rejected";

export interface Lesson {
  id: string;
  proposedBy: string; // userId
  confirmedBy?: string; // userId
  cancelledBy?: string; // userId - 취소한 사람
  startTime: Timestamp;
  endTime: Timestamp; // startTime + 1 hour
  status: LessonStatus;
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Message types (optional)
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Timestamp;
}
