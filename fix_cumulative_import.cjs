const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(/import \{ exportWeeklyPlanToDocx \} from '\.\.\/lib\/docxExport';/, 
  "import { exportWeeklyPlanToDocx } from '../lib/docxExport';\nimport { exportCumulativePlanToDocx } from '../lib/docxCumulativeExport';");

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
