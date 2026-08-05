import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const oldUserTemplate = `
  const handleDownloadUserTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['username', 'password', 'fullName', 'role (admin/teacher)'],
      ['gv_nguyenvana', '123456', 'Nguyễn Văn A', 'teacher'],
      ['gv_lethib', '123456', 'Lê Thị B', 'teacher'],
      ['admin_truong', '123456', 'Nguyễn Hiệu Trưởng', 'admin'],
    ]);
`;

const newUserTemplate = `
  const handleDownloadUserTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Mã Giáo viên (username)', 'Mật khẩu (password)', 'Họ và tên (fullName)', 'Vai trò (admin/teacher)'],
      ['GV001', '123456', 'Nguyễn Văn A', 'teacher'],
      ['GV002', '123456', 'Lê Thị B', 'teacher'],
      ['ADMIN', '123456', 'Nguyễn Hiệu Trưởng', 'admin'],
    ]);
`;

code = code.replace(oldUserTemplate.trim(), newUserTemplate.trim());

const oldImportLogic = `
        let successCount = 0;
        for (const row of data) {
          if (!row.username || !row.fullName) continue;

          // Check if exists
          const exists = users.find(u => u.username === row.username.toString());
          if (exists) continue;

          const newId = 'USER-' + Math.random().toString(36).substr(2, 9);
          const userData = {
            id: newId,
            username: row.username.toString(),
            password: row.password ? row.password.toString() : '123456',
            fullName: row.fullName.toString(),
            role: row['role (admin/teacher)'] === 'admin' ? 'admin' : 'teacher',
`;

const newImportLogic = `
        let successCount = 0;
        for (const row of data) {
          const username = row.username || row['Mã Giáo viên (username)'];
          const password = row.password || row['Mật khẩu (password)'];
          const fullName = row.fullName || row['Họ và tên (fullName)'];
          const roleRaw = row['role (admin/teacher)'] || row['Vai trò (admin/teacher)'] || row.role;
          
          if (!username || !fullName) continue;

          // Check if exists
          const exists = users.find(u => u.username === username.toString());
          if (exists) continue;

          const newId = 'USER-' + Math.random().toString(36).substr(2, 9);
          const userData = {
            id: newId,
            username: username.toString(),
            password: password ? password.toString() : '123456',
            fullName: fullName.toString(),
            role: roleRaw === 'admin' ? 'admin' : 'teacher',
`;

code = code.replace(oldImportLogic.trim(), newImportLogic.trim());

// Update the label in the UI
const oldLabel = '<label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản đăng nhập <span className="text-red-500">*</span></label>';
const newLabel = '<label className="block text-sm font-medium text-slate-700 mb-1">Mã Giáo viên (Tài khoản đăng nhập) <span className="text-red-500">*</span></label>';

code = code.replace(oldLabel, newLabel);

fs.writeFileSync('src/components/AdminView.tsx', code);
