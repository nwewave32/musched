import { Timestamp } from "firebase/firestore";

// User types
export interface User {
  id: string;
  name: string;
  timezone: string; // IANA timezone (e.g., 'Asia/Seoul', 'Asia/Manila')
  partnerId: string;
  fcmToken?: string;
  createdAt: Timestamp;
}

// Unavailable Time types
export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly';

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
  timezone: string;
  createdAt: Timestamp;
}

// Lesson types
export type LessonStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected';

export interface Lesson {
  id: string;
  proposedBy: string; // userId
  confirmedBy?: string; // userId
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
