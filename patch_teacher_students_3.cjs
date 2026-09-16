const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

// Update Export Template to include Mã HS
const exportSearch = `      const headers = ['Họ và Tên', 'Giới tính', 'Dân tộc', 'Ngày sinh', 'Nơi sinh', 'Niên khoá'];
      const data = [
        ['Nguyễn Văn A', 'Nam', 'Kinh', '01/01/2008', 'TP.HCM', yearStr],
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];`;

const exportReplace = `      const headers = ['Mã HS', 'Họ và Tên', 'Giới tính', 'Dân tộc', 'Ngày sinh', 'Nơi sinh', 'Niên khoá'];
      const data = [
        ['26270001', 'Nguyễn Văn A', 'Nam', 'Kinh', '01/01/2008', 'TP.HCM', yearStr],
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];`;

c = c.replace(exportSearch, exportReplace);


// Update Import logic to read Mã HS from col 0, and shift others +1
const importSearch = `      rows.forEach((row: any) => {
        if (!row[0]) return;
        newStudents.push({
          id: uuidv4(),
          code: 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          fullName: row[0] || 'Chưa cập nhật',
          gender: row[1] || 'Nam',
          ethnicity: row[2] || 'Kinh',
          dateOfBirth: row[3] || '01/01/2000',
          placeOfBirth: row[4] || 'Chưa cập nhật',`;

const importReplace = `      rows.forEach((row: any) => {
        if (!row[1]) return; // Họ và Tên is now row[1]
        newStudents.push({
          id: uuidv4(),
          code: row[0] ? String(row[0]).trim() : 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          fullName: row[1] || 'Chưa cập nhật',
          gender: row[2] || 'Nam',
          ethnicity: row[3] || 'Kinh',
          dateOfBirth: row[4] || '01/01/2000',
          placeOfBirth: row[5] || 'Chưa cập nhật',`;

c = c.replace(importSearch, importReplace);

// Also add a Mã HS field to the Add Student Modal
const addModalSearch = `            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>`;

const addModalReplace = `            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Học Sinh</label>
                <input 
                  type="text" 
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                  placeholder="Để trống để tự động tạo mã"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>`;

c = c.replace(addModalSearch, addModalReplace);

// State for newStudentCode
const addStateSearch = `  const [newStudentName, setNewStudentName] = useState('');`;
const addStateReplace = `  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');`;

c = c.replace(addStateSearch, addStateReplace);

// Handle Add with Code
const handleAddSearch = `      code: 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      fullName: newStudentName,`;

const handleAddReplace = `      code: newStudentCode.trim() || 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      fullName: newStudentName,`;
      
c = c.replace(handleAddSearch, handleAddReplace);

// Handle Add clear code
const clearCodeSearch = `    setNewStudentName('');`;
const clearCodeReplace = `    setNewStudentCode('');
    setNewStudentName('');`;
    
c = c.replace(clearCodeSearch, clearCodeReplace);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
