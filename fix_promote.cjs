const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldPromote = `      Array.from(promoteClassData.studentsToPromote as Set<string>).forEach((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const newId = uuidv4();
          const docRef = doc(db, 'students', newId);
          
          const newStudent = {
            id: newId,
            classId: promoteClassData.targetClassId, code: student.code || '',
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

const newPromote = `      Array.from(promoteClassData.studentsToPromote as Set<string>).forEach((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const oldClass = classes.find(c => c.id === student.classId);
          const historyEntry = {
            classId: student.classId,
            className: oldClass?.name || '',
            schoolYearId: oldClass?.schoolYearId || '',
            grades: student.grades || {},
            term1Grades: student.term1Grades || {},
            term2Grades: student.term2Grades || {},
            yearGrades: student.yearGrades || {},
            academicPerformance: student.academicPerformance || '',
            conduct: student.conduct || '',
            cp: student.cp || 0,
            kp: student.kp || 0,
            award: student.award || ''
          };
          
          const docRef = doc(db, 'students', student.id);
          const updatedStudent = {
            classId: promoteClassData.targetClassId,
            historicalRecords: [...(student.historicalRecords || []), historyEntry],
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
          
          batch.update(docRef, updatedStudent);
          count++;
        }
      });`;

code = code.replace(oldPromote, newPromote);
fs.writeFileSync(file, code);
