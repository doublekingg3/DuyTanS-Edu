const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/CalendarIconIcon/g, "CalendarIcon");

fs.writeFileSync('src/components/TeacherView.tsx', c);
