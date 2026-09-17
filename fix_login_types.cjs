const fs = require('fs');
let loginStr = fs.readFileSync('src/components/Login.tsx', 'utf8');
loginStr = loginStr.replace(/onLogin: \(role: 'admin' \| 'teacher' \| 'parent' \| 'staff', parentStudentId\?: string, loggedInUserId\?: string\) => void,/, "onLogin: (role: 'admin' | 'teacher' | 'subject_teacher' | 'parent' | 'staff', parentStudentId?: string, loggedInUserId?: string) => void,");
fs.writeFileSync('src/components/Login.tsx', loginStr);
