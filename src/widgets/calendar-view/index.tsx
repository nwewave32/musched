import { useState } from "react";
import { CalendarHeader } from "./ui/CalendarHeader";
import { CalendarGrid } from "./ui/CalendarGrid";
import type { UnavailableTime } from "@shared/types";

interface CalendarViewProps {
  unavailableTimes?: UnavailableTime[];
}

export const CalendarView = ({ unavailableTimes = [] }: CalendarViewProps) => {
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
        unavailableTimes={unavailableTimes}
      />
    </div>
  );
};
