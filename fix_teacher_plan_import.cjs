const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

if (!c.includes('exportWeeklyPlanToDocx')) {
  c = c.replace(/import \{ doc, getDoc, setDoc, onSnapshot \} from 'firebase\/firestore';/, 
    "import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';\nimport { exportWeeklyPlanToDocx } from '../lib/docxExport';");
  fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
}
