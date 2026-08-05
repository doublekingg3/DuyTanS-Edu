const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /\.filter\(u => u\.fullName\.toLowerCase\(\)\.includes\(teacherSearchTerm\.toLowerCase\(\)\) \|\| u\.username\.toLowerCase\(\)\.includes\(teacherSearchTerm\.toLowerCase\(\)\)\)/g,
  ".filter(u => (u.fullName || '').toLowerCase().includes((teacherSearchTerm || '').toLowerCase()) || (u.username || '').toLowerCase().includes((teacherSearchTerm || '').toLowerCase()))"
);

fs.writeFileSync(file, code);
