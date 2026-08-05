import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Add import XLSX if not present
if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace("import { addDoc, collection,", "import * as XLSX from 'xlsx';\nimport { addDoc, collection,");
}

// 2. Add fileInputRefUsers and functions
const userImportLogic = `
  const fileInputRefUsers = useRef<HTMLInputElement>(null);

  const handleDownloadUserTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['username', 'password', 'fullName', 'role (admin/teacher)'],
      ['gv_nguyenvana', '123456', 'Nguyễn Văn A', 'teacher'],
      ['gv_lethib', '123456', 'Lê Thị B', 'teacher'],
      ['admin_truong', '123456', 'Nguyễn Hiệu Trưởng', 'admin'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "mau_nhap_tai_khoan.xlsx");
  };

  const handleImportUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

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
            isHomeroom: false,
            isSubject: false,
            homeroomClasses: [],
            subjectClasses: [],
            subjects: []
          };
          
          await addDoc(collection(db, 'users'), userData);
          successCount++;
        }
        
        alert(\`Đã nhập thành công \${successCount} tài khoản mới!\`);
        if (fileInputRefUsers.current) fileInputRefUsers.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi đọc file Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };
`;

code = code.replace(
  "const openAddUserModal = () => {",
  userImportLogic.trim() + "\n\n  const openAddUserModal = () => {"
);

// 3. Update the buttons in the UI
const buttonsUI = `
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRefUsers} 
                  onChange={handleImportUsers} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
                <button onClick={handleDownloadUserTemplate} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Tải mẫu
                </button>
                <button onClick={() => fileInputRefUsers.current?.click()} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> Nhập (Import)
                </button>
                <button 
                  onClick={openAddUserModal}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Thêm
                </button>
              </div>
`;

const regexButtons = /<div className="flex items-center gap-3">\n\s*<button onClick=\{\(\) => alert\("Tính năng đang phát triển"\)\} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">\n[\s\S]*?<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"><\/line><line x1="5" y1="12" x2="19" y2="12"><\/line><\/svg> Thêm\n\s*<\/button>\n\s*<\/div>/;

code = code.replace(regexButtons, buttonsUI.trim());

fs.writeFileSync('src/components/AdminView.tsx', code);
