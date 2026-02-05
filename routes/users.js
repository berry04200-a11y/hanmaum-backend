const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// 모든 라우트에 인증 필요
router.use(auth);

// 전체 사용자 목록 조회 (관리자만)
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: '사용자 목록을 가져오는데 실패했습니다.' });
  }
});

// 특정 사용자 조회 (관리자만)
router.get('/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '사용자 정보를 가져오는데 실패했습니다.' });
  }
});

// 사용자 정보 수정 (관리자만, 또는 본인)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 본인 또는 관리자만 수정 가능
    if (req.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }
    
    const updates = req.body;
    
    // 비밀번호는 별도 라우트에서만 변경 가능
    delete updates.password;
    
    // 일반 사용자는 role 변경 불가
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.isActive;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({
      message: '사용자 정보가 수정되었습니다.',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '사용자 정보 수정 중 오류가 발생했습니다.' });
  }
});

// 사용자 삭제 (관리자만)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 자기 자신은 삭제 불가
    if (req.userId.toString() === userId) {
      return res.status(400).json({ error: '본인 계정은 삭제할 수 없습니다.' });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: '사용자 삭제 중 오류가 발생했습니다.' });
  }
});

// 사용자 활성화/비활성화 (관리자만)
router.patch('/:id/toggle-active', adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 자기 자신은 비활성화 불가
    if (req.userId.toString() === userId) {
      return res.status(400).json({ error: '본인 계정은 비활성화할 수 없습니다.' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `사용자가 ${user.isActive ? '활성화' : '비활성화'}되었습니다.`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({ error: '사용자 상태 변경 중 오류가 발생했습니다.' });
  }
});

// 사용자 역할 변경 (관리자만)
router.patch('/:id/change-role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'nurse', 'staff'].includes(role)) {
      return res.status(400).json({ error: '유효하지 않은 역할입니다.' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({
      message: '사용자 역할이 변경되었습니다.',
      user
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ error: '역할 변경 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
