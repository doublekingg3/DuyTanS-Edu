const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(
  /{ id: "admin_reports", icon: BarChart2, label: "Báo cáo thống kê" },\n/g,
  ""
);

fs.writeFileSync('src/components/TeacherView.tsx', c);
