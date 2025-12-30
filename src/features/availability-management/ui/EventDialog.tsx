import { createLesson, updateLesson } from "@entities/lesson/api";
import {
  createUnavailableTime,
  updateUnavailableTime,
} from "@entities/unavailable-time/api";
import { getUserProfile } from "@entities/user/api";
import type {
  Lesson,
  LessonStatus,
  RecurrenceType,
  UnavailableTime,
  User,
} from "@shared/types";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "@shared/ui";
import { createDateInTimezone, timestampToZonedDate } from "@shared/lib/date";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

interface EventDialogProps {
  userId: string;
  selectedDate?: Date;
  onSuccess?: () => void;
  // 수정 모드용 props
  editEvent?:
    | { type: "unavailable"; data: UnavailableTime }
    | { type: "lesson"; data: Lesson };
  trigger?: React.ReactNode;
}

export const EventDialog = ({
  userId,
  selectedDate,
  onSuccess,
  editEvent,
  trigger,
}: EventDialogProps) => {
  const [open, setOpen] = useState(false);
  const isEditMode = !!editEvent;

  // User info
  const [user, setUser] = useState<User | null>(null);

  // Event type selection
  const [isLesson, setIsLesson] = useState(false);

  // Common fields
  const [startDate, setStartDate] = useState(
    selectedDate?.toISOString().split("T")[0] || ""
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Unavailable time specific
  const [isAllDay, setIsAllDay] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const userProfile = await getUserProfile(userId);
      setUser(userProfile);
    };
    fetchUser();
  }, [userId]);

  // 수정 모드일 때 초기값 설정
  useEffect(() => {
    if (editEvent && user) {
      const eventData = editEvent.data;

      // 사용자의 타임존으로 변환된 날짜/시간 가져오기
      const startDateTime = timestampToZonedDate(
        eventData.startTime,
        user.timezone
      );
      const endDateTime = timestampToZonedDate(eventData.endTime, user.timezone);

      setIsLesson(editEvent.type === "lesson");
      setStartDate(startDateTime.toISOString().split("T")[0]);
      setStartTime(
        startDateTime.toTimeString().slice(0, 5) ||
          startDateTime.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })
      );
      setEndTime(
        endDateTime.toTimeString().slice(0, 5) ||
          endDateTime.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })
      );

      if (editEvent.type === "unavailable") {
        const unavailableData = editEvent.data as UnavailableTime;
        setIsAllDay(unavailableData.isAllDay);
        setRecurrenceType(unavailableData.recurrence.type);
        setSelectedDays(unavailableData.recurrence.daysOfWeek || []);
      }
    }
  }, [editEvent, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("User information not loaded");
      return;
    }

    setIsSubmitting(true);

    try {
      // 사용자의 타임존으로 입력된 시간을 UTC로 변환
      const start = createDateInTimezone(startDate, startTime, user.timezone);
      const end = createDateInTimezone(startDate, endTime, user.timezone);

      if (isLesson) {
        if (isEditMode && editEvent?.type === "lesson") {
          // 수업 수정
          await updateLesson(editEvent.data.id, {
            startTime: Timestamp.fromDate(start),
            endTime: Timestamp.fromDate(end),
          });
        } else {
          // 수업 등록
          await createLesson({
            proposedBy: userId,
            startTime: Timestamp.fromDate(start),
            endTime: Timestamp.fromDate(end),
            status: "pending" as LessonStatus,
          });
        }
      } else {
        const recurrence =
          recurrenceType === "weekly"
            ? { type: recurrenceType, daysOfWeek: selectedDays }
            : { type: recurrenceType };

        if (isEditMode && editEvent?.type === "unavailable") {
          // 불가 시간 수정
          await updateUnavailableTime(editEvent.data.id, {
            startTime: Timestamp.fromDate(start),
            endTime: Timestamp.fromDate(end),
            isAllDay,
            recurrence,
          });
        } else {
          // 불가 시간 등록
          await createUnavailableTime({
            userId,
            startTime: Timestamp.fromDate(start),
            endTime: Timestamp.fromDate(end),
            isAllDay,
            recurrence,
            timezone: user.timezone, // 사용자 프로필의 타임존 사용
          });
        }
      }

      setOpen(false);
      onSuccess?.();

      // Reset form (생성 모드일 때만)
      if (!isEditMode) {
        setIsLesson(false);
        setIsAllDay(false);
        setRecurrenceType("none");
        setSelectedDays([]);
        setStartTime("09:00");
        setEndTime("10:00");
      }
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} event:`,
        error
      );
      alert(`Failed to ${isEditMode ? "update" : "create"} event`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const weekDays = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>+ Event</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Edit the event details below."
              : "Add a lesson or unavailable time to your calendar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Event Type 선택 */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
              <Checkbox
                id="isLesson"
                checked={isLesson}
                onCheckedChange={(checked) => setIsLesson(checked === true)}
                disabled={isEditMode} // 수정 모드에서는 비활성화
              />
              <Label
                htmlFor="isLesson"
                className={`font-medium ${
                  isEditMode
                    ? "cursor-not-allowed text-gray-500"
                    : "cursor-pointer"
                }`}
              >
                This is a lesson
              </Label>
            </div>

            {/* 날짜 선택 */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* 종일 체크박스 (불가 시간 전용) */}
            {!isLesson && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={isAllDay}
                  onCheckedChange={(checked) => setIsAllDay(checked === true)}
                />
                <Label htmlFor="allDay" className="cursor-pointer">
                  All Day
                </Label>
              </div>
            )}

            {/* 시간 선택 */}
            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* 반복 옵션 (불가 시간 전용) */}
            {!isLesson && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Recurrence</Label>
                  <select
                    id="recurrence"
                    value={recurrenceType}
                    onChange={(e) =>
                      setRecurrenceType(e.target.value as RecurrenceType)
                    }
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <option value="none">No Repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekly">Weekly (Select Days)</option>
                  </select>
                </div>

                {/* 요일 선택 (매주 반복 시) */}
                {recurrenceType === "weekly" && (
                  <div className="space-y-2">
                    <Label>Repeat On</Label>
                    <div className="flex gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`flex-1 h-10 rounded-md border transition-colors ${
                            selectedDays.includes(day.value)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update"
                : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
