# 한마음의원 재택의료센터 백엔드

## 🏥 프로젝트 소개
한마음의원 재택의료센터의 백엔드 API 서버입니다. 환자 관리, 방문 예약, 진료 기록 등의 기능을 제공합니다.

## 🚀 기술 스택
- **Node.js** & **Express.js** - 서버 프레임워크
- **MongoDB** & **Mongoose** - 데이터베이스
- **JWT** - 인증/인가
- **bcryptjs** - 비밀번호 암호화

## 📋 주요 기능

### ✅ 완료된 기능
- [x] 사용자 인증 시스템 (회원가입/로그인)
- [x] JWT 기반 토큰 인증
- [x] 역할 기반 접근 제어 (환자/의사/간호사/관리자)
- [x] 비밀번호 암호화 및 보안

### 🔜 개발 예정
- [ ] 환자 관리 시스템
- [ ] 방문 예약 시스템
- [ ] 진료 기록 관리
- [ ] 처방전 관리
- [ ] 파일 업로드 (Cloudinary)

## 🛠️ 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/berry04200-a11y/hanmaum-backend.git
cd hanmaum-backend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 값을 입력합니다.

```bash
cp .env.example .env
```

`.env` 파일 설정:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

### 4. 서버 실행

**개발 모드:**
```bash
npm run dev
```

**프로덕션 모드:**
```bash
npm start
```

서버가 `http://localhost:5000`에서 실행됩니다.

## 📡 API 엔드포인트

### 인증 (Auth)

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "010-1234-5678",
  "dateOfBirth": "1990-01-01",
  "address": "서울시 강남구"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "hong@example.com",
  "password": "password123"
}
```

응답:
```json
{
  "success": true,
  "message": "로그인 성공",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123456",
    "name": "홍길동",
    "email": "hong@example.com",
    "role": "patient"
  }
}
```

#### 내 정보 조회
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### 비밀번호 변경
```http
PUT /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### 헬스 체크
```http
GET /health
```

## 🔐 인증 방식

모든 보호된 엔드포인트는 JWT 토큰이 필요합니다.

**요청 헤더에 포함:**
```
Authorization: Bearer {your_jwt_token}
```

## 👥 사용자 역할

- **patient** (환자) - 기본 역할
- **doctor** (의사) - 진료 및 처방 권한
- **nurse** (간호사) - 환자 관리 권한
- **admin** (관리자) - 전체 시스템 관리 권한

## 📁 프로젝트 구조

```
hanmaum-backend/
├── models/           # 데이터베이스 모델
│   └── User.js
├── routes/           # API 라우트
│   └── auth.js
├── middleware/       # 미들웨어
│   └── auth.js
├── utils/            # 유틸리티 함수
├── server.js         # 메인 서버 파일
├── package.json
├── .env.example
└── README.md
```

## 🔧 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `PORT` | 서버 포트 | ❌ (기본값: 5000) |
| `NODE_ENV` | 실행 환경 | ❌ (기본값: development) |
| `MONGODB_URI` | MongoDB 연결 문자열 | ✅ |
| `JWT_SECRET` | JWT 시크릿 키 | ✅ |
| `FRONTEND_URL` | 프론트엔드 URL (CORS) | ❌ |

## 🚀 배포

### Render.com 배포
1. Render.com에 로그인
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 환경변수 설정
5. 배포

## 📝 라이선스
MIT License

## 👨‍💻 개발자
berry04200-a11y

---

**문의사항이나 버그 리포트는 Issues 탭에 등록해주세요!**
