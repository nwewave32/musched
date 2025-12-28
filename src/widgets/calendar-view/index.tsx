import { useState } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // TODO: 날짜 클릭 시 상세 정보 표시
    console.log("Selected date:", date);
  };

  return (
    <div className="w-full">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
      />
    </div>
  );
};
