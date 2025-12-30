import { isSameDay, getDay, startOfDay, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import type { UnavailableTime } from "@shared/types";
import { Timestamp } from "firebase/firestore";

/**
 * 특정 날짜에 해당하는 불가 시간 찾기
 * recurring event의 경우 해당 날짜에 맞게 시간을 조정하여 반환
 */
export const getUnavailableTimesForDate = (
  date: Date,
  unavailableTimes: UnavailableTime[]
): UnavailableTime[] => {
  const result: UnavailableTime[] = [];

  unavailableTimes.forEach((time) => {
    const startDate = time.startTime.toDate();

    // 시간 제거하고 날짜만 비교
    const dateOnly = startOfDay(date);
    const startDateOnly = startOfDay(startDate);

    let shouldInclude = false;

    // 반복 없음: 시작 날짜와 정확히 일치
    if (time.recurrence.type === "none") {
      shouldInclude = isSameDay(startDate, date);
    }

    // 매일 반복: 시작 날짜 이후의 모든 날짜 (시작일 포함)
    else if (time.recurrence.type === "daily") {
      shouldInclude = dateOnly >= startDateOnly;
    }

    // 평일 반복: 시작 날짜 이후의 평일 (월~금, 시작일 포함)
    else if (time.recurrence.type === "weekdays") {
      const dayOfWeek = getDay(date);
      shouldInclude = dateOnly >= startDateOnly && dayOfWeek >= 1 && dayOfWeek <= 5;
    }

    // 매주 반복: 시작 날짜 이후의 선택된 요일 (시작일 포함)
    else if (time.recurrence.type === "weekly" && time.recurrence.daysOfWeek) {
      const dayOfWeek = getDay(date);
      shouldInclude = dateOnly >= startDateOnly && time.recurrence.daysOfWeek.includes(dayOfWeek);
    }

    if (shouldInclude) {
      // recurring event의 경우 target date에 맞게 시간을 조정
      if (time.recurrence.type !== "none" && !isSameDay(startDate, date)) {
        const originalStart = time.startTime.toDate();
        const originalEnd = time.endTime.toDate();

        // target date에 원본의 시간(hour, minute)을 적용
        let adjustedStart = setHours(date, originalStart.getHours());
        adjustedStart = setMinutes(adjustedStart, originalStart.getMinutes());
        adjustedStart = setSeconds(adjustedStart, 0);
        adjustedStart = setMilliseconds(adjustedStart, 0);

        let adjustedEnd = setHours(date, originalEnd.getHours());
        adjustedEnd = setMinutes(adjustedEnd, originalEnd.getMinutes());
        adjustedEnd = setSeconds(adjustedEnd, 0);
        adjustedEnd = setMilliseconds(adjustedEnd, 0);

        // 조정된 시간으로 새로운 객체 생성
        result.push({
          ...time,
          startTime: Timestamp.fromDate(adjustedStart),
          endTime: Timestamp.fromDate(adjustedEnd),
        });
      } else {
        // 반복 없거나 원본 날짜인 경우 그대로 반환
        result.push(time);
      }
    }
  });

  return result;
};
