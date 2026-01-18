import { getAllLessons } from '@entities/lesson/api';
import { getAllUnavailableTimes } from '@entities/unavailable-time/api';
import { EventDialog } from '@features/availability-management';
import { useAuth } from '@app/providers';
import type { Lesson, UnavailableTime } from '@shared/types';
import { Button, Card, CardContent } from '@shared/ui';
import { CalendarView } from '@widgets/calendar-view';
import { useEffect, useState } from 'react';
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
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Service Worker에서 오는 메시지 리스너
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        console.log('Notification clicked, refreshing data...', event.data);
        loadEvents();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>MuSched</h1>
            <p className='text-gray-600 mt-1'>
              Management for online class schedule
            </p>
            {currentUser && (
              <p className='text-sm text-gray-500 mt-1'>
                {currentUser.email} ({currentUser.role})
              </p>
            )}
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <EventDialog userId={userId} onSuccess={loadEvents} />
            <Button
              variant='outline'
              onClick={() => {
                loadEvents();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Reload'}
            </Button>
            <Button variant='outline' onClick={signOut}>
              Sign Out
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                navigate('/settings');
              }}
            >
              Settings
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
