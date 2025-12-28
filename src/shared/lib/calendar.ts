import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

/**
 * 월간 캘린더에 표시할 날짜 배열 생성 (6주)
 */
export const getCalendarDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

/**
 * 날짜가 현재 보고 있는 월에 속하는지 확인
 */
export const isDateInMonth = (date: Date, monthDate: Date): boolean => {
  return isSameMonth(date, monthDate);
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDayCheck = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

/**
 * 오늘 날짜인지 확인
 */
export const isTodayCheck = (date: Date): boolean => {
  return isToday(date);
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (date: Date, formatString: string): string => {
  return format(date, formatString);
};

/**
 * 다음 달로 이동
 */
export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

/**
 * 이전 달로 이동
 */
export const getPreviousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

/**
 * 요일 이름 배열 (일~토)
 */
export const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 요일 이름 배열 (영문)
 */
export const WEEKDAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
