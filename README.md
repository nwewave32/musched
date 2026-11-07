# MuSched

> **Me U Schedule** — 한국의 학생과 필리핀의 영어 선생님이 1:1 온라인 수업 일정을 각자의 현지 시간 기준으로 잡고 확정하는 스케줄링 PWA

메신저로 날짜를 주고받으면 시차 계산이 헷갈리고 누락이 생기는 문제를 해결하기 위해 만들었습니다. 캘린더에서 **불가 시간 공유 → 수업 제안 → 확정/취소 → 푸시 알림**까지 한 번에 처리합니다.

- 배포: https://musched.web.app

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 불가 시간 관리 | 날짜/시간 범위, 종일, 반복(없음 · 매일 · 평일 · 매주 특정 요일) 등록·수정·삭제. 상대방 캘린더에도 표시 |
| 수업 제안 · 확정 | 1시간 단위로 수업 제안(`pending`) → 상대방이 확정(`confirmed`) 또는 거절(`rejected`) |
| 수업 취소 | 확정된 수업을 사유와 함께 취소(`cancelled`). 확정된 수업은 수정/삭제 불가, 지난 수업은 자동 완료(✅) 표시 |
| 지각 알림 | 수업 시간 중 상대방에게 "수업 대기 중" 푸시 발송 |
| 타임존 처리 | Firestore에는 UTC로 저장하고, 각 사용자 프로필의 timezone으로 표시 |
| 푸시 알림 (FCM) | 수업 제안 · 확정 · 취소 · 지각 시 알림. 웹(Chrome)과 iOS PWA의 Foreground/Background 모두 지원 |
| PWA | 홈 화면 설치, 서비스 워커 캐싱 |

## 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite 7, React Router 7
- **UI**: Radix UI, Tailwind CSS 3, lucide-react
- **날짜/시간**: date-fns, date-fns-tz
- **백엔드**: Firebase (Authentication, Firestore, Cloud Functions, Cloud Messaging, Hosting)
- **PWA**: vite-plugin-pwa
- **아키텍처**: [Feature-Sliced Design (FSD)](https://feature-sliced.design/)

## 프로젝트 구조

```
src/
├── app/        # 앱 초기화, AuthProvider, 라우팅(ProtectedRoute)
├── pages/      # calendar, login, signup, settings, auth
├── widgets/    # calendar-view
├── features/   # availability-management, notification, tardiness-alert
├── entities/   # user, lesson, unavailable-time
└── shared/     # config(firebase), lib, types, ui

functions/      # Firebase Cloud Functions (별도 Node.js 20 환경)
scripts/        # 서비스 워커 생성 스크립트 등
public/         # PWA 아이콘, firebase-messaging-sw 템플릿
```

레이어 간 import 규칙(상위 → 하위만 허용, 같은 레이어 cross-import 금지)은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

### Cloud Functions

| 함수 | 트리거 | 역할 |
| --- | --- | --- |
| `onLessonChange` | Firestore `lessons` 문서 변경 | 제안 · 확정 · 취소 시 상대방에게 FCM 푸시 (수신자 timezone으로 시간 포맷) |
| `sendTardinessAlert` | HTTPS Callable | 지각 알림 푸시 발송 |

> `functions/`는 클라이언트의 `src/shared/types`를 import할 수 없어 타입을 별도로 정의합니다. 타입 변경 시 양쪽을 함께 수정하세요.

## 시작하기

### 1. 의존성 설치

```bash
npm install
cd functions && npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 만들고 Firebase 웹 앱 설정값을 입력합니다.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=   # Cloud Messaging → 웹 푸시 인증서
```

`npm run dev` / `npm run build` 실행 시 `scripts/generate-sw.js`가 이 값으로 `public/firebase-messaging-sw.template.js`에서 `firebase-messaging-sw.js`를 생성합니다. (생성 파일은 git에 포함되지 않습니다.)

Firebase 프로젝트 생성, 이메일/비밀번호 인증 활성화 등 콘솔 설정은 [`README_SETUP.md`](./README_SETUP.md)를 참고하세요.

### 3. 실행

```bash
npm run dev       # 개발 서버
npm run build     # 타입 체크 + 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint
```

개발 서버 실행 후 `/signup`에서 이메일/비밀번호, 역할(teacher/student), timezone을 입력해 계정을 만듭니다. `/settings`에서는 푸시 알림을 켜고 FCM 상태(디버그 정보)를 확인할 수 있습니다.

## 배포

```bash
npm run build && firebase deploy --only hosting   # 웹 앱
cd functions && npm run deploy                    # Cloud Functions
firebase deploy --only firestore:rules            # Security Rules
```

## 문서

| 문서 | 내용 |
| --- | --- |
| [`PRD.md`](./PRD.md) | 제품 요구사항 (기능, 사용자 플로우, 데이터 스키마, 개발 단계) |
| [`README_SETUP.md`](./README_SETUP.md) | Firebase 및 로컬 환경 설정 가이드 |
| [`CLAUDE.md`](./CLAUDE.md) | 개발 가이드, FSD 규칙 |
| [`PROJECT_LOG.md`](./PROJECT_LOG.md) | 진행 상황, 설계 결정, 트러블슈팅, 회고 |

## 로드맵

- [ ] 수업 30분 전 임박 알림
- [ ] 메시지 기능 (선택)
- [ ] 다수 선생님-학생 페어 지원
