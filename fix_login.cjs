const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

const oldParentDemo = `<strong>Tài Khoản Demo</strong><br/>
                  Phụ huynh đăng nhập theo mẫu: <strong>năm học-stt</strong><br/>
                  Ví dụ: <strong>20252026_0001</strong><br/>Mật khẩu: <strong>12345678</strong>`;

const newParentDemo = `Mã học sinh là <strong>Mã định danh</strong><br/>
                  Mật khẩu mặc định: <strong>12345678</strong>`;

c = c.replace(oldParentDemo, newParentDemo);
c = c.replace(oldParentDemo, newParentDemo); // replace twice if it appears in both desktop and mobile views

fs.writeFileSync('src/components/Login.tsx', c);
