import { deleteLesson, updateLesson } from "@entities/lesson/api";
import { deleteUnavailableTime } from "@entities/unavailable-time/api";
import { getUserProfile } from "@entities/user/api";
import type { Lesson, UnavailableTime, User } from "@shared/types";
import { Button, Card } from "@shared/ui";
import { useState, useEffect } from "react";
import {
  isSameDayCheck,
  getUnavailableTimesForDate,
  formatTimeInTimezone,
} from "@shared/lib";
import { EventDialog } from "@features/availability-management";

interface EventDetailPanelProps {
  selectedDate: Date;
  unavailableTimes: UnavailableTime[];
  lessons: Lesson[];
  userId: string;
  onClose: () => void;
  onUpdate?: () => void;
  user?: User;
}

// 개별 이벤트 카드 컴포넌트
interface EventCardProps {
  event:
    | { type: "unavailable"; data: UnavailableTime }
    | { type: "lesson"; data: Lesson };
  userId: string;
  onUpdate?: () => void;
  user?: User;
}

const EventCard = ({
  event,
  userId,
  onUpdate,
  user,
}: EventCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);

  // 불가 시간 생성자 정보 가져오기
  useEffect(() => {
    const fetchCreator = async () => {
      if (event.type === "unavailable") {
        try {
          const creator = await getUserProfile(event.data.userId);
          setCreatorUser(creator);
        } catch (error) {
          console.error("Failed to fetch creator user:", error);
        }
      }
    };
    fetchCreator();
  }, [event]);

  // 삭제 및 수정 권한 체크
  const canDelete = () => {
    if (event.type === "unavailable") {
      return event.data.userId === userId;
    } else {
      // 확정된 수업은 수정 및 삭제 불가
      if (event.data.status === "confirmed") {
        return false;
      }
      return event.data.proposedBy === userId;
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    setIsDeleting(true);
    try {
      if (event.type === "unavailable") {
        await deleteUnavailableTime(event.data.id);
      } else {
        await deleteLesson(event.data.id);
      }
      onUpdate?.();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  // 수업 확정 핸들러
  const handleConfirmLesson = async () => {
    if (event.type !== "lesson") return;

    setIsProcessing(true);
    try {
      await updateLesson(event.data.id, {
        confirmedBy: userId,
        status: "confirmed",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to confirm lesson:", error);
      alert("Failed to confirm lesson");
    } finally {
      setIsProcessing(false);
    }
  };

  // 수업 거절 핸들러
  const handleRejectLesson = async () => {
    if (event.type !== "lesson") return;

    setIsProcessing(true);
    try {
      await updateLesson(event.data.id, {
        status: "rejected",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to reject lesson:", error);
      alert("Failed to reject lesson");
    } finally {
      setIsProcessing(false);
    }
  };

  // 확정된 수업이 날짜가 지났으면 완료로 표시
  const isCompleted = event.type === "lesson" && event.data.status === "confirmed" && event.data.endTime.toDate() < new Date();

  return (
    <Card className="border-gray-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold">
              {event.type === "unavailable" ? "Unavailable Time" : isCompleted ? "✅ Lesson" : "Lesson"}
            </h4>
            {event.type === "lesson" && (
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  event.data.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : event.data.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isCompleted ? "completed" : event.data.status}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {/* 시간 */}
          <div>
            <span className="font-medium text-gray-500">Time: </span>
            <span>
              {event.type === "unavailable" && event.data.isAllDay
                ? "All Day"
                : `${formatTimeInTimezone(event.data.startTime, user?.timezone)} - ${formatTimeInTimezone(event.data.endTime, user?.timezone)}`}
            </span>
          </div>

          {/* 반복 (불가 시간만) */}
          {event.type === "unavailable" && (
            <>
              <div>
                <span className="font-medium text-gray-500">Recurrence: </span>
                <span>
                  {event.data.recurrence.type === "none"
                    ? "No Repeat"
                    : event.data.recurrence.type === "daily"
                    ? "Daily"
                    : event.data.recurrence.type === "weekdays"
                    ? "Weekdays (Mon-Fri)"
                    : `Weekly (${
                        event.data.recurrence.daysOfWeek
                          ?.map(
                            (d: number) =>
                              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
                          )
                          .join(", ") || ""
                      })`}
                </span>
              </div>
              {/* 생성자 */}
              <div>
                <span className="font-medium text-gray-500">Created by: </span>
                <span>
                  {creatorUser ? (creatorUser.name || creatorUser.email) : event.data.userId}
                </span>
              </div>
            </>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-4">
          {event.type === "lesson" &&
            event.data.status === "pending" &&
            event.data.proposedBy !== userId && (
              <>
                <Button
                  onClick={handleConfirmLesson}
                  disabled={isProcessing}
                  className="flex-1"
                  size="sm"
                >
                  {isProcessing ? "Processing..." : "Confirm"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectLesson}
                  disabled={isProcessing}
                  className="flex-1"
                  size="sm"
                >
                  Reject
                </Button>
              </>
            )}

          {canDelete() && (
            <>
              <EventDialog
                userId={userId}
                editEvent={event}
                onSuccess={onUpdate}
                trigger={
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                }
              />
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                size="sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export const EventDetailPanel = ({
  selectedDate,
  unavailableTimes,
  lessons,
  userId,
  onClose,
  onUpdate,
  user,
}: EventDetailPanelProps) => {
  // 선택된 날짜의 불가 시간 필터링
  const dateUnavailableTimes = getUnavailableTimesForDate(
    selectedDate,
    unavailableTimes
  );

  // 선택된 날짜의 수업 필터링
  const dateLessons = lessons.filter((lesson) =>
    isSameDayCheck(lesson.startTime.toDate(), selectedDate)
  );

  const totalEvents = dateUnavailableTimes.length + dateLessons.length;

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">
            {selectedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-sm text-gray-600">
            {totalEvents === 0
              ? "No events"
              : `${totalEvents} event${totalEvents > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} className="p-1">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      {totalEvents === 0 ? (
        <Card className="border-gray-200">
          <div className="p-6 text-center text-gray-500">
            No events on this date
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* 불가 시간 카드들 */}
          {dateUnavailableTimes.map((unavailableTime) => (
            <EventCard
              key={`unavailable-${unavailableTime.id}`}
              event={{ type: "unavailable", data: unavailableTime }}
              userId={userId}
              onUpdate={onUpdate}
              user={user}
            />
          ))}

          {/* 수업 카드들 */}
          {dateLessons.map((lesson) => (
            <EventCard
              key={`lesson-${lesson.id}`}
              event={{ type: "lesson", data: lesson }}
              userId={userId}
              onUpdate={onUpdate}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};
