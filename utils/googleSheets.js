const { google } = require('googleapis');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Google Sheets API 인증 설정
const getGoogleSheetsClient = () => {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Google Sheets auth error:', error);
    return null;
  }
};

// 어르신 정보 백업
const backupPatients = async () => {
  try {
    const sheets = getGoogleSheetsClient();
    if (!sheets) return { success: false, error: 'Google Sheets 인증 실패' };
    
    const patients = await Patient.find().sort({ createdAt: -1 });
    
    // 헤더 행
    const headers = [
      '번호', '성함', '생년월일', '연락처', '주소', '아파트',
      '보호자', '보호자관계', '보호자연락처', '건강상태', '의사소통',
      '주의사항', '등급', '재가센터', '서비스', '비고', '등록일'
    ];
    
    // 데이터 행
    const rows = patients.map((patient, index) => [
      index + 1,
      patient.name,
      patient.birth,
      patient.phone,
      patient.address,
      patient.apartment,
      patient.guardian,
      patient.guardianRelation,
      patient.guardianPhone,
      patient.healthStatus,
      patient.communication,
      patient.warnings.join(', '),
      patient.grade,
      patient.center,
      patient.services,
      patient.notes,
      patient.createdAt.toLocaleDateString('ko-KR')
    ]);
    
    // 시트 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: '어르신목록!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers, ...rows]
      }
    });
    
    console.log(`✅ 어르신 정보 백업 완료: ${patients.length}명`);
    return { success: true, count: patients.length };
  } catch (error) {
    console.error('Backup patients error:', error);
    return { success: false, error: error.message };
  }
};

// 예약 정보 백업
const backupAppointments = async () => {
  try {
    const sheets = getGoogleSheetsClient();
    if (!sheets) return { success: false, error: 'Google Sheets 인증 실패' };
    
    // 최근 3개월 예약만 백업
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    
    const appointments = await Appointment.find({
      date: { $gte: threeMonthsAgoStr }
    })
      .populate('patientId', 'name phone')
      .sort({ date: -1, time: -1 });
    
    const headers = [
      '번호', '날짜', '시간', '어르신', '연락처', '유형', '상태', '메모', '등록일'
    ];
    
    const rows = appointments.map((apt, index) => [
      index + 1,
      apt.date,
      apt.time,
      apt.patientId?.name || '(삭제됨)',
      apt.patientId?.phone || '',
      apt.type,
      apt.status,
      apt.notes,
      apt.createdAt.toLocaleDateString('ko-KR')
    ]);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: '예약목록!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers, ...rows]
      }
    });
    
    console.log(`✅ 예약 정보 백업 완료: ${appointments.length}건`);
    return { success: true, count: appointments.length };
  } catch (error) {
    console.error('Backup appointments error:', error);
    return { success: false, error: error.message };
  }
};

// 전체 백업 실행
const runFullBackup = async () => {
  console.log('🔄 구글 시트 백업 시작...');
  
  const results = {
    timestamp: new Date().toISOString(),
    patients: await backupPatients(),
    appointments: await backupAppointments()
  };
  
  console.log('✅ 구글 시트 백업 완료:', results);
  return results;
};

module.exports = {
  backupPatients,
  backupAppointments,
  runFullBackup
};
