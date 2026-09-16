const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

c = c.replace(
  /\\\`Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày \(\\\$\{className \|\| ''\}\)\\\`/g,
  "\`Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày (${className || ''})\`"
);

fs.writeFileSync('src/components/TeacherDashboard.tsx', c);
