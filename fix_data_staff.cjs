const fs = require('fs');
let c = fs.readFileSync('src/data.ts', 'utf8');
c = c.replace(/\{ id: 'u2', username: 'teacher', password: 'teacher', role: 'teacher', fullName: 'Giáo viên' \}\n\];/, 
  "{ id: 'u2', username: 'teacher', password: 'teacher', role: 'teacher', fullName: 'Giáo viên' },\n  { id: 'u3', username: 'staff', password: 'staff', role: 'staff', fullName: 'Giáo vụ' }\n];");
fs.writeFileSync('src/data.ts', c);
