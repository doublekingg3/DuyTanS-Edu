const fs = require('fs');
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(/const \[role, setRole\] = useState\<'admin' \| 'teacher' \| 'parent' \| 'staff'\>\('admin'\);/, "const [role, setRole] = useState<'admin' | 'teacher' | 'subject_teacher' | 'parent' | 'staff'>('admin');");
appStr = appStr.replace(/const handleLogin = \(selectedRole: 'admin' \| 'teacher' \| 'parent', studentId\?: string, userId\?: string\) => \{/, "const handleLogin = (selectedRole: 'admin' | 'teacher' | 'subject_teacher' | 'staff' | 'parent', studentId?: string, userId?: string) => {");
fs.writeFileSync('src/App.tsx', appStr);

let loginStr = fs.readFileSync('src/components/Login.tsx', 'utf8');
loginStr = loginStr.replace(/const \[role, setRole\] = useState\<'admin' \| 'teacher' \| 'parent' \| 'staff'\>\('admin'\);/, "const [role, setRole] = useState<'admin' | 'teacher' | 'subject_teacher' | 'staff' | 'parent'>('admin');");
fs.writeFileSync('src/components/Login.tsx', loginStr);

