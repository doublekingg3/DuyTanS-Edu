const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      Array.from(promoteClassData.studentsToPromote as Set<string>).forEach((studentId: string) => {
        const docRef = doc(db, 'students', studentId);
        batch.update(docRef, { classId: promoteClassData.targetClassId });
        count++;
      });`;

const replaceStr = `      Array.from(promoteClassData.studentsToPromote as Set<string>).forEach((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const newId = uuidv4();
          const docRef = doc(db, 'students', newId);
          
          const newStudent = {
            id: newId,
            classId: promoteClassData.targetClassId,
            code: student.code || '',
            fullName: student.fullName,
            gender: student.gender || 'Nam',
            ethnicity: student.ethnicity || 'Kinh',
            parentName: student.parentName || '',
            parentPhone: student.parentPhone || '',
            status: 'Đang học',
            academicPerformance: '',
            conduct: '',
            cp: 0,
            kp: 0,
            award: '',
            grades: {
              math: 0, physics: 0, chemistry: 0, biology: 0, it: 0, localEdu: 'Đ', literature: 0, history: 0, foreignLanguage: 0, pe: 'Đ', defense: 0, japanese: 0, experiential: 'Đ', technology: 0, geography: 0, civicEdu: 0
            },
            term1Grades: {},
            term2Grades: {},
            yearGrades: {},
            term1Details: {},
            term2Details: {},
            displayGrades: {},
            comments: [],
            notifications: [],
            attendanceRecords: {}
          };
          
          batch.set(docRef, newStudent);
          count++;
        }
      });`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
