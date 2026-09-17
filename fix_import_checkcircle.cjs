const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(/Check, FileSpreadsheet, Trash2/g, 'Check, FileSpreadsheet, Trash2, CheckCircle');

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
