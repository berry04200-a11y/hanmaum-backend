const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  birth: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  apartment: {
    type: String,
    default: ''
  },
  guardian: {
    type: String,
    default: ''
  },
  guardianRelation: {
    type: String,
    default: ''
  },
  guardianPhone: {
    type: String,
    default: ''
  },
  healthStatus: {
    type: String,
    enum: ['양호', '관찰필요', '주의'],
    default: '양호'
  },
  communication: {
    type: String,
    default: '원활'
  },
  warnings: [{
    type: String
  }],
  grade: {
    type: String,
    default: ''
  },
  center: {
    type: String,
    default: ''
  },
  services: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  healthRecords: [{
    date: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  files: [{
    name: String,
    url: String,
    cloudinaryId: String,
    size: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 자동 갱신
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
