# MuSched - 프로젝트 설정 가이드

## 프로젝트 구조

이 프로젝트는 **FSD (Feature-Sliced Design)** 아키텍처로 구성되어 있습니다.

```
src/
├── app/                 # 앱 초기화, 라우터, 전역 스타일, 프로바이더
│   ├── providers/       # Context Providers
│   ├── styles/          # 전역 CSS
│   ├── App.tsx          # 메인 App 컴포넌트
│   └── index.ts         # Public API
├── pages/               # 페이지 컴포넌트
│   ├── calendar/        # 캘린더 페이지
│   └── auth/            # 인증 페이지
├── widgets/             # 독립적인 UI 블록
│   ├── calendar-view/   # 캘린더 뷰 위젯
│   └── lesson-card/     # 수업 카드 위젯
├── features/            # 사용자 인터랙션 기능
│   ├── lesson-booking/          # 수업 예약
│   ├── lesson-cancellation/     # 수업 취소
│   ├── availability-management/ # 불가 시간 관리
│   └── tardiness-alert/         # 지각 알림
├── entities/            # 비즈니스 엔티티
│   ├── lesson/          # 수업 엔티티
│   │   ├── model/       # 상태 관리
│   │   ├── ui/          # UI 컴포넌트
│   │   └── api/         # API 호출
│   ├── user/            # 사용자 엔티티
│   └── unavailable-time/# 불가 시간 엔티티
└── shared/              # 재사용 가능한 코드
    ├── ui/              # UI 컴포넌트 라이브러리
    ├── lib/             # 유틸리티 함수
    ├── api/             # API 클라이언트
    ├── config/          # 설정 (Firebase 등)
    └── types/           # TypeScript 타입 정의
```

## 기술 스택

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **UI Library**: Radix UI
- **Routing**: React Router DOM
- **Backend**: Firebase (Auth, Firestore, Cloud Messaging)
- **PWA**: vite-plugin-pwa
- **Date Handling**: date-fns-tz

## 시작하기

### 1. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고, Firebase 설정값을 입력하세요.

```bash
cp .env.example .env
```

`.env` 파일 내용:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 빌드

```bash
npm run build
```

### 4. 프리뷰

```bash
npm run preview
```

## Path Aliases

FSD 레이어별로 path alias가 설정되어 있습니다:

```typescript
import { App } from '@app'
import { CalendarPage } from '@pages/calendar'
import { CalendarView } from '@widgets/calendar-view'
import { LessonBooking } from '@features/lesson-booking'
import { Lesson } from '@entities/lesson'
import { Button } from '@shared/ui/button'
import { cn, formatTimestampToTimezone } from '@shared/lib'
import { db, auth } from '@shared/config/firebase'
import type { User, Lesson } from '@shared/types'
```

## PWA 설정

PWA는 자동으로 설정되어 있으며, 빌드 시 Service Worker와 Manifest 파일이 생성됩니다.

아이콘 파일을 준비하여 `public/` 디렉토리에 배치하세요:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `favicon.ico`
- `apple-touch-icon.png`
- `mask-icon.svg`

## Firebase 설정

1. Firebase Console에서 프로젝트 생성
2. Authentication 활성화 (Custom Token 방식)
3. Firestore 데이터베이스 생성
4. Cloud Messaging 설정
5. 웹 앱 추가 후 설정값을 `.env`에 입력

## 다음 단계

1. Firebase 프로젝트 설정 완료
2. 각 feature 구현 시작
3. Radix UI를 사용한 공통 UI 컴포넌트 구축
4. Entity별 API 및 상태 관리 구현
5. 페이지 및 위젯 구성

## 참고 문서

- [FSD 공식 문서](https://feature-sliced.design/)
- [Firebase 문서](https://firebase.google.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
