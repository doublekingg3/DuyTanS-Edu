const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const stateSearch = `  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);`;

const stateReplace = `  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState('Nam');
  const [newStudentDob, setNewStudentDob] = useState('');
  const [newStudentEthnicity, setNewStudentEthnicity] = useState('Kinh');
  const fileInputRef = useRef<HTMLInputElement>(null);`;

c = c.replace(stateSearch, stateReplace);

const exportSearch = `  // Import/Export Logic (Keeping core logic from original)
  const handleExportTemplate = async () => {`;

const exportReplace = `  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
      
      const rows = jsonData.slice(1);
      const newStudents: Student[] = [];
      let importedCount = 0;

      rows.forEach((row: any) => {
        if (!row[0]) return;
        newStudents.push({
          id: uuidv4(),
          code: 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          fullName: row[0] || 'Chưa cập nhật',
          gender: row[1] || 'Nam',
          ethnicity: row[2] || 'Kinh',
          dateOfBirth: row[3] || '01/01/2000',
          placeOfBirth: row[4] || 'Chưa cập nhật',
          classId: classId,
          grades: [],
          conduct: [],
          attendanceRecords: {}
        });
        importedCount++;
      });
      
      if (onAddMultipleStudents && newStudents.length > 0) {
        onAddMultipleStudents(newStudents);
        showAlert(\`Đã import thành công \${importedCount} học sinh\`, 'success');
      } else {
        showAlert('Tính năng thêm nhiều học sinh chưa được hỗ trợ', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Có lỗi khi import dữ liệu', 'error');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddNewStudent = () => {
    if (!newStudentName.trim()) {
      showAlert('Vui lòng nhập họ và tên học sinh', 'error');
      return;
    }
    const student: Student = {
      id: uuidv4(),
      code: 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      fullName: newStudentName,
      gender: newStudentGender,
      ethnicity: newStudentEthnicity,
      dateOfBirth: newStudentDob || '01/01/2000',
      placeOfBirth: '',
      classId: classId,
      grades: [],
      conduct: [],
      attendanceRecords: {}
    };
    onAddStudent(student);
    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentGender('Nam');
    setNewStudentDob('');
    showAlert('Đã thêm học sinh mới', 'success');
  };

  // Import/Export Logic (Keeping core logic from original)
  const handleExportTemplate = async () => {`;

c = c.replace(exportSearch, exportReplace);

const buttonsSearch = `          <button 
            onClick={handleExportTemplate}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            title="Tải file mẫu Excel"
          >
            <Download className="w-5 h-5" />
          </button>`;

const buttonsReplace = `          <button 
            onClick={() => setShowAddStudentModal(true)}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors flex items-center justify-center"
            title="Thêm học sinh mới"
          >
            <Plus className="w-5 h-5" />
          </button>
          <input 
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white border border-slate-200 text-emerald-600 rounded-lg hover:bg-emerald-50 shadow-sm transition-colors flex items-center justify-center"
            title="Tải lên Excel"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={handleExportTemplate}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            title="Tải file mẫu Excel"
          >
            <Download className="w-5 h-5" />
          </button>`;

c = c.replace(buttonsSearch, buttonsReplace);

const modalAdd = `      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold font-display text-slate-800">Thêm học sinh mới</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nhập họ và tên..."
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                  <select 
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dân tộc</label>
                  <input 
                    type="text" 
                    value={newStudentEthnicity}
                    onChange={(e) => setNewStudentEthnicity(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh (Không bắt buộc)</label>
                <input 
                  type="text" 
                  value={newStudentDob}
                  onChange={(e) => setNewStudentDob(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: 01/01/2010"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddNewStudent}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Thêm học sinh
              </button>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace(/\{\/\* Student Details Modal \*\/\}/, modalAdd + '\n      {/* Student Details Modal */}');

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
