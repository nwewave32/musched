import { isSameDay, getDay } from "date-fns";
import type { UnavailableTime } from "@shared/types";

/**
 * 특정 날짜에 해당하는 불가 시간 찾기
 */
export const getUnavailableTimesForDate = (
  date: Date,
  unavailableTimes: UnavailableTime[]
): UnavailableTime[] => {
  return unavailableTimes.filter((time) => {
    const startDate = time.startTime.toDate();

    // 반복 없음: 시작 날짜와 정확히 일치
    if (time.recurrence.type === "none") {
      return isSameDay(startDate, date);
    }

    // 매일 반복: 시작 날짜 이후의 모든 날짜
    if (time.recurrence.type === "daily") {
      return date >= startDate;
    }

    // 평일 반복: 시작 날짜 이후의 평일 (월~금)
    if (time.recurrence.type === "weekdays") {
      const dayOfWeek = getDay(date);
      return date >= startDate && dayOfWeek >= 1 && dayOfWeek <= 5;
    }

    // 매주 반복: 시작 날짜 이후의 선택된 요일
    if (time.recurrence.type === "weekly" && time.recurrence.daysOfWeek) {
      const dayOfWeek = getDay(date);
      return (
        date >= startDate && time.recurrence.daysOfWeek.includes(dayOfWeek)
      );
    }

    return false;
  });
};
