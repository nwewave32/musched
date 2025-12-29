import {
  cn,
  formatDate,
  getCalendarDays,
  getUnavailableTimesForDate,
  isDateInMonth,
  isSameDayCheck,
  isTodayCheck,
  WEEKDAY_NAMES_EN,
} from "@shared/lib";
import type { UnavailableTime, Lesson } from "@shared/types";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void;
  unavailableTimes?: UnavailableTime[];
  lessons?: Lesson[];
}

export const CalendarGrid = ({
  currentDate,
  selectedDate,
  onDateClick,
  unavailableTimes = [],
  lessons = [],
}: CalendarGridProps) => {
  // 특정 날짜의 수업 찾기
  const getLessonsForDate = (date: Date): Lesson[] => {
    return lessons.filter((lesson) =>
      isSameDayCheck(lesson.startTime.toDate(), date)
    );
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

              {/* 불가 시간 표시 */}
              <div className="mt-1 space-y-1">
                {getUnavailableTimesForDate(day, unavailableTimes).map(
                  (unavailableTime) => (
                    <div
                      key={unavailableTime.id}
                      className="w-full text-xs p-1 rounded bg-gray-200 text-gray-700 truncate text-left"
                      title={
                        unavailableTime.isAllDay
                          ? "All Day"
                          : `${unavailableTime.startTime
                              .toDate()
                              .toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} - ${unavailableTime.endTime
                              .toDate()
                              .toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                      }
                    >
                      {unavailableTime.isAllDay
                        ? "All Day"
                        : `${unavailableTime.startTime
                            .toDate()
                            .toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} - ${unavailableTime.endTime
                            .toDate()
                            .toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                    </div>
                  )
                )}

                {/* 수업 표시 */}
                {getLessonsForDate(day).map((lesson) => {
                  const statusStyles = {
                    pending: "bg-yellow-50 border-yellow-400 text-yellow-800",
                    confirmed: "bg-green-100 border-green-500 text-green-900",
                    cancelled: "bg-red-50 border-red-400 text-red-800 line-through",
                    rejected: "bg-gray-100 border-gray-400 text-gray-600 line-through",
                  };

                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        "w-full text-xs p-1 rounded border-2 truncate text-left",
                        statusStyles[lesson.status]
                      )}
                      title={`Lesson: ${lesson.startTime
                        .toDate()
                        .toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - ${lesson.endTime
                        .toDate()
                        .toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} (${lesson.status})`}
                    >
                      Lesson: {lesson.startTime
                        .toDate()
                        .toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
