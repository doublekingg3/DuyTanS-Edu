const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');
// Backup the old content just in case
fs.writeFileSync('src/components/TeacherStudents_backup.tsx', c);
