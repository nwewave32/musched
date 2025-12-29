import { getAllLessons } from "@entities/lesson/api";
import { getAllUnavailableTimes } from "@entities/unavailable-time/api";
import { EventDialog } from "@features/availability-management";
import type { Lesson, UnavailableTime } from "@shared/types";
import { Card, CardContent } from "@shared/ui";
import { CalendarView } from "@widgets/calendar-view";
import { useEffect, useState } from "react";

export const CalendarPage = () => {
  // TODO: 실제 로그인된 사용자 ID 가져오기
  const userId = "temp-cana-id";
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>(
    []
  );
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 불가 시간 & 수업 로드 (모든 사용자의 이벤트)
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const [times, lessonList] = await Promise.all([
        getAllUnavailableTimes(),
        getAllLessons(),
      ]);
      setUnavailableTimes(times);
      setLessons(lessonList);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MuSched</h1>
            <p className="text-gray-600 mt-1">
              Management for online class schedule
            </p>
          </div>
          <EventDialog userId={userId} onSuccess={loadEvents} />
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">loading...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <CalendarView
                unavailableTimes={unavailableTimes}
                lessons={lessons}
                userId={userId}
                onEventUpdate={loadEvents}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
