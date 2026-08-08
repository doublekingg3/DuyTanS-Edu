const fs = require('fs');
const file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "  yearIsExcellent?: boolean;",
  "  yearIsExcellent?: boolean;\n  term1RankOverride?: string;\n  term2RankOverride?: string;\n  yearRankOverride?: string;"
);

fs.writeFileSync(file, content);
