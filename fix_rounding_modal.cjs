const fs = require('fs');
const file = 'src/components/GradeDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /return \(totalScore \/ totalWeight\)\.toFixed\(1\);/g,
  "return (Math.round((totalScore / totalWeight) * 10) / 10).toFixed(1);"
);

fs.writeFileSync(file, content);
