const fs = require('fs');
const file = 'src/components/TeacherStudents.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr1 = `        const id = \`HS\${Math.random().toString(36).substring(2, 6).toUpperCase()}\`;
        
        newStudents.push({
          id,`;

const replaceStr1 = `        const id = uuidv4();
        const code = \`HS\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`;
        
        newStudents.push({
          id,
          code,`;

code = code.replace(targetStr1, replaceStr1);

const targetStr2 = `    if (modalMode === 'add') {
      const newStudent: Student = {
        ...(editForm as Student),
        id: uuidv4(),
        classId: classId,
        stt: students.length + 1
      };`;

const replaceStr2 = `    if (modalMode === 'add') {
      const newStudent: Student = {
        ...(editForm as Student),
        id: uuidv4(),
        code: \`HS\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`,
        classId: classId,
        stt: students.length + 1
      };`;

code = code.replace(targetStr2, replaceStr2);
fs.writeFileSync(file, code);
