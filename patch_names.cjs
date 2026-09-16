const fs = require('fs');

function replaceFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/EduManager Pro/g, 'DuyTan School Manager');
  c = c.replace(/Hệ thống quản lý học sinh, điểm số, và thông tin học vụ toàn diện\./g, 'Hệ thống quản lý học sinh online.');
  c = c.replace(/Truy cập EduManager/g, 'Truy cập Ứng dụng');
  c = c.replace(/Ứng dụng quản lý lớp học thông minh và ứng dụng sắp xếp thời khoá biểu AI\./g, 'Ứng dụng quản lý học sinh online.');
  c = c.replace(/Tên Hiển thị \(Login\/EduManager\)/g, 'Tên Hiển thị (Login/DuyTan School Manager)');
  
  fs.writeFileSync(file, c);
}

replaceFile('src/components/Portal.tsx');
replaceFile('src/components/AdminView.tsx');
replaceFile('src/App.tsx');
replaceFile('index.html');
