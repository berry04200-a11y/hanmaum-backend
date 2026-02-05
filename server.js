require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

// 라우터 import
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');

// 유틸리티 import
const { runFullBackup } = require('./utils/googleSheets');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    
    // 초기 관리자 계정 생성 (없을 경우)
    initializeAdmin();
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err);
    process.exit(1);
  });

// 초기 관리자 계정 생성
const initializeAdmin = async () => {
  try {
    const User = require('./models/User');
    const adminEmail = 'director@hanmaum.com';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const admin = new User({
        name: '김서우',
        email: adminEmail,
        password: 'admin123',
        title: '재택의료센터 실장',
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ 초기 관리자 계정 생성 완료');
      console.log('   이메일:', adminEmail);
      console.log('   비밀번호: admin123');
      console.log('   ⚠️  보안을 위해 최초 로그인 후 비밀번호를 변경하세요!');
    }
  } catch (error) {
    console.error('초기 관리자 계정 생성 실패:', error);
  }
};

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// 구글 시트 백업 수동 트리거 엔드포인트
app.post('/api/backup/trigger', async (req, res) => {
  try {
    const results = await runFullBackup();
    res.json({
      message: '백업이 완료되었습니다.',
      results
    });
  } catch (error) {
    console.error('Backup trigger error:', error);
    res.status(500).json({ error: '백업 중 오류가 발생했습니다.' });
  }
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: '한마음의원 재택의료센터 API 서버',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      appointments: '/api/appointments',
      users: '/api/users',
      health: '/health'
    }
  });
});

// 404 에러 핸들링
app.use((req, res) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 전역 에러 핸들링
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || '서버 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 구글 시트 자동 백업 스케줄러 (매일 새벽 3시)
if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
  cron.schedule('0 3 * * *', async () => {
    console.log('⏰ 정기 백업 시작...');
    await runFullBackup();
  }, {
    timezone: 'Asia/Seoul'
  });
  
  console.log('⏰ 구글 시트 자동 백업 스케줄러 활성화 (매일 03:00)');
}

// 서버 시작
app.listen(PORT, () => {
  console.log('');
  console.log('🏥 한마음의원 재택의료센터 API 서버');
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📊 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호 수신. 서버를 종료합니다...');
  await mongoose.connection.close();
  process.exit(0);
});
