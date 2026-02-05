# 한마음의원 재택의료센터 백엔드

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
cd backend
npm install
```

### 2. 환경 변수 설정
`.env.example`을 복사하여 `.env` 파일을 만들고 설정:
```bash
cp .env.example .env
```

### 3. MongoDB 설정
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 무료 계정 생성
2. 새 클러스터 생성 (무료 티어 선택)
3. Database Access에서 사용자 생성
4. Network Access에서 `0.0.0.0/0` 추가 (모든 IP 허용)
5. 연결 문자열 복사하여 `.env`의 `MONGODB_URI`에 붙여넣기

### 4. 개발 서버 실행
```bash
npm run dev
```

## 📦 주요 기능

- ✅ JWT 기반 인증/인가
- ✅ 어르신 정보 관리 (CRUD)
- ✅ 예약 관리 (CRUD)
- ✅ 사용자 관리 (권한별 접근 제어)
- ✅ 건강 기록 추가/조회
- ✅ 파일 업로드 지원 (준비됨)
- ✅ 구글 시트 자동 백업 (매일 새벽 3시)

## 🔐 기본 관리자 계정

서버 최초 실행 시 자동 생성:
- **이메일**: director@hanmaum.com
- **비밀번호**: admin123
- **역할**: 관리자

⚠️ **보안을 위해 최초 로그인 후 반드시 비밀번호를 변경하세요!**

## 📡 API 엔드포인트

### 인증 (Auth)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입 (관리자만)
- `GET /api/auth/me` - 현재 사용자 정보
- `PUT /api/auth/change-password` - 비밀번호 변경

### 어르신 (Patients)
- `GET /api/patients` - 목록 조회 (검색 지원)
- `GET /api/patients/:id` - 상세 조회
- `POST /api/patients` - 신규 등록
- `PUT /api/patients/:id` - 정보 수정
- `DELETE /api/patients/:id` - 삭제
- `POST /api/patients/:id/health-records` - 건강 기록 추가
- `POST /api/patients/:id/files` - 파일 추가

### 예약 (Appointments)
- `GET /api/appointments` - 목록 조회 (필터 지원)
- `GET /api/appointments/date/:date` - 특정 날짜 예약
- `GET /api/appointments/:id` - 상세 조회
- `POST /api/appointments` - 신규 예약
- `PUT /api/appointments/:id` - 예약 수정
- `DELETE /api/appointments/:id` - 예약 삭제
- `PATCH /api/appointments/:id/status` - 상태 변경

### 사용자 (Users) - 관리자만
- `GET /api/users` - 사용자 목록
- `GET /api/users/:id` - 사용자 상세
- `PUT /api/users/:id` - 정보 수정
- `DELETE /api/users/:id` - 삭제
- `PATCH /api/users/:id/toggle-active` - 활성화/비활성화
- `PATCH /api/users/:id/change-role` - 역할 변경

### 백업
- `POST /api/backup/trigger` - 수동 백업 실행

### 헬스 체크
- `GET /health` - 서버 상태 확인

## 🔧 구글 시트 백업 설정 (선택사항)

### 1. Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성

### 2. Google Sheets API 활성화
1. API 및 서비스 > 라이브러리
2. "Google Sheets API" 검색 후 활성화

### 3. 서비스 계정 생성
1. API 및 서비스 > 사용자 인증 정보
2. 사용자 인증 정보 만들기 > 서비스 계정
3. 역할: 편집자
4. 키 생성 (JSON 형식)

### 4. 구글 시트 준비
1. 새 구글 스프레드시트 생성
2. 시트 이름: "어르신목록", "예약목록"
3. 서비스 계정 이메일과 시트 공유 (편집자 권한)
4. 스프레드시트 URL에서 ID 복사

### 5. 환경 변수 설정
`.env` 파일에 추가:
```
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

## 🚢 배포 (Railway 예시)

### 1. Railway 계정 생성
https://railway.app/ 접속 후 GitHub 연동

### 2. 프로젝트 생성
- New Project > Deploy from GitHub repo
- backend 폴더 선택

### 3. 환경 변수 설정
Railway 대시보드에서 모든 `.env` 변수 입력

### 4. 도메인 설정
- Settings > Generate Domain
- 또는 커스텀 도메인 연결

## 📊 모니터링

### 서버 상태 확인
```bash
curl http://localhost:5000/health
```

### 로그 확인
```bash
# 개발 환경
npm run dev

# 프로덕션
pm2 logs
```

## 🛠️ 트러블슈팅

### MongoDB 연결 실패
- Network Access에서 IP 화이트리스트 확인
- 연결 문자열에 비밀번호 특수문자 URL 인코딩

### 구글 시트 백업 실패
- 서비스 계정과 시트 공유 확인
- PRIVATE_KEY에서 `\n`이 실제 줄바꿈으로 변환되는지 확인

### 포트 충돌
`.env`에서 `PORT` 변경

## 📝 라이선스

MIT License
