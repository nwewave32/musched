# Firebase Custom Token Generator (DEPRECATED)

**⚠️ 이 방식은 더 이상 사용하지 않습니다**

이제 앱에서 이메일/비밀번호 방식의 인증을 사용합니다.
- 회원가입: `/signup`
- 로그인: `/login`

아래 내용은 참고용으로만 보관됩니다.

---

# 이전 방식: Firebase Custom Token Generator

## Setup

### 1. Firebase Service Account Key 다운로드

1. Firebase Console 접속: https://console.firebase.google.com
2. 프로젝트 선택
3. 톱니바퀴 아이콘 → **프로젝트 설정**
4. **서비스 계정** 탭 클릭
5. **새 비공개 키 생성** 버튼 클릭
6. JSON 파일 다운로드
7. 파일 이름을 `serviceAccountKey.json`으로 변경
8. 이 파일을 `scripts/` 폴더에 복사

**⚠️ 중요: serviceAccountKey.json은 절대 Git에 커밋하지 마세요!**

### 2. 사용자 UID 확인

1. Firebase Console → Authentication → Users
2. 생성한 사용자의 **User UID** 복사

### 3. 토큰 생성

```bash
# scripts 폴더로 이동
cd scripts

# 토큰 생성 (USER_UID를 실제 UID로 교체)
node generateToken.js <USER_UID>
```

예시:
```bash
node generateToken.js abc123xyz456
```

### 4. 생성된 토큰 사용

1. 앱 실행: `npm run dev`
2. 브라우저에서 `/login` 페이지 접속
3. 생성된 토큰을 복사해서 입력 필드에 붙여넣기
4. **Sign In** 클릭

## 두 명의 사용자 토큰 생성하기

```bash
# 첫 번째 사용자 (학생)
node generateToken.js <STUDENT_UID>

# 두 번째 사용자 (선생님)
node generateToken.js <TEACHER_UID>
```

## 문제 해결

### "Cannot find module './serviceAccountKey.json'"
→ serviceAccountKey.json 파일이 scripts 폴더에 있는지 확인

### "Error: credential implementation provided to initializeApp() via"
→ serviceAccountKey.json 파일 형식이 올바른지 확인

### "User not found"
→ Firebase Authentication에 해당 UID의 사용자가 존재하는지 확인
