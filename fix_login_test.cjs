const fs = require('fs');
const file = 'src/components/Login.tsx';
let code = fs.readFileSync(file, 'utf8');
console.log(code.includes("{(selectedRole === 'admin' || selectedRole === 'teacher') && ("));
const idx = code.indexOf("</button>");
console.log(code.substring(idx, idx + 200));
