const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa tài khoản này?');",
  "const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa tài khoản này?');\n    console.log('isConfirmed:', isConfirmed);"
);

c = c.replace(
  "const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn xóa ${safeSelectedIds.length} tài khoản đã chọn?`);",
  "const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn xóa ${safeSelectedIds.length} tài khoản đã chọn?`);\n    console.log('isConfirmed bulk:', isConfirmed);"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
