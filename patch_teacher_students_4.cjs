const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const target1 = `title="Tải file mẫu Excel"`;
c = c.replace(target1, `title="Tải mẫu Excel (Dùng để nhập HS mới)"`);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
