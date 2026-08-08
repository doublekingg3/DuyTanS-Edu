const fs = require('fs');
const file = 'src/components/TeacherStudents.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    "const code = `${cohort}_${stt.toString().padStart(4, '0')}`;",
    "const code = `${cohort}${stt.toString().padStart(3, '0')}`;"
);

code = code.replace(
    "code: `${cohort}_${nextId.toString().padStart(4, '0')}`,",
    "code: `${cohort}${nextId.toString().padStart(3, '0')}`,"
);

code = code.replace(
    "<span className=\"text-slate-400\">Mã HS:</span> <span className=\"font-mono font-medium text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded\">{selectedStudent.id}</span>",
    "<span className=\"text-slate-400\">Mã HS:</span> <span className=\"font-mono font-medium text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded\">{selectedStudent.code || selectedStudent.id}</span>"
);

fs.writeFileSync(file, code);
