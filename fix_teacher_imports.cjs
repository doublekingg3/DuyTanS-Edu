const fs = require('fs');
const file = 'src/components/TeacherView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { Student, SchoolClass, UserAccount, SchoolYear } from '../data';",
  "import { Student, SchoolClass, UserAccount, SchoolYear, ClassSchedule, SchedulePeriod } from '../data';"
);
fs.writeFileSync(file, content);
