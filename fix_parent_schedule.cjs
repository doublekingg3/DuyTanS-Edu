const fs = require('fs');
const file = 'src/components/ParentSchedule.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const dayKey = \\`t\\${dayIdx + 2}\\` as keyof SchedulePeriod;", "const dayKey = `t${dayIdx + 2}` as keyof SchedulePeriod;");

fs.writeFileSync(file, content);
