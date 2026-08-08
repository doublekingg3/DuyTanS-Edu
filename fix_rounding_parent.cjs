const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /return Number\(\(sum \/ numericGrades\.length\)\.toFixed\(1\)\);/g,
  "return Math.round((sum / numericGrades.length) * 10) / 10;"
);

content = content.replace(
  /return Number\(simulated\.toFixed\(1\)\);/g,
  "return Math.round(simulated * 10) / 10;"
);

content = content.replace(
  /const diff = Number\(\(value - \(baseScore as number\)\)\.toFixed\(1\)\);/g,
  "const diff = Math.round((value - (baseScore as number)) * 10) / 10;"
);

fs.writeFileSync(file, content);
