const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(/export default function TeacherWeeklyPlan\(\{\s*classId,\s*role,\s*className,\s*schoolYearName\s*\}\s*:\s*\{\s*classId:\s*string,\s*role\?:\s*string,\s*className\?:\s*string,\s*schoolYearName\?:\s*string\s*\}\)/,
"export default function TeacherWeeklyPlan({ classId, role, className, schoolYearName, teacherName }: { classId: string, role?: string, className?: string, schoolYearName?: string, teacherName?: string })");

c = c.replace(/onClick=\{\(\) => exportWeeklyPlanToDocx\(className \|\| 'Chưa rõ', schoolYearName \|\| '2024-2025', currentWeekData\)\}/,
"onClick={() => exportWeeklyPlanToDocx(className || 'Chưa rõ', schoolYearName || '2024-2025', currentWeekData, teacherName || '')}");

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
