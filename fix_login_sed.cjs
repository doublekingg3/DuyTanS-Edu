const fs = require('fs');
const file = 'src/components/Login.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/onLogin,\s+onBack\(/g, "onLogin(");

fs.writeFileSync(file, code);
