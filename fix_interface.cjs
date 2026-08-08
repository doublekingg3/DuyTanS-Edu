const fs = require('fs');
const file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "term2Details?: DetailedGrades;",
  "term2Details?: DetailedGrades;\n  term1IsExcellent?: boolean;\n  term2IsExcellent?: boolean;\n  yearIsExcellent?: boolean;"
);

fs.writeFileSync(file, content);
