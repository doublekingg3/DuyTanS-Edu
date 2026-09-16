const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(/showAlert\('Duyệt thực đơn thành công!', 'success'\);/,
"showAlert('Duyệt thực đơn thành công! Áp dụng cho toàn bộ các lớp.', 'success');");

c = c.replace(/Lên thực đơn dinh dưỡng hàng ngày cho học sinh bán trú/,
"Lên thực đơn dinh dưỡng hàng ngày cho toàn bộ học sinh bán trú của trường (áp dụng chung tất cả các lớp)");

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
