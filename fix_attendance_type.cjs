const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

content = content.replace(
  "const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});",
  "const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'leave_early'>>({});"
);

fs.writeFileSync('src/components/TeacherStudents.tsx', content);
