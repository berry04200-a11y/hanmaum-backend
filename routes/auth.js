const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// JWT 토큰 생성 함수
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 일반 회원가입 (누구나 가능 - 테스트용)
router.post('/register-public', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, address, role } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: '이미 존재하는 이메일입니다.' 
      });
    }

    // 새 사용자 생성 (기본값: patient)
    const user = new User({
      name,
      email,
      password,
      role: role || 'patient',
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      address: address || '',
      title: ''
    });

    await user.save();

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
    console.error('Register public error:', error);
    res.status(500).json({ 
      success: false,
      error: '회원가입 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 회원가입 (관리자만 가능)
router.post('/register', auth, async (req, res) => {
  try {
    // 관리자만 새 사용자 등록 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const { name, email, password, title, role } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    // 새 사용자 생성
    const user = new User({
      name,
      email,
      password,
      title: title || '',
      role: role || 'nurse'
    });

    await user.save();

    res.status(201).json({
      message: '사용자가 등록되었습니다.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      return res.status(401).json({ error: '비활성화된 계정입니다.' });
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();

    // JWT 토큰 생성
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 현재 로그인한 사용자 정보 가져오기
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        title: req.user.title,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: '사용자 정보를 가져오는데 실패했습니다.' });
  }
});

// 비밀번호 변경
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 현재 비밀번호 확인
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 새 비밀번호 설정
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
