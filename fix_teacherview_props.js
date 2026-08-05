import fs from 'fs';
let code = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

code = code.replace(
  "export default function TeacherView({ \n  students, \n  onAddComment, \n  onSendNotification,\n  onAddStudent,\n  onAddMultipleStudents,\n  onEditStudent,\n  onDeleteStudent,\n  onUpdateGrade,\n  onUpdateMultipleGrades\n}: { \n  students: Student[],\n  classes?: SchoolClass[],\n  user?: UserAccount,\n  onAddComment",
  "export default function TeacherView({ \n  students, \n  classes, \n  user, \n  onAddComment, \n  onSendNotification,\n  onAddStudent,\n  onAddMultipleStudents,\n  onEditStudent,\n  onDeleteStudent,\n  onUpdateGrade,\n  onUpdateMultipleGrades\n}: { \n  students: Student[],\n  classes?: SchoolClass[],\n  user?: UserAccount,\n  onAddComment"
);

fs.writeFileSync('src/components/TeacherView.tsx', code);
