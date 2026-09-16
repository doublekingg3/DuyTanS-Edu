const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/role === "admin" \|\| role === "teacher"/g, 'role === "admin" || role === "teacher" || role === "staff"');
c = c.replace(/setRole\(selectedRole\);/g, 'setRole(selectedRole as any);');
c = c.replace(/useState\<'admin' \| 'teacher' \| 'parent'\>\('admin'\)/g, "useState<'admin' | 'teacher' | 'parent' | 'staff'>('admin')");

fs.writeFileSync('src/App.tsx', c);
