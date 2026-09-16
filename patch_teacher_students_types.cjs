const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const defaultGradesStr = `{ math: '', physics: '', chemistry: '', biology: '', it: '', technology: '', localEdu: '', literature: '', history: '', geography: '', civicEdu: '', foreignLanguage: '', pe: '', defense: '', japanese: '', experiential: '' }`;

// Import section
c = c.replace(
  `          gender: row[2] || 'Nam',
          ethnicity: row[3] || 'Kinh',
          dateOfBirth: row[4] || '01/01/2000',
          placeOfBirth: row[5] || 'Chưa cập nhật',
          classId: classId,
          grades: [],
          conduct: [],`,
  `          gender: (row[2] || 'Nam') as 'Nam' | 'Nữ',
          ethnicity: row[3] || 'Kinh',
          dob: row[4] || '01/01/2000',
          pob: row[5] || 'Chưa cập nhật',
          classId: classId,
          stt: 0, cp: 0, kp: 0, award: '', status: '', academicPerformance: '',
          comments: [], notifications: [],
          grades: ${defaultGradesStr},
          conduct: '',`
);

// Add modal section
c = c.replace(
  `      gender: newStudentGender,
      ethnicity: newStudentEthnicity,
      dateOfBirth: newStudentDob || '01/01/2000',
      placeOfBirth: '',
      classId: classId,
      grades: [],
      conduct: [],`,
  `      gender: newStudentGender as 'Nam' | 'Nữ',
      ethnicity: newStudentEthnicity,
      dob: newStudentDob || '01/01/2000',
      pob: '',
      classId: classId,
      stt: 0, cp: 0, kp: 0, award: '', status: '', academicPerformance: '',
      comments: [], notifications: [],
      grades: ${defaultGradesStr},
      conduct: '',`
);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
