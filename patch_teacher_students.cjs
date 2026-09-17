const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const newExportFunc = `
  const handleExportAccounts = async () => {
    try {
      if (!students || students.length === 0) {
        showAlert('Không có dữ liệu học sinh để xuất.', 'error');
        return;
      }
      const XLSX = await import('xlsx');
      const data = students.map((s, index) => ({
        'STT': index + 1,
        'Mã HS': s.code,
        'Họ và tên': s.name,
        'Mật khẩu mặc định': '12345678'
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tai_Khoan_HS');
      
      const currentClass = classes.find(c => c.id === classId);
      const fileName = \`Tai_Khoan_HS_\${currentClass?.name || 'Lop'}.xlsx\`;
      
      XLSX.writeFile(wb, fileName);
      showAlert('Xuất file tài khoản thành công!', 'success');
    } catch (error) {
      console.error("Export accounts error", error);
      showAlert('Có lỗi khi xuất file.', 'error');
    }
  };
`;

// Insert the new function before the return statement
c = c.replace(/return \(\s*<div className="flex flex-col h-full bg-slate-50 relative p-4 md:p-6">/, newExportFunc + '\n  return (\n    <div className="flex flex-col h-full bg-slate-50 relative p-4 md:p-6">');

const newBtn = `          <button 
            onClick={handleExportAccounts}
            className="p-2 bg-white border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 shadow-sm transition-colors flex items-center justify-center"
            title="Xuất tài khoản HS (Excel)"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>
          <button `;

c = c.replace(/<button \n\s*onClick=\{handleExportTemplate\}/, newBtn + '\n            onClick={handleExportTemplate}');

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
