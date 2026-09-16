const fs = require('fs');

const fixFile = (path) => {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/\\`/g, '`');
  c = c.replace(/\\\$/g, '$');
  fs.writeFileSync(path, c);
};

fixFile('src/components/TeacherLunchMenu.tsx');
fixFile('src/components/TeacherWeeklyPlan.tsx');
fixFile('src/components/TeacherStudents.tsx');
