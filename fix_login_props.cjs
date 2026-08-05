const fs = require('fs');
const file = 'src/components/Login.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "export default function Login({ \n  classes, \n  students,\n  users,\n  onLogin,\n  onBack \n}: { \n  classes: SchoolClass[],\n  students: Student[],\n  users: UserAccount[],\n  onLogin,\n  onBack: (role: 'admin' | 'teacher' | 'parent', parentStudentId?: string, loggedInUserId?: string) => void \n}) {",
  "export default function Login({ \n  classes, \n  students,\n  users,\n  onLogin,\n  onBack \n}: { \n  classes: SchoolClass[],\n  students: Student[],\n  users: UserAccount[],\n  onLogin: (role: 'admin' | 'teacher' | 'parent', parentStudentId?: string, loggedInUserId?: string) => void,\n  onBack?: () => void\n}) {"
);

fs.writeFileSync(file, code);
