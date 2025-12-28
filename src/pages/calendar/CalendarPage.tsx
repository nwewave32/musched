import { CalendarView } from "@widgets/calendar-view";
import { Card, CardContent } from "@shared/ui";

export const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">MuSched</h1>
          <p className="text-gray-600 mt-1">온라인 수업 스케줄 관리</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <CalendarView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
