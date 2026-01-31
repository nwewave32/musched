import { useAuth } from '@app/providers';
import { getAllLessons } from '@entities/lesson/api';
import { getAllUnavailableTimes } from '@entities/unavailable-time/api';
import { EventDialog } from '@features/availability-management';
import { FOREGROUND_NOTIFICATION_CLICK_EVENT } from '@shared/lib/fcm';
import type { Lesson, UnavailableTime } from '@shared/types';
import { Button, Card, CardContent } from '@shared/ui';
import { CalendarView } from '@widgets/calendar-view';
import { LogOut, RefreshCw, Settings } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CalendarPage = () => {
  const { currentUser, signOut } = useAuth();
  const userId = currentUser?.id || '';
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>(
    []
  );
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 불가 시간 & 수업 로드 (모든 사용자의 이벤트)
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const [times, lessonList] = await Promise.all([
        getAllUnavailableTimes(),
        getAllLessons(),
      ]);
      setUnavailableTimes(times);
      setLessons(lessonList);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 및 URL 파라미터 확인
  useEffect(() => {
    const isRefresh = searchParams.get('refresh') === 'true';

    loadEvents();

    // URL에 refresh 파라미터가 있으면 제거 (알림에서 열림)
    if (isRefresh) {
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Service Worker에서 오는 메시지 리스너 (백그라운드 알림 클릭)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        console.log(
          'Background notification clicked, refreshing data...',
          event.data
        );
        loadEvents();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [loadEvents]);

  // 포그라운드 알림 클릭 이벤트 리스너
  useEffect(() => {
    const handleForegroundNotificationClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        'Foreground notification clicked, refreshing data...',
        customEvent.detail
      );
      loadEvents();
    };

    window.addEventListener(
      FOREGROUND_NOTIFICATION_CLICK_EVENT,
      handleForegroundNotificationClick
    );

    return () => {
      window.removeEventListener(
        FOREGROUND_NOTIFICATION_CLICK_EVENT,
        handleForegroundNotificationClick
      );
    };
  }, [loadEvents]);

  return (
    <div className='min-h-screen bg-gray-50 sm:p-4'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex items-center justify-between pt-4 px-4 sm:p-0'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>MuSched</h1>
            <p className='text-gray-600 mt-1 max-w-[50vw] sm:max-w-none'>
              Management for online class schedule
            </p>
            {currentUser && (
              <p className='text-sm text-gray-500 mt-1'>
                {currentUser.email} ({currentUser.role})
              </p>
            )}
          </div>
          <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-row'>
            <EventDialog userId={userId} onSuccess={loadEvents} />
            <Button
              variant='outline'
              onClick={() => {
                loadEvents();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : <RefreshCw size={24} />}
            </Button>
            <Button variant='outline' onClick={signOut}>
              <LogOut size={24} />
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                navigate('/settings');
              }}
            >
              <Settings size={24} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className='p-6'>
              <p className='text-center text-gray-500'>loading...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className='p-6'>
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
