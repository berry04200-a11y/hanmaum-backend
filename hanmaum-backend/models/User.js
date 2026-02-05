const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '이름을 입력해주세요'],
    trim: true
  },
  email: {
    type: String,
    required: [true, '이메일을 입력해주세요'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일을 입력해주세요']
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'nurse', 'admin'],
    default: 'patient'
  },
  phone: {
    type: String,
    required: [true, '전화번호를 입력해주세요']
  },
  // 의료진 전용 필드
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  // 환자 전용 필드
  dateOfBirth: {
    type: Date,
    required: function() { return this.role === 'patient'; }
  },
  address: {
    type: String,
    required: function() { return this.role === 'patient'; }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 비밀번호 암호화
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
