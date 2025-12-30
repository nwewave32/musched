import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
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
 * 날짜와 시간 문자열을 특정 타임존의 시간으로 해석하여 UTC Date 객체 생성
 * @param dateString - "2025-12-30" 형식
 * @param timeString - "21:00" 형식
 * @param timezone - IANA 타임존 (예: "Asia/Manila", "Asia/Seoul")
 * @returns UTC로 변환된 Date 객체
 */
export const createDateInTimezone = (
  dateString: string,
  timeString: string,
  timezone: string
): Date => {
  // 1. 날짜와 시간을 결합한 문자열 생성
  const dateTimeString = `${dateString}T${timeString}:00`;

  // 2. 타임존을 고려하지 않고 일단 Date 객체 생성 (로컬 시간으로 해석됨)
  const localDate = new Date(dateTimeString);

  // 3. 이 시간을 지정된 타임존의 시간으로 해석하고 UTC로 변환
  const utcDate = fromZonedTime(localDate, timezone);

  return utcDate;
};

/**
 * UTC Timestamp를 특정 타임존의 로컬 시간으로 변환
 * @param timestamp - Firebase Timestamp
 * @param timezone - IANA 타임존
 * @returns 타임존이 적용된 Date 객체
 */
export const timestampToZonedDate = (
  timestamp: Timestamp,
  timezone: string
): Date => {
  const utcDate = timestamp.toDate();
  return toZonedTime(utcDate, timezone);
};

/**
 * Timestamp를 특정 타임존의 시간 문자열로 변환
 * @param timestamp - Firebase Timestamp
 * @param timezone - IANA 타임존 (선택사항, 없으면 브라우저 타임존 사용)
 * @returns "HH:mm" 형식의 시간 문자열
 */
export const formatTimeInTimezone = (
  timestamp: Timestamp,
  timezone?: string
): string => {
  if (!timezone) {
    // 타임존 정보가 없으면 브라우저 타임존 사용
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 사용자 타임존으로 변환
  const zonedDate = timestampToZonedDate(timestamp, timezone);
  return zonedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
