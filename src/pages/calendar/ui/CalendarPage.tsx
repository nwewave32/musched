import { getUserUnavailableTimes } from "@entities/unavailable-time/api";
import { AddUnavailableTimeDialog } from "@features/availability-management";
import type { UnavailableTime } from "@shared/types";
import { Card, CardContent } from "@shared/ui";
import { CalendarView } from "@widgets/calendar-view";
import { useEffect, useState } from "react";

export const CalendarPage = () => {
  // TODO: 실제 로그인된 사용자 ID 가져오기
  const userId = "temp-user-id";
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadUnavailableTimes = async () => {
    try {
      setIsLoading(true);
      const times = await getUserUnavailableTimes(userId);
      setUnavailableTimes(times);
    } catch (error) {
      console.error("Failed to load unavailable times:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnavailableTimes();
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
          <AddUnavailableTimeDialog
            userId={userId}
            onSuccess={loadUnavailableTimes}
          />
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
              <CalendarView unavailableTimes={unavailableTimes} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
