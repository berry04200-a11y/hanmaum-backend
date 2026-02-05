const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

// 모든 라우트에 인증 필요
router.use(auth);

// 전체 어르신 목록 조회 (검색 기능 포함)
router.get('/', async (req, res) => {
  try {
    const { search, healthStatus, grade } = req.query;
    
    let query = {};
    
    // 검색 조건 추가
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (healthStatus) {
      query.healthStatus = healthStatus;
    }
    
    if (grade) {
      query.grade = grade;
    }
    
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 });
    
    res.json({ patients, count: patients.length });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: '어르신 목록을 가져오는데 실패했습니다.' });
  }
});

// 특정 어르신 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    res.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: '어르신 정보를 가져오는데 실패했습니다.' });
  }
});

// 새 어르신 등록
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;
    
    const patient = new Patient(patientData);
    await patient.save();
    
    res.status(201).json({
      message: '어르신이 등록되었습니다.',
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: '어르신 등록 중 오류가 발생했습니다.' });
  }
});

// 어르신 정보 수정
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    res.json({
      message: '어르신 정보가 수정되었습니다.',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: '어르신 정보 수정 중 오류가 발생했습니다.' });
  }
});

// 어르신 삭제
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '어르신 정보가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: '어르신 정보 삭제 중 오류가 발생했습니다.' });
  }
});

// 건강 기록 추가
router.post('/:id/health-records', async (req, res) => {
  try {
    const { date, content } = req.body;
    
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    patient.healthRecords.unshift({ date, content });
    await patient.save();
    
    res.json({
      message: '건강 기록이 추가되었습니다.',
      patient
    });
  } catch (error) {
    console.error('Add health record error:', error);
    res.status(500).json({ error: '건강 기록 추가 중 오류가 발생했습니다.' });
  }
});

// 건강 기록 삭제
router.delete('/:id/health-records/:recordId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    patient.healthRecords.id(req.params.recordId).remove();
    await patient.save();
    
    res.json({
      message: '건강 기록이 삭제되었습니다.',
      patient
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ error: '건강 기록 삭제 중 오류가 발생했습니다.' });
  }
});

// 파일 정보 추가 (실제 업로드는 별도 라우트에서)
router.post('/:id/files', async (req, res) => {
  try {
    const { name, url, cloudinaryId, size } = req.body;
    
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    patient.files.push({ name, url, cloudinaryId, size });
    await patient.save();
    
    res.json({
      message: '파일이 추가되었습니다.',
      patient
    });
  } catch (error) {
    console.error('Add file error:', error);
    res.status(500).json({ error: '파일 추가 중 오류가 발생했습니다.' });
  }
});

// 파일 삭제
router.delete('/:id/files/:fileId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    patient.files.id(req.params.fileId).remove();
    await patient.save();
    
    res.json({
      message: '파일이 삭제되었습니다.',
      patient
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: '파일 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
