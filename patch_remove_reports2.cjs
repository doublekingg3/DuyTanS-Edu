const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(
  /activeMenu === 'admin_reports' \? 'reports' :\n/g,
  ""
);

fs.writeFileSync('src/components/TeacherView.tsx', c);
