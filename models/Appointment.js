const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['정기방문', '방문간호', '목욕서비스', '긴급방문', '검진']
  },
  status: {
    type: String,
    enum: ['예정', '완료', '취소', '노쇼'],
    default: '예정'
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 복합 인덱스 (날짜별 검색 최적화)
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });

appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
