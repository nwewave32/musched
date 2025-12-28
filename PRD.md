# Product Requirements Document (PRD)

## 프로젝트 개요

### 프로젝트 명
**MuSched** (Me U Schedule)

### 목적
영어 선생님과 학생 간의 1:1 온라인 수업 스케줄링을 효율적으로 관리하기 위한 PWA 애플리케이션

### 타겟 사용자
- 초기: 2명 (학생 1명, 필리핀 소재 영어 선생님 1명)
- 향후: 다수의 선생님-학생 페어로 확장 가능

---

## 기술 스택

### 프론트엔드
- **프레임워크**: React + TypeScript
- **아키텍처**: FSD (Feature-Sliced Design) 구조
- **UI 라이브러리**: Radix UI
- **스타일링**: Tailwind CSS
- **PWA**: Service Worker, Web App Manifest

### 백엔드
- **BaaS**: Firebase
  - Authentication (토큰 기반 접근 제어)
  - Firestore (실시간 데이터베이스)
  - Cloud Functions (필요시)
  - Cloud Messaging (PWA 푸시 알림)

---

## 핵심 기능

### 1. 불가 시간 관리 (Availability Management)

#### 1.1 불가 시간 등록
사용자가 수업이 불가능한 시간대를 등록할 수 있는 기능

**기능 상세:**
- 날짜 및 시간 범위 선택
- 반복 옵션:
  - 반복 안함
  - 매주 반복 (특정 요일)
  - 매일 반복
  - 평일(월~금) 반복
- 종일 선택 옵션
- 불가 시간 수정/삭제

**UI 요구사항:**
- 월간 캘린더 뷰에서 불가 시간 시각적 표시
- 불가 시간은 상대방에게도 표시됨 (투명도로 구분)

**데이터 구조 예시:**
```typescript
interface UnavailableTime {
  id: string;
  userId: string;
  startTime: Timestamp; // Firebase Timestamp
  endTime: Timestamp;
  isAllDay: boolean;
  recurrence: {
    type: 'none' | 'daily' | 'weekdays' | 'weekly';
    daysOfWeek?: number[]; // 0(일) ~ 6(토)
  };
  timezone: string; // IANA timezone (e.g., 'Asia/Seoul', 'Asia/Manila')
}
```

### 2. 수업 예약 및 확정 (Lesson Booking)

#### 2.1 수업 제안
한 사용자가 특정 날짜/시간에 수업을 제안

**기능 상세:**
- 1시간 단위 수업 시간 선택
- 제안 시 상대방의 불가 시간과 겹치는지 경고
- 제안 상태: `pending` (대기 중)

#### 2.2 수업 확정
상대방이 제안된 수업을 확인하고 승인

**기능 상세:**
- 수업 제안 알림 수신 (PWA 푸시)
- 승인/거절 옵션
- 승인 시 상태: `confirmed`
- 거절 시 상태: `rejected`

