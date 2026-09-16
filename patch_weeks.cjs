const fs = require('fs');

function patchFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/length: 38/g, 'length: 42');
  c = c.replace(/38 tuần/g, '42 tuần');
  c = c.replace(/3 \/ 38 tuần/g, '3 / 42 tuần');
  c = c.replace(/3\/38/g, '3/42');
  c = c.replace(/\.slice\(0, 12\)/g, '');
  fs.writeFileSync(file, c);
}

patchFile('src/components/TeacherWeeklyPlan.tsx');
patchFile('src/components/TeacherLunchMenu.tsx');
patchFile('src/components/ParentLunchMenu.tsx');
