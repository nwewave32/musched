import { formatInTimeZone } from "date-fns-tz";
import { Timestamp } from "firebase/firestore";

/**
 * Firebase Timestamp를 특정 시간대의 날짜 문자열로 변환
 */
export const formatTimestampToTimezone = (
  timestamp: Timestamp,
  timezone: string,
  formatString: string = "yyyy-MM-dd HH:mm"
): string => {
  const date = timestamp.toDate();
  return formatInTimeZone(date, timezone, formatString);
};

/**
 * 현재 시간을 Firebase Timestamp로 변환
 */
export const nowTimestamp = (): Timestamp => {
  return Timestamp.now();
};

/**
 * Date 객체를 Firebase Timestamp로 변환
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Firebase Timestamp를 Date 객체로 변환
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};
