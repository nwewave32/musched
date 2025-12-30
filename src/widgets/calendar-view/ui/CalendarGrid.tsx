import {
  cn,
  formatDate,
  getCalendarDays,
  getUnavailableTimesForDate,
  isDateInMonth,
  isSameDayCheck,
  isTodayCheck,
  WEEKDAY_NAMES_EN,
  formatTimeInTimezone,
} from "@shared/lib";
import type { UnavailableTime, Lesson } from "@shared/types";
import { Timestamp } from "firebase/firestore";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void;
  unavailableTimes?: UnavailableTime[];
  lessons?: Lesson[];
  userTimezone?: string;
}

export const CalendarGrid = ({
  currentDate,
  selectedDate,
  onDateClick,
  unavailableTimes = [],
  lessons = [],
  userTimezone,
}: CalendarGridProps) => {

  // 특정 날짜의 수업 찾기
  const getLessonsForDate = (date: Date): Lesson[] => {
    return lessons.filter((lesson) =>
      isSameDayCheck(lesson.startTime.toDate(), date)
    );
  };

  // 겹치는 unavailable times를 합치는 함수
  const mergeUnavailableTimes = (times: UnavailableTime[]) => {
    if (times.length === 0) return [];

    // All Day와 일반 시간을 분리
    const allDayTimes = times.filter(t => t.isAllDay);
    const regularTimes = times.filter(t => !t.isAllDay);

    const merged: Array<{ startTime: Date; endTime: Date; isAllDay: boolean }> = [];

    // All Day는 하나로 표시
    if (allDayTimes.length > 0) {
      merged.push({
        startTime: allDayTimes[0].startTime.toDate(),
        endTime: allDayTimes[0].endTime.toDate(),
        isAllDay: true,
      });
    }

    if (regularTimes.length === 0) return merged;

    // 일반 시간들을 시작 시간 기준으로 정렬
    const sorted = [...regularTimes].sort(
      (a, b) => a.startTime.toDate().getTime() - b.startTime.toDate().getTime()
    );

    let current = {
      startTime: sorted[0].startTime.toDate(),
      endTime: sorted[0].endTime.toDate(),
      isAllDay: false,
    };

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      const nextStart = next.startTime.toDate();
      const nextEnd = next.endTime.toDate();

      // 현재 구간과 겹치거나 연속되는지 확인
      if (nextStart <= current.endTime) {
        // 겹치면 end를 더 늦은 시간으로 업데이트
        if (nextEnd > current.endTime) {
          current.endTime = nextEnd;
        }
      } else {
        // 겹치지 않으면 현재 구간을 저장하고 새 구간 시작
        merged.push({ ...current });
        current = {
          startTime: nextStart,
          endTime: nextEnd,
          isAllDay: false,
        };
      }
    }

    // 마지막 구간 추가
    merged.push(current);

    return merged;
  };

  const calendarDays = getCalendarDays(currentDate);

  return (
    <div className="w-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {WEEKDAY_NAMES_EN.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-semibold py-2",
              index === 0 ? "text-red-600" : "text-gray-700", // 일요일은 빨간색
              index === 6 && "text-blue-600" // 토요일은 파란색
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isDateInMonth(day, currentDate);
          const isSelected = selectedDate && isSameDayCheck(day, selectedDate);
          const isCurrentDay = isTodayCheck(day);
          const isSunday = index % 7 === 0;
          const isSaturday = index % 7 === 6;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={cn(
                "relative min-h-[80px] bg-white p-2 text-left transition-colors cursor-pointer",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
                !isCurrentMonth && "bg-gray-50 text-gray-400",
                isSelected && "bg-blue-50 ring-2 ring-inset ring-blue-500"
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDateClick?.(day);
                }
              }}
            >
              {/* 날짜 숫자 */}
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                  isSunday && isCurrentMonth && "text-red-600",
                  isSaturday && isCurrentMonth && "text-blue-600",
                  isCurrentDay && "bg-blue-600 text-white font-bold",
                  !isCurrentDay && !isSunday && !isSaturday && "text-gray-900"
                )}
              >
                {formatDate(day, "d")}
              </span>

              {/* 수업 표시 */}
              <div className="mt-1 space-y-1">
                {getLessonsForDate(day).map((lesson) => {
                  const statusStyles = {
                    pending: "bg-yellow-50 border-yellow-400 text-yellow-800",
                    confirmed: "bg-green-100 border-green-500 text-green-900",
                    cancelled: "bg-red-50 border-red-400 text-red-800 line-through",
                    rejected: "bg-gray-100 border-gray-400 text-gray-600 line-through",
                  };

                  const lessonTimeRange = `${formatTimeInTimezone(lesson.startTime, userTimezone)} - ${formatTimeInTimezone(lesson.endTime, userTimezone)}`;

                  // 확정된 수업이 날짜가 지났으면 완료로 표시
                  const isCompleted = lesson.status === "confirmed" && lesson.endTime.toDate() < new Date();

                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        "w-full text-xs p-1 rounded border-2 truncate text-left",
                        statusStyles[lesson.status]
                      )}
                      title={`${isCompleted ? "✅ " : ""}Lesson: ${lessonTimeRange} (${lesson.status})`}
                    >
                      {isCompleted ? "✅ " : ""}Lesson: {formatTimeInTimezone(lesson.startTime, userTimezone)}
                    </div>
                  );
                })}

                {/* 불가 시간 표시 (합쳐진 시간 블럭) */}
                {mergeUnavailableTimes(getUnavailableTimesForDate(day, unavailableTimes)).map(
                  (mergedTime, index) => {
                    const timeRange = mergedTime.isAllDay
                      ? "All Day"
                      : `${formatTimeInTimezone(Timestamp.fromDate(mergedTime.startTime), userTimezone)} - ${formatTimeInTimezone(Timestamp.fromDate(mergedTime.endTime), userTimezone)}`;

                    return (
                      <div
                        key={`merged-${index}`}
                        className="w-full text-xs p-1 rounded bg-gray-200 text-gray-700 truncate text-left"
                        title={timeRange}
                      >
                        {timeRange}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