**데이터 구조 예시:**
```typescript
interface Lesson {
  id: string;
  proposedBy: string; // userId
  confirmedBy?: string; // userId
  startTime: Timestamp;
  endTime: Timestamp; // startTime + 1시간
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. 수업 취소 (Lesson Cancellation)

**기능 상세:**
- 확정된 수업을 취소할 수 있음
- 취소 사유 필수 입력 (텍스트)
- 취소 시 상대방에게 푸시 알림 발송
- 취소된 수업 상태: `cancelled`

**UI 요구사항:**
- 수업 상세 화면에서 취소 버튼 제공
- 취소 사유 입력 모달

### 4. 수업 지각 알림 (Tardiness Alert)

**기능 상세:**
- 수업 시간에 상대방이 나타나지 않을 경우 "지각 알림" 버튼 제공
- 버튼 클릭 시 상대방에게 즉시 푸시 알림 발송
- 알림 내용: "{상대방 이름}님이 수업 대기 중입니다"

**제약사항:**
- 수업 시작 시간 이후에만 버튼 활성화
- 수업 종료 시간 이후에는 버튼 비활성화

### 5. 메시지 기능 (Optional)

**기능 상세:**
- 간단한 텍스트 메시지 송수신
- 실시간 메시지 동기화 (Firestore 리스너)

**우선순위:**
- Phase 2 기능 (초기 버전에서 생략 가능)
- 구현 난이도에 따라 제거 고려

---

## 사용자 플로우

### 플로우 1: 불가 시간 등록
1. 사용자가 캘린더에서 날짜 선택
2. 시간 범위, 반복 옵션 설정
3. 저장
4. 상대방 캘린더에도 반영 (읽기 전용으로 표시)

### 플로우 2: 수업 예약
1. 사용자 A가 캘린더에서 가능한 시간대 선택
2. 수업 제안 생성 (1시간 단위)
3. 사용자 B에게 푸시 알림 발송
4. 사용자 B가 앱에서 제안 확인
5. 승인 시: 양쪽 캘린더에 확정된 수업 표시
6. 거절 시: 제안 삭제

### 플로우 3: 수업 취소
1. 확정된 수업 클릭
2. "취소" 버튼 클릭
3. 취소 사유 입력
4. 확인 시 상대방에게 푸시 알림 발송
5. 수업 상태 `cancelled`로 변경

### 플로우 4: 지각 알림
1. 수업 시작 시간 도래
2. 상대방 부재 시 "지각 알림" 버튼 표시
3. 버튼 클릭 시 상대방에게 푸시 알림 즉시 발송

---

## UI/UX 요구사항

### 캘린더 뷰 (월간)
- **메인 화면**: 월간 캘린더
- **시각적 구분**:
  - 내 불가 시간: 회색 배경
  - 상대방 불가 시간: 옅은 회색 배경 (투명도 50%)
  - 제안된 수업 (대기 중): 노란색 테두리
  - 확정된 수업: 녹색 배경
  - 취소된 수업: 빨간색 줄 표시
- **날짜 클릭 시**: 해당 날짜의 상세 일정 표시

### 수업 상세 화면
- 수업 시간 (양쪽 사용자의 현지 시간 표시)
- 상태 (대기 중/확정됨/취소됨)
- 취소 사유 (취소된 경우)
- 액션 버튼:
  - 확정/거절 (대기 중인 제안인 경우)
  - 취소 (확정된 수업인 경우)
  - 지각 알림 (수업 시작 후)

### 반응형 디자인
- 모바일 우선 설계
- 데스크톱에서도 사용 가능

---

## 시간대 처리

### 요구사항
- 각 사용자의 현지 시간으로 표시
- 한국(Asia/Seoul)과 필리핀(Asia/Manila)의 시차: 1시간 (필리핀이 1시간 느림)

### 구현 방법
- Firebase에는 UTC Timestamp로 저장
- 프론트엔드에서 사용자의 타임존에 맞게 변환하여 표시
- 라이브러리: `date-fns-tz` 또는 `dayjs` + timezone plugin

### 표시 예시
```
학생 (한국): 2025년 1월 15일 오후 3시 - 4시
선생님 (필리핀): January 15, 2025 2:00 PM - 3:00 PM
```

---

## 푸시 알림 시나리오

### 알림 트리거
1. **수업 제안**: "새로운 수업 제안이 있습니다"
2. **수업 확정**: "수업이 확정되었습니다"
3. **수업 취소**: "수업이 취소되었습니다. 사유: {reason}"
4. **수업 임박**: 수업 30분 전 "30분 후 수업이 시작됩니다"
5. **지각 알림**: "{상대방 이름}님이 수업 대기 중입니다"

### 기술 구현
- Firebase Cloud Messaging (FCM)
- PWA Push API
- Service Worker에서 알림 표시

---

## 인증 및 보안

### 토큰 기반 접근 제어
- Firebase Authentication Custom Token
- 각 사용자에게 고유 토큰 발급
- 토큰을 통해 앱 접근 (이메일/비밀번호 불필요)

### 초기 사용자 등록
- 관리자가 Firebase Console에서 2개의 사용자 계정 생성
- 각 사용자에게 접근 토큰 전달 (QR 코드 또는 링크)
- 토큰을 통해 첫 로그인 시 사용자 정보 설정 (이름, 타임존)

### 데이터 접근 제어
- Firestore Security Rules로 자신의 데이터만 수정 가능
- 상대방의 불가 시간, 수업 정보는 읽기 전용

---

## 데이터베이스 스키마 (Firestore)

### Collections

#### `users`
```typescript
{
  id: string; // userId
  name: string;
  timezone: string; // IANA timezone
  partnerId: string; // 상대방 userId
  fcmToken?: string; // 푸시 알림용
  createdAt: Timestamp;
}
```

#### `unavailableTimes`
```typescript
{
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  isAllDay: boolean;
  recurrence: {
    type: 'none' | 'daily' | 'weekdays' | 'weekly';
    daysOfWeek?: number[];
  };
  timezone: string;
  createdAt: Timestamp;
}
```

#### `lessons`
```typescript
{
  id: string;
  proposedBy: string; // userId
  confirmedBy?: string; // userId
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `messages` (Optional)
```typescript
{
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Timestamp;
}
```

---

## 개발 단계

### Phase 1: MVP (필수 기능)
1. 토큰 기반 인증
2. 불가 시간 등록/수정/삭제
3. 월간 캘린더 UI
4. 수업 제안 및 확정
5. 수업 취소
6. 기본 푸시 알림 (수업 제안, 확정, 취소)

### Phase 2: 추가 기능
1. 수업 지각 알림
2. 수업 임박 알림 (30분 전)
3. 메시지 기능 (선택사항)

### Phase 3: 확장 (향후)
1. 다수 사용자 지원
2. 수업 히스토리 및 통계
3. 수업료 관리

---

## 비기능 요구사항

### 성능
- 캘린더 로딩 시간: 2초 이내
- 푸시 알림 지연: 5초 이내

### 호환성
- PWA 지원 브라우저: Chrome, Safari, Edge (최신 2개 버전)
- 모바일 OS: iOS 14+, Android 10+

### 접근성
- WCAG 2.1 Level AA 준수
- 키보드 네비게이션 지원

### 오프라인 지원
- Service Worker를 통한 기본 캐싱
- 오프라인 시 읽기 전용 캘린더 뷰

---

## 성공 지표 (향후 확장 시)

- 수업 제안 → 확정 비율
- 수업 취소율
- 푸시 알림 응답률
- 월간 활성 사용자 수 (MAU)

---

## 리스크 및 고려사항

### 기술 리스크
- PWA 푸시 알림의 iOS Safari 제한 (iOS 16.4+에서 지원)
- 시간대 변환 오류 가능성 → 철저한 테스트 필요

### 사용성 리스크
- 2명의 사용자만 있어 피드백 제한적 → 정기적인 사용자 인터뷰 필요

### 확장성 고려
- 현재는 1:1 페어링만 지원하지만, DB 스키마는 다수 사용자 확장 고려하여 설계

---

## 문서 버전
- v1.0 - 2025-12-28: 초안 작성