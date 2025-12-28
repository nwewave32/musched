import { cn } from "@shared/lib";
import {
  getCalendarDays,
  isDateInMonth,
  isSameDayCheck,
  isTodayCheck,
  formatDate,
  WEEKDAY_NAMES,
} from "@shared/lib";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void;
}

export const CalendarGrid = ({
  currentDate,
  selectedDate,
  onDateClick,
}: CalendarGridProps) => {
  const calendarDays = getCalendarDays(currentDate);

  return (
    <div className="w-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {WEEKDAY_NAMES.map((day, index) => (
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
            <button
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={cn(
                "relative min-h-[80px] bg-white p-2 text-left transition-colors",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
                !isCurrentMonth && "bg-gray-50 text-gray-400",
                isSelected && "bg-blue-50 ring-2 ring-inset ring-blue-500",
              )}
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

              {/* 이벤트 표시 영역 (나중에 추가) */}
              <div className="mt-1 space-y-1">
                {/* 여기에 수업, 불가 시간 등을 표시 */}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
