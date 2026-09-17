const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(/'Họ và tên': s\.name,/g, "'Họ và tên': s.fullName,");

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
