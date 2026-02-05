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
    trim: true
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'nurse', 'doctor', 'admin'],
    default: 'patient'
  },
  title: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
