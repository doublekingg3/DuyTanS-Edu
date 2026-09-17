const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/className="flex-1 overflow-hidden relative flex flex-col pb-\[72px\] md:pb-0"/g, 
  'className="flex-1 overflow-hidden relative flex flex-col pb-20 md:pb-0"');

fs.writeFileSync('src/components/TeacherView.tsx', c);
