const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "export default function ParentView({ student, allStudents, classes, schoolYears }: { student: Student, allStudents: Student[], classes: import('../data').SchoolClass[], schoolYears: import('../data').SchoolYear[] }) {",
  "export default function ParentView({ student: initialStudent, allStudents, classes, schoolYears }: { student: Student, allStudents: Student[], classes: import('../data').SchoolClass[], schoolYears: import('../data').SchoolYear[] }) {"
);

code = code.replace(/if \(\!student\?\.code\) return \[student\];/g, "if (!initialStudent?.code) return [initialStudent];");
code = code.replace(/return allStudents\.filter\(s => s\.code === student\.code\);/g, "return allStudents.filter(s => s.code === initialStudent.code);");
code = code.replace(/\]\), \[student, allStudents\]\);/g, "]), [initialStudent, allStudents]);");
code = code.replace(/const \[selectedHistoryId, setSelectedHistoryId\] = useState<string>\(student\.id\);/g, "const [selectedHistoryId, setSelectedHistoryId] = useState<string>(initialStudent.id);");
code = code.replace(/useEffect\(\(\) => \{\n    setSelectedHistoryId\(student\.id\);\n  \}, \[student\.id\]\);/g, "useEffect(() => {\n    setSelectedHistoryId(initialStudent.id);\n  }, [initialStudent.id]);");
code = code.replace(/return studentHistory\.find\(s => s\.id === selectedHistoryId\) \|\| student;/g, "return studentHistory.find(s => s.id === selectedHistoryId) || initialStudent;");
code = code.replace(/\}, \[selectedHistoryId, studentHistory, student\]\);/g, "}, [selectedHistoryId, studentHistory, initialStudent]);");

fs.writeFileSync(file, code);
