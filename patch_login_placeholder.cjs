const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

c = c.replace(/placeholder=\{selectedRole\}/g, "placeholder='Tài khoản'");

fs.writeFileSync('src/components/Login.tsx', c);
