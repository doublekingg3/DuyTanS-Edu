const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award', 'term1IsExcellent', 'term2IsExcellent', 'yearIsExcellent'].includes(field);",
  "const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award', 'term1IsExcellent', 'term2IsExcellent', 'yearIsExcellent', 'term1RankOverride', 'term2RankOverride', 'yearRankOverride'].includes(field);"
);

content = content.replace(
  "const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award', 'term1IsExcellent', 'term2IsExcellent', 'yearIsExcellent'].includes(update.field);",
  "const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award', 'term1IsExcellent', 'term2IsExcellent', 'yearIsExcellent', 'term1RankOverride', 'term2RankOverride', 'yearRankOverride'].includes(update.field);"
);

fs.writeFileSync(file, content);
