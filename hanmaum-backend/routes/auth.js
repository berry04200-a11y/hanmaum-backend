const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// JWT 토큰 생성 함수
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, dateOfBirth, address, licenseNumber, specialization } = req.body;

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 이메일입니다'
      });
    }

    // 사용자 생성 데이터 준비
    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
      phone
    };

    // 역할별 추가 필드
    if (role === 'patient') {
      userData.dateOfBirth = dateOfBirth;
      userData.address = address;
    } else if (role === 'doctor') {
      userData.licenseNumber = licenseNumber;
      userData.specialization = specialization;
    }

    // 사용자 생성
    const user = await User.create(userData);

    // 토큰 생성
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '회원가입 실패',
      error: error.message
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요'
      });
    }

    // 사용자 조회 (비밀번호 포함)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 비밀번호 확인
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 토큰 생성
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '로그인 실패',
      error: error.message
    });
  }
});

// 현재 사용자 정보 조회
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 정보 조회 실패',
      error: error.message
    });
  }
});

// 비밀번호 변경
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // 현재 비밀번호 확인
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다'
      });
    }

    // 새 비밀번호 설정
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '비밀번호 변경 실패',
      error: error.message
    });
  }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: '로그아웃 되었습니다'
  });
});

module.exports = router;
