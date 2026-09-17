const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/ \.\.\.\(role !== 'staff' && role !== 'subject_teacher' \? \[\{ id: "grades", icon: BarChart2, label: "Điểm số" \}\] : \[\]\),\n/g, '');

fs.writeFileSync('src/components/TeacherView.tsx', c);
