import { Button } from "@shared/ui";
import { formatDate, getNextMonth, getPreviousMonth } from "@shared/lib";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarHeader = ({
  currentDate,
  onDateChange,
}: CalendarHeaderProps) => {
  const handlePreviousMonth = () => {
    onDateChange(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    onDateChange(getNextMonth(currentDate));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {formatDate(currentDate, "yyyy년 M월")}
        </h2>
        <Button variant="outline" size="sm" onClick={handleToday}>
          오늘
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousMonth}
          aria-label="이전 달"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          aria-label="다음 달"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
