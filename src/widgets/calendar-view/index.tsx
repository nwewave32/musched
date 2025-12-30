import { useState, useEffect } from "react";
import { CalendarHeader } from "./ui/CalendarHeader";
import { CalendarGrid } from "./ui/CalendarGrid";
import { EventDetailPanel } from "./ui/EventDetailPanel";
import { getUserProfile } from "@entities/user/api";
import type { UnavailableTime, Lesson, User } from "@shared/types";

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
  const [user, setUser] = useState<User | null>(null);

  // 현재 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const userProfile = await getUserProfile(userId);
      setUser(userProfile);
    };
    fetchUser();
  }, [userId]);

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
        userTimezone={user?.timezone}
      />
      {selectedDate && (
        <EventDetailPanel
          selectedDate={selectedDate}
          unavailableTimes={unavailableTimes}
          lessons={lessons}
          userId={userId}
          onClose={handleEventClose}
          onUpdate={onEventUpdate}
          userTimezone={user?.timezone}
        />
      )}
    </div>
  );
};
