# Claude Code 개발 노트

이 파일은 Claude Code와 함께 개발할 때 유용한 정보를 기록합니다.

## 개발 서버 실행 시 주의사항

### 서버 실행 전 확인사항

개발 서버를 실행하기 전에 **반드시 기존에 실행 중인 서버가 있는지 확인**하세요.

```bash
# 실행 중인 백그라운드 작업 확인
/tasks

# 또는 포트 사용 확인
lsof -i :5173
lsof -i :5174
```

### 기존 서버가 있는 경우

```bash
# 백그라운드 작업 종료 (task_id는 /tasks에서 확인)
/kill <task_id>

# 또는 포트로 프로세스 종료
kill -9 $(lsof -t -i:5173)
```

### 새 서버 실행

```bash
npm run dev
```

## 인증 시스템

### 현재 인증 방식
- **이메일/비밀번호 인증** 사용
- Firebase Authentication 기반
- 세션 자동 유지

### 테스트 방법
1. `/signup` - 새 계정 생성
2. `/login` - 로그인
3. 로그인 후 자동으로 `/` (캘린더 페이지)로 리다이렉트

### Firebase 설정 필수
개발 전 Firebase Console에서 이메일/비밀번호 인증 활성화 필요:
1. Firebase Console → Authentication → Sign-in method
2. Email/Password 활성화

## 이전 인증 방식 (Deprecated)

~~Custom Token 방식~~ - 더 이상 사용하지 않음
- `scripts/generateToken.js` - 참고용으로만 보관
