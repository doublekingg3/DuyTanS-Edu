const fs = require('fs');
const file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf8');

const types = `
export interface SchedulePeriod {
  time: string;
  t2: string;
  t3: string;
  t4: string;
  t5: string;
  t6: string;
  t7: string;
}

export interface ClassSchedule {
  classId: string;
  periods: SchedulePeriod[];
  updatedAt: number;
}
`;

content = content + "\n" + types;
fs.writeFileSync(file, content);
