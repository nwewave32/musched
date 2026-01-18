# MuSched 개발 가이드

## 프로젝트 개요

1:1 온라인 영어 레슨 스케줄링 PWA (Progressive Web App)

- **프론트엔드**: React 19 + TypeScript + Vite
- **백엔드**: Firebase (Auth, Firestore, Cloud Functions, FCM)
- **아키텍처**: Feature-Sliced Design (FSD)

## FSD 아키텍처 (필수 준수)

### 레이어 계층 구조

```
src/
├── app/          # 앱 초기화, 프로바이더, 라우팅
├── pages/        # 페이지 컴포넌트
├── widgets/      # 복합 UI 블록
├── features/     # 비즈니스 기능
├── entities/     # 도메인 모델
└── shared/       # 공유 유틸리티, UI, 설정
```

### Import 규칙 (엄격히 준수)

| 레이어 | Import 가능 대상 |
|--------|------------------|
| app | pages, widgets, features, entities, shared |
| pages | widgets, features, entities, shared |
| widgets | features, entities, shared |
| features | entities, shared |
| entities | shared |
| shared | 외부 라이브러리만 (다른 레이어 import 금지!) |

### 금지 사항

1. **역방향 import 금지**: 하위 레이어가 상위 레이어를 import할 수 없음
   ```typescript
   // ❌ 금지: shared에서 entities import
   // src/shared/lib/something.ts
   import { userApi } from "@entities/user/api";

   // ❌ 금지: entities에서 features import
   // src/entities/user/api.ts
   import { something } from "@features/notification";
   ```

2. **같은 레이어 내 cross-import 금지**:
   ```typescript
   // ❌ 금지: features/A에서 features/B import
   // src/features/lesson-booking/api.ts
   import { something } from "@features/notification";
   ```

### 새 기능 추가 시 체크리스트

- [ ] 해당 기능이 어느 레이어에 속하는지 확인
- [ ] import가 FSD 규칙을 준수하는지 확인
- [ ] shared에 entities/features 의존성이 생기면 → features로 이동

## 디렉토리 구조

```
src/
├── app/
│   ├── providers/
│   │   ├── AuthProvider.tsx    # 인증 상태 관리
│   │   └── index.ts
│   ├── router/
│   │   └── ProtectedRoute.tsx
│   └── App.tsx
│
├── pages/
│   ├── calendar/               # 메인 캘린더 페이지
│   ├── login/
│   ├── signup/
│   └── settings/
│
├── widgets/
│   └── calendar-view/          # 캘린더 뷰 컴포넌트
│
├── features/
│   ├── availability-management/  # 불가능 시간 관리
│   ├── lesson-booking/           # 레슨 예약
│   ├── lesson-cancellation/      # 레슨 취소
│   ├── notification/             # FCM 푸시 알림
│   └── tardiness-alert/          # 지각 알림
│
├── entities/
│   ├── user/
│   ├── lesson/
│   └── unavailable-time/
│
└── shared/
    ├── config/firebase.ts      # Firebase 설정
    ├── lib/                    # 유틸리티 함수
    ├── types/                  # 타입 정의
    └── ui/                     # 공통 UI 컴포넌트
```

## 주요 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 린트
npm run lint

# Firebase Functions 배포
cd functions && npm run deploy
```

## Firebase Cloud Functions

`functions/` 디렉토리는 별도의 Node.js 환경입니다.

- 클라이언트 `src/shared/types`와 타입 공유 불가
- `functions/src/index.ts`의 타입은 별도 정의 필요
- 타입 변경 시 양쪽 동기화 필요 (주석으로 명시됨)

## 푸시 알림 (FCM)

### 구조

- **서버**: `functions/src/index.ts` - Firestore 트리거로 FCM 전송
- **클라이언트**:
  - `features/notification/` - 토큰 관리 (entities 의존성 있음)
  - `shared/lib/fcm.ts` - Foreground 메시지 리스너 (순수 유틸)

### 알림 발송 시점

- 레슨 제안 (pending)
- 레슨 확정 (confirmed)
- 레슨 취소 (cancelled)

## 인증

- 이메일/비밀번호 인증 (Firebase Auth)
- `AuthProvider`에서 전역 상태 관리
- 로그인 시 FCM 토큰 자동 갱신
