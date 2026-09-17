const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/role: 'admin'\|'teacher'\|'staff'/g, "role: 'admin'|'teacher'|'subject_teacher'|'staff'");

fs.writeFileSync('src/components/AdminView.tsx', c);

let loginStr = fs.readFileSync('src/components/Login.tsx', 'utf8');
loginStr = loginStr.replace(/const \[role, setRole\] = useState<'admin' \| 'teacher' \| 'staff' \| 'parent'\>\('parent'\);/, "const [role, setRole] = useState<'admin' | 'teacher' | 'subject_teacher' | 'staff' | 'parent'>('parent');");
fs.writeFileSync('src/components/Login.tsx', loginStr);

let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(/const \[role, setRole\] = useState\<'admin' \| 'teacher' \| 'staff' \| 'parent'\>\('parent'\);/, "const [role, setRole] = useState<'admin' | 'teacher' | 'subject_teacher' | 'staff' | 'parent'>('parent');");
fs.writeFileSync('src/App.tsx', appStr);
