const fs = require('fs');
const file = 'src/components/TeacherGrades.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /tb = \(\(h1Val \+ h2Val \* 2\) \/ 3\)\.toFixed\(1\);/g,
  "tb = (Math.round(((h1Val + h2Val * 2) / 3) * 10) / 10).toFixed(1);"
);

content = content.replace(
  /tb = h2Val\.toFixed\(1\);/g,
  "tb = (Math.round(h2Val * 10) / 10).toFixed(1);"
);

content = content.replace(
  /tb = h1Val\.toFixed\(1\);/g,
  "tb = (Math.round(h1Val * 10) / 10).toFixed(1);"
);

content = content.replace(
  /tb = \(totalScore \/ totalWeight\)\.toFixed\(1\);/g,
  "tb = (Math.round((totalScore / totalWeight) * 10) / 10).toFixed(1);"
);

content = content.replace(
  /currentGrades\[k\] = Number\(simulated\.toFixed\(1\)\) as never;/g,
  "currentGrades[k] = (Math.round(simulated * 10) / 10) as never;"
);

fs.writeFileSync(file, content);
