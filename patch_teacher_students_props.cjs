const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(/export default function TeacherStudents\(\{ \n  students, \n  classId,\n  onAddComment, \n  onSendNotification,\n  onAddStudent,\n  onAddMultipleStudents,\n  onEditStudent,\n  onDeleteStudent,\n  classes,\n  schoolYears\n\}: \{ \n  students: Student\[\],\n  classId: string,\n  onAddComment: \(studentId: string, text: string\) => void,\n  onSendNotification: \(studentId: string, title: string, message: string\) => void,\n  onAddStudent: \(student: Student\) => void,\n  onAddMultipleStudents\?: \(students: Student\[\]\) => void,\n  onEditStudent: \(student: Student\) => void,\n  onDeleteStudent: \(studentId: string\) => void,\n  classes: SchoolClass\[\],\n  schoolYears: SchoolYear\[\]\n\}\) \{/g, `export default function TeacherStudents({ 
  role,
  students, 
  classId,
  onAddComment, 
  onSendNotification,
  onAddStudent,
  onAddMultipleStudents,
  onEditStudent,
  onDeleteStudent,
  classes,
  schoolYears
}: { 
  role?: string,
  students: Student[],
  classId: string,
  onAddComment: (studentId: string, text: string) => void,
  onSendNotification: (studentId: string, title: string, message: string) => void,
  onAddStudent: (student: Student) => void,
  onAddMultipleStudents?: (students: Student[]) => void,
  onEditStudent: (student: Student) => void,
  onDeleteStudent: (studentId: string) => void,
  classes: SchoolClass[],
  schoolYears: SchoolYear[]
}) {`);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
