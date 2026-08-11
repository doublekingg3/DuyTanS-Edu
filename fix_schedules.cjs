const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherSchedule.tsx', 'utf8');
content = content.replace("if (!classId) return;", "if (!classId) { setIsLoading(false); return; }");
fs.writeFileSync('src/components/TeacherSchedule.tsx', content);

content = fs.readFileSync('src/components/ParentSchedule.tsx', 'utf8');
content = content.replace("if (!classId) return;", "if (!classId) { setIsLoading(false); return; }");
fs.writeFileSync('src/components/ParentSchedule.tsx', content);

let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace("  }", "    match /schedules/{scheduleId} {\n      allow read, write: if true;\n    }\n  }");
fs.writeFileSync('firestore.rules', rules);
