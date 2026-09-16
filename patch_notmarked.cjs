const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

c = c.replace(
  /\{todayStats\.notMarked > 0 && \(/g,
  "{todayStats.total > 0 && todayStats.notMarked > 0 && ("
);

fs.writeFileSync('src/components/TeacherDashboard.tsx', c);
