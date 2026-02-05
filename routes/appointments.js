const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

router.use(auth);

// 전체 예약 조회 (날짜 범위, 환자별 필터링)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, patientId, status } = req.query;
    
    let query = {};
    
    // 날짜 범위 필터
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }
    
    // 환자별 필터
    if (patientId) {
      query.patientId = patientId;
    }
    
    // 상태별 필터
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name phone address healthStatus')
      .populate('createdBy', 'name')
      .sort({ date: 1, time: 1 });
    
    res.json({ appointments, count: appointments.length });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: '예약 목록을 가져오는데 실패했습니다.' });
  }
});

// 특정 날짜의 예약 조회
router.get('/date/:date', async (req, res) => {
  try {
    const appointments = await Appointment.find({ date: req.params.date })
      .populate('patientId', 'name phone address healthStatus warnings')
      .sort({ time: 1 });
    
    res.json({ appointments, count: appointments.length });
  } catch (error) {
    console.error('Get appointments by date error:', error);
    res.status(500).json({ error: '예약을 가져오는데 실패했습니다.' });
  }
});

// 특정 예약 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('createdBy', 'name');
    
    if (!appointment) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: '예약 정보를 가져오는데 실패했습니다.' });
  }
});

// 새 예약 생성
router.post('/', async (req, res) => {
  try {
    const { patientId, date, time, type, notes } = req.body;
    
    // 환자 존재 확인
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: '어르신을 찾을 수 없습니다.' });
    }
    
    // 동일 시간대 예약 중복 확인
    const existingAppointment = await Appointment.findOne({ date, time });
    if (existingAppointment) {
      return res.status(400).json({ error: '해당 시간에 이미 예약이 있습니다.' });
    }
    
    const appointment = new Appointment({
      patientId,
      date,
      time,
      type,
      notes: notes || '',
      createdBy: req.userId
    });
    
    await appointment.save();
    
    // populate 후 반환
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name phone address')
      .populate('createdBy', 'name');
    
    res.status(201).json({
      message: '예약이 등록되었습니다.',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: '예약 등록 중 오류가 발생했습니다.' });
  }
});

// 예약 수정
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // 시간 변경 시 중복 확인
    if (updates.date || updates.time) {
      const date = updates.date || (await Appointment.findById(req.params.id)).date;
      const time = updates.time || (await Appointment.findById(req.params.id)).time;
      
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        date,
        time
      });
      
      if (existingAppointment) {
        return res.status(400).json({ error: '해당 시간에 이미 예약이 있습니다.' });
      }
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name phone address')
      .populate('createdBy', 'name');
    
    if (!appointment) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    res.json({
      message: '예약이 수정되었습니다.',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: '예약 수정 중 오류가 발생했습니다.' });
  }
});

// 예약 삭제
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '예약이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: '예약 삭제 중 오류가 발생했습니다.' });
  }
});

// 예약 상태 변경 (완료, 취소 등)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['예정', '완료', '취소', '노쇼'].includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다.' });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    )
      .populate('patientId', 'name phone address');
    
    if (!appointment) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    res.json({
      message: '예약 상태가 변경되었습니다.',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: '예약 상태 변경 중 오류가 발생했습니다.' });
  }
});

// 통계: 날짜 범위별 예약 수
router.get('/stats/count', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const total = await Appointment.countDocuments(query);
    const byStatus = await Appointment.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: '통계를 가져오는데 실패했습니다.' });
  }
});

module.exports = router;
