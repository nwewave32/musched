import { WEEKDAY_NAMES_EN } from "@/shared/lib";
import { createUnavailableTime } from "@entities/unavailable-time/api";
import type { RecurrenceType } from "@shared/types";
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
import { Timestamp } from "firebase/firestore";
import { useState } from "react";

interface AddUnavailableTimeDialogProps {
  userId: string;
  selectedDate?: Date;
  onSuccess?: () => void;
}

const START_TIME = "09:00";
const END_TIME = "09:00";

export const AddUnavailableTimeDialog = ({
  userId,
  selectedDate,
  onSuccess,
}: AddUnavailableTimeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(
    selectedDate?.toISOString().split("T")[0] || ""
  );
  const [startTime, setStartTime] = useState(START_TIME);
  const [endTime, setEndTime] = useState(END_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${startDate}T${endTime}`);

      // recurrence 객체 생성 (Firestore는 undefined를 허용하지 않음)
      const recurrence =
        recurrenceType === "weekly"
          ? { type: recurrenceType, daysOfWeek: selectedDays }
          : { type: recurrenceType };

      await createUnavailableTime({
        userId,
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(end),
        isAllDay,
        recurrence,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setOpen(false);
      onSuccess?.();

      // 폼 초기화
      setIsAllDay(false);
      setRecurrenceType("none");
      setSelectedDays([]);
      setStartTime(START_TIME);
      setEndTime(END_TIME);
    } catch (error) {
      console.error("Failed to create unavailable time:", error);
      alert("Fail to add unavailable time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Unavailable Time</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Unavailable Time</DialogTitle>
          <DialogDescription>Add Unavailable Time</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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

            {/* 종일 체크박스 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={isAllDay}
                onCheckedChange={(checked) => setIsAllDay(checked === true)}
              />
              <Label htmlFor="allDay" className="cursor-pointer">
                All day
              </Label>
            </div>

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

            {/* 반복 옵션 */}
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
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon~Fri)</option>
                <option value="weekly">Weekly (Select days)</option>
              </select>
            </div>

            {/* 요일 선택 (매주 반복 시) */}
            {recurrenceType === "weekly" && (
              <div className="space-y-2">
                <Label>Recurrence days</Label>
                <div className="flex gap-2">
                  {WEEKDAY_NAMES_EN.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`flex-1 h-10 rounded-md border transition-colors ${
                        selectedDays.includes(idx)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
