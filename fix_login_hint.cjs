const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

c = c.replace(/Ví dụ: <strong>20252026_0001<\/strong>/g, 'Ví dụ: <strong>20252026_0001</strong><br/>Mật khẩu: <strong>12345678</strong>');

fs.writeFileSync('src/components/Login.tsx', c);
