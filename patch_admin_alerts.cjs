const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "showAlert('Đã xảy ra lỗi khi xóa tài khoản.', 'error');",
  "showAlert(`Lỗi xóa TK: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');"
);

c = c.replace(
  "showAlert('Đã xảy ra lỗi khi xóa tài khoản.', 'error');",
  "showAlert(`Lỗi xóa TK: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
