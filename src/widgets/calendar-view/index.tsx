import { useState } from "react";
import { CalendarHeader } from "./ui/CalendarHeader";
import { CalendarGrid } from "./ui/CalendarGrid";
import { EventDetailPanel } from "./ui/EventDetailPanel";
import type { UnavailableTime, Lesson } from "@shared/types";

interface CalendarViewProps {
  unavailableTimes?: UnavailableTime[];
  lessons?: Lesson[];
  userId: string;
  onEventUpdate?: () => void;
}

export const CalendarView = ({
  unavailableTimes = [],
  lessons = [],
  userId,
  onEventUpdate,
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClose = () => {
    setSelectedDate(undefined);
  };

  return (
    <div className="w-full space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
        unavailableTimes={unavailableTimes}
        lessons={lessons}
      />
      {selectedDate && (
        <EventDetailPanel
          selectedDate={selectedDate}
          unavailableTimes={unavailableTimes}
          lessons={lessons}
          userId={userId}
          onClose={handleEventClose}
          onUpdate={onEventUpdate}
        />
      )}
    </div>
  );
};
