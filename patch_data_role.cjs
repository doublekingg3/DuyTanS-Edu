const fs = require('fs');
let c = fs.readFileSync('src/data.ts', 'utf8');
c = c.replace(/role: 'admin' \| 'teacher' \| 'staff';/g, "role: 'admin' | 'teacher' | 'subject_teacher' | 'staff';");
fs.writeFileSync('src/data.ts', c);
