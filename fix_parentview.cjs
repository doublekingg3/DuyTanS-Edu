const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{student\.academicPerformance === 'T' \? 'Tốt' : student\.academicPerformance === 'K' \? 'Khá' : 'Đạt'\}/g,
  "{student.academicPerformance === 'T' ? 'Tốt' : student.academicPerformance === 'K' ? 'Khá' : student.academicPerformance === 'Đ' ? 'Đạt' : (student.academicPerformance || 'Chưa đánh giá')}"
);

fs.writeFileSync(file, content);
