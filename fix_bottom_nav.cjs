const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/flex justify-around items-center overflow-x-auto shadow-\[0_-4px_6px_-1px_rgb\(0,0,0,0\.05\)\] hide-scrollbar/g, 
  "flex justify-start items-center overflow-x-auto shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] hide-scrollbar gap-2");

fs.writeFileSync('src/components/TeacherView.tsx', c);
