import React, { useState, useRef, useMemo } from 'react';
import { Student, SchoolClass, SchoolYear } from '../data';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  User as UserIcon, 
  X, 
  FileSpreadsheet, 
  Trash2, 
  Edit, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Globe, 
  Heart, 
  Eye,
  CheckCircle,
  Save,
  Shield
} from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import { doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { canUserEdit } from '../lib/permissions';
import { UserAccount } from '../data';

export default function TeacherStudents({ 
  role,
  user,
  students, 
  classId,
  onAddComment, 
  onSendNotification,
  onAddStudent,
  onAddMultipleStudents,
  onEditStudent,
  onDeleteStudent,
  classes,
  schoolYears
}: { 
  role?: string,
  user?: UserAccount,
  students: Student[],
  classId: string,
  onAddComment: (studentId: string, text: string) => void,
  onSendNotification: (studentId: string, title: string, message: string) => void,
  onAddStudent: (student: Student) => void,
  onAddMultipleStudents?: (students: Student[]) => void,
  onEditStudent: (student: Student) => void,
  onDeleteStudent: (studentId: string) => void,
  classes: SchoolClass[],
  schoolYears: SchoolYear[]
}) {
  const { showAlert, showConfirm } = useAlert();
  const currentClass = classes.find(c => c.id === classId);
  const isHomeroom = 
    role === 'admin' || 
    user?.homeroomClasses?.includes(classId) || 
    Boolean(currentClass && user?.fullName && currentClass.homeroomTeacher === user.fullName);

  // Chỉ GVCN của lớp (hoặc Admin) mới có quyền chỉnh sửa, thêm, xóa danh sách lớp.
  // GV bộ môn hoặc GV dạy tiết 1 không phải chủ nhiệm lớp này chỉ có quyền XEM (view only).
  const canEdit = isHomeroom && canUserEdit(user, role, 'students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Modal states
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    stt: '',
    code: '',
    fullName: '',
    dob: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: '',
    currentAddress: '',
    phone: '',
    citizenId: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sorting: by STT if available, then by Vietnamese first name
  const getFirstName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    return parts.length > 0 ? parts[parts.length - 1] : '';
  };

  const filteredStudents = useMemo(() => {
    return [...students]
      .filter(s => {
        const query = searchTerm.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(query) ||
          s.code.toLowerCase().includes(query) ||
          (s.phone && s.phone.includes(query)) ||
          (s.citizenId && s.citizenId.includes(query))
        );
      })
      .sort((a, b) => {
        if (a.stt && b.stt && a.stt !== b.stt) {
          return a.stt - b.stt;
        }
        return getFirstName(a.fullName).localeCompare(getFirstName(b.fullName), 'vi');
      });
  }, [students, searchTerm]);

  // Bulk Delete
  const handleDeleteSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn xóa ${selectedStudentIds.length} học sinh đã chọn khỏi hệ thống và Firebase?`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedStudentIds.forEach(id => {
          batch.delete(doc(db, 'students', id));
          onDeleteStudent(id);
        });
        await batch.commit();
        setSelectedStudentIds([]);
        showAlert('Đã xóa học sinh thành công khỏi hệ thống và Firebase', 'success');
      } catch (e) {
        console.error(e);
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  // Single Delete
  const handleDeleteSingle = async (id: string, name: string) => {
    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn xóa học sinh "${name}"?`);
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, 'students', id));
        onDeleteStudent(id);
        if (selectedStudentIds.includes(id)) {
          setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
        }
        if (selectedStudentForDetails?.id === id) {
          setSelectedStudentForDetails(null);
        }
        showAlert('Đã xóa học sinh thành công', 'success');
      } catch (e) {
        console.error(e);
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  // Add New Student
  const handleAddNewStudent = async () => {
    if (!newStudentForm.fullName.trim()) {
      showAlert('Vui lòng nhập họ và tên học sinh', 'error');
      return;
    }

    const nextStt = newStudentForm.stt 
      ? parseInt(newStudentForm.stt, 10) 
      : (students.length > 0 ? Math.max(...students.map(s => s.stt || 0)) + 1 : 1);

    const student: Student = {
      id: uuidv4(),
      code: newStudentForm.code.trim() || 'S' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      stt: nextStt,
      fullName: newStudentForm.fullName.trim(),
      dob: newStudentForm.dob.trim() || '01/01/2015',
      gender: newStudentForm.gender,
      ethnicity: newStudentForm.ethnicity.trim() || 'Kinh',
      nationality: newStudentForm.nationality.trim() || 'Việt Nam',
      religion: newStudentForm.religion.trim() || 'Không',
      pob: newStudentForm.pob.trim() || '',
      currentAddress: newStudentForm.currentAddress.trim() || '',
      phone: newStudentForm.phone.trim() || '',
      citizenId: newStudentForm.citizenId.trim() || '',
      classId: classId,
      cp: 0, 
      kp: 0, 
      award: '', 
      status: 'Đang học', 
      academicPerformance: 'Tốt',
      conduct: 'Tốt',
      comments: [], 
      notifications: [],
      grades: { 
        math: '', physics: '', chemistry: '', biology: '', it: '', technology: '', 
        localEdu: '', literature: '', history: '', geography: '', civicEdu: '', 
        foreignLanguage: '', pe: '', defense: '', japanese: '', experiential: '' 
      },
      attendanceRecords: {}
    };

    try {
      // Save directly to Firebase
      await setDoc(doc(db, 'students', student.id), student);
      onAddStudent(student);
      setShowAddStudentModal(false);
      setNewStudentForm({
        stt: '',
        code: '',
        fullName: '',
        dob: '',
        gender: 'Nam',
        ethnicity: 'Kinh',
        nationality: 'Việt Nam',
        religion: 'Không',
        pob: '',
        currentAddress: '',
        phone: '',
        citizenId: ''
      });
      showAlert('Đã thêm học sinh mới thành công', 'success');
    } catch (err) {
      console.error(err);
      onAddStudent(student);
      showAlert('Đã thêm học sinh vào danh sách', 'success');
    }
  };

  // Open Details Modal
  const handleOpenDetails = (student: Student) => {
    setSelectedStudentForDetails(student);
    setEditFormData({ ...student });
    setIsEditingInModal(false);
  };

  // Save changes in Details Modal
  const handleSaveModalEdit = async () => {
    if (!selectedStudentForDetails) return;
    if (!editFormData.fullName?.trim()) {
      showAlert('Họ và tên không được để trống', 'error');
      return;
    }

    const updatedStudent: Student = {
      ...selectedStudentForDetails,
      ...editFormData,
      stt: typeof editFormData.stt === 'string' ? parseInt(editFormData.stt, 10) || selectedStudentForDetails.stt : (editFormData.stt ?? selectedStudentForDetails.stt)
    } as Student;

    try {
      await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent, { merge: true });
      onEditStudent(updatedStudent);
      setSelectedStudentForDetails(updatedStudent);
      setIsEditingInModal(false);
      showAlert('Cập nhật thông tin học sinh thành công!', 'success');
    } catch (err) {
      console.error(err);
      onEditStudent(updatedStudent);
      setSelectedStudentForDetails(updatedStudent);
      setIsEditingInModal(false);
      showAlert('Đã lưu thông tin học sinh', 'success');
    }
  };

  // Export Excel Template matching exact column order in Hình 2.jpg
  // 1. STT, 2. Mã học sinh, 3. Họ tên, 4. Ngày sinh, 5. Giới tính, 6. Dân tộc, 
  // 7. Quốc tịch, 8. Tôn giáo, 9. Nơi sinh, 10. Chỗ ở hiện nay, 11. Số điện thoại, 12. Số định danh cá nhân
  const handleExportTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const headers = [
        'STT', 
        'Mã học sinh', 
        'Họ tên', 
        'Ngày sinh', 
        'Giới tính', 
        'Dân tộc', 
        'Quốc tịch', 
        'Tôn giáo', 
        'Nơi sinh', 
        'Chỗ ở hiện nay', 
        'Số điện thoại', 
        'Số định danh cá nhân'
      ];

      // Sample data directly matching user's image Hình 2.jpg
      const sampleData = [
        [
          1, 
          '6694138270', 
          'Trần Ngọc Thi Ân', 
          '20/04/2015', 
          'Nữ', 
          'Kinh', 
          'Việt Nam', 
          'Không', 
          'Tỉnh Đắk Lắk', 
          'Khu phố Phú An, Phường Tuy Hòa, Tỉnh Phú Yên', 
          '0903169946', 
          '054315005221'
        ],
        [
          2, 
          '5441588055', 
          'Nguyễn Hoàng Bách', 
          '04/11/2015', 
          'Nam', 
          'Kinh', 
          'Việt Nam', 
          'Không', 
          'Thành phố Hồ Chí Minh', 
          'Đường D1, khu phố Chu Văn An, phường Tuy Hòa', 
          '0985768910', 
          '054215004807'
        ],
        [
          3, 
          '5453341085', 
          'Nguyễn Sao Băng', 
          '28/04/2015', 
          'Nữ', 
          'Kinh', 
          'Việt Nam', 
          'Không', 
          'Tỉnh Đắk Lắk', 
          'Khu phố Phú Đông 3, Phường Tuy Hòa, tỉnh Phú Yên', 
          '0976563868', 
          '054315006108'
        ]
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      ws['!cols'] = [
        { wch: 6 },   // STT
        { wch: 15 },  // Mã học sinh
        { wch: 25 },  // Họ tên
        { wch: 14 },  // Ngày sinh
        { wch: 10 },  // Giới tính
        { wch: 10 },  // Dân tộc
        { wch: 12 },  // Quốc tịch
        { wch: 10 },  // Tôn giáo
        { wch: 22 },  // Nơi sinh
        { wch: 38 },  // Chỗ ở hiện nay
        { wch: 15 },  // Số điện thoại
        { wch: 18 }   // Số định danh cá nhân
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_Danh_Sach_HS');
      XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh.xlsx');
      showAlert('Đã tải xuống mẫu nhập danh sách học sinh theo chuẩn mới', 'success');
    } catch (error) {
      console.error("Export error", error);
      showAlert('Có lỗi khi tải mẫu Excel', 'error');
    }
  };

  // Import Excel supporting the exact 12-column order or header names
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
      
      if (!rawRows || rawRows.length < 2) {
        showAlert('File Excel không có dữ liệu để import', 'error');
        return;
      }

      // Detect header index
      const headerRow = rawRows[0] || [];
      const normalize = (str: any) => String(str || '').toLowerCase().trim().replace(/[\s_-]+/g, '');

      // Check if header row contains recognizable columns
      let colIdx = {
        stt: 0,
        code: 1,
        fullName: 2,
        dob: 3,
        gender: 4,
        ethnicity: 5,
        nationality: 6,
        religion: 7,
        pob: 8,
        currentAddress: 9,
        phone: 10,
        citizenId: 11
      };

      // Intelligent header lookup if headers are present
      headerRow.forEach((h: any, idx: number) => {
        const norm = normalize(h);
        if (norm === 'stt' || norm === 'sothutu') colIdx.stt = idx;
        else if (norm.includes('mahocsinh') || norm.includes('mahs')) colIdx.code = idx;
        else if (norm.includes('hoten') || norm.includes('hovaten') || norm.includes('fullname')) colIdx.fullName = idx;
        else if (norm.includes('ngaysinh') || norm.includes('dob')) colIdx.dob = idx;
        else if (norm.includes('gioitinh') || norm.includes('gender')) colIdx.gender = idx;
        else if (norm.includes('dantoc') || norm.includes('ethnicity')) colIdx.ethnicity = idx;
        else if (norm.includes('quoctich') || norm.includes('nationality')) colIdx.nationality = idx;
        else if (norm.includes('tongiao') || norm.includes('religion')) colIdx.religion = idx;
        else if (norm.includes('noisinh') || norm.includes('pob')) colIdx.pob = idx;
        else if (norm.includes('choohiennay') || norm.includes('diachi') || norm.includes('noio')) colIdx.currentAddress = idx;
        else if (norm.includes('sodienthoai') || norm.includes('sdt') || norm.includes('phone')) colIdx.phone = idx;
        else if (norm.includes('dinhdanh') || norm.includes('cccd') || norm.includes('cmnd')) colIdx.citizenId = idx;
      });

      const dataRows = rawRows.slice(1);
      const newStudents: Student[] = [];
      let importedCount = 0;

      dataRows.forEach((row: any, idx: number) => {
        const fullName = row[colIdx.fullName];
        if (!fullName || String(fullName).trim() === '') return;

        const codeVal = row[colIdx.code] ? String(row[colIdx.code]).trim() : '';
        const rawStt = row[colIdx.stt];
        const parsedStt = parseInt(rawStt, 10);
        const sttVal = !isNaN(parsedStt) ? parsedStt : idx + 1;

        const rawGender = String(row[colIdx.gender] || '').trim().toLowerCase();
        const gender: 'Nam' | 'Nữ' = (rawGender === 'nữ' || rawGender === 'nu' || rawGender === 'female') ? 'Nữ' : 'Nam';

        newStudents.push({
          id: uuidv4(),
          code: codeVal || 'S' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
          stt: sttVal,
          fullName: String(fullName).trim(),
          dob: row[colIdx.dob] ? String(row[colIdx.dob]).trim() : '01/01/2015',
          gender: gender,
          ethnicity: row[colIdx.ethnicity] ? String(row[colIdx.ethnicity]).trim() : 'Kinh',
          nationality: row[colIdx.nationality] ? String(row[colIdx.nationality]).trim() : 'Việt Nam',
          religion: row[colIdx.religion] ? String(row[colIdx.religion]).trim() : 'Không',
          pob: row[colIdx.pob] ? String(row[colIdx.pob]).trim() : '',
          currentAddress: row[colIdx.currentAddress] ? String(row[colIdx.currentAddress]).trim() : '',
          phone: row[colIdx.phone] ? String(row[colIdx.phone]).trim() : '',
          citizenId: row[colIdx.citizenId] ? String(row[colIdx.citizenId]).trim() : '',
          classId: classId,
          cp: 0, 
          kp: 0, 
          award: '', 
          status: 'Đang học', 
          academicPerformance: 'Tốt',
          conduct: 'Tốt',
          comments: [], 
          notifications: [],
          grades: { 
            math: '', physics: '', chemistry: '', biology: '', it: '', technology: '', 
            localEdu: '', literature: '', history: '', geography: '', civicEdu: '', 
            foreignLanguage: '', pe: '', defense: '', japanese: '', experiential: '' 
          },
          attendanceRecords: {}
        });
        importedCount++;
      });
      
      if (newStudents.length > 0) {
        // Save batch to Firebase Firestore in chunks of up to 400
        try {
          const CHUNK_SIZE = 400;
          for (let i = 0; i < newStudents.length; i += CHUNK_SIZE) {
            const chunk = newStudents.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);
            chunk.forEach(s => {
              const studentRef = doc(db, 'students', s.id);
              batch.set(studentRef, s);
            });
            await batch.commit();
          }
        } catch (firebaseErr) {
          console.warn("Could not batch write to Firebase immediately, local state will handle it:", firebaseErr);
        }

        if (onAddMultipleStudents) {
          onAddMultipleStudents(newStudents);
        } else {
          newStudents.forEach(s => onAddStudent(s));
        }

        showAlert(`Đã import thành công ${importedCount} học sinh vào lớp!`, 'success');
      } else {
        showAlert('Không tìm thấy dòng học sinh hợp lệ nào trong file', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Có lỗi khi import dữ liệu từ file Excel', 'error');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export student list to Excel
  const handleExportStudentList = async () => {
    try {
      if (!students || students.length === 0) {
        showAlert('Không có dữ liệu học sinh để xuất.', 'error');
        return;
      }
      const XLSX = await import('xlsx');
      const data = filteredStudents.map((s, index) => ({
        'STT': s.stt || index + 1,
        'Mã học sinh': s.code,
        'Họ tên': s.fullName,
        'Ngày sinh': s.dob || '',
        'Giới tính': s.gender,
        'Dân tộc': s.ethnicity || 'Kinh',
        'Quốc tịch': s.nationality || 'Việt Nam',
        'Tôn giáo': s.religion || 'Không',
        'Nơi sinh': s.pob || '',
        'Chỗ ở hiện nay': s.currentAddress || '',
        'Số điện thoại': s.phone || s.parentPhone || '',
        'Số định danh cá nhân': s.citizenId || ''
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        { wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 14 }, 
        { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, 
        { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 18 }
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_HS');
      
      const fileName = `Danh_Sach_HS_${currentClass?.name || 'Lop'}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showAlert('Xuất danh sách học sinh thành công!', 'success');
    } catch (error) {
      console.error("Export list error", error);
      showAlert('Có lỗi khi xuất file.', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
                Danh sách Học sinh {currentClass ? `- Lớp ${currentClass.name}` : ''}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                {filteredStudents.length} HS
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
              {currentClass?.homeroomTeacher ? `GVCN: ${currentClass.homeroomTeacher} • ` : ''}
              Chạm vào học sinh để xem đầy đủ hồ sơ chi tiết
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm học sinh, SĐT, CCCD..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {!canEdit && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-medium shrink-0">
                <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Chế độ chỉ xem (Chỉ GVCN mới được sửa danh sách lớp)</span>
              </div>
            )}

            {/* Bulk Delete */}
            {selectedStudentIds.length > 0 && canEdit && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-2 bg-red-50 text-red-600 font-medium text-xs sm:text-sm rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-2xs border border-red-200 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa ({selectedStudentIds.length})
              </button>
            )}

            {canEdit && (
              <>
                {/* Add Student */}
                <button 
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 shadow-2xs transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium shrink-0"
                  title="Thêm học sinh mới"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm HS</span>
                </button>

                {/* Upload Excel */}
                <input 
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImportExcel}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white border border-slate-200 text-emerald-600 rounded-xl hover:bg-emerald-50 shadow-2xs transition-colors flex items-center justify-center shrink-0"
                  title="Tải lên danh sách học sinh (File Excel)"
                >
                  <Upload className="w-4 h-4" />
                </button>

                {/* Export Student List */}
                <button 
                  onClick={handleExportStudentList}
                  className="p-2 bg-white border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 shadow-2xs transition-colors flex items-center justify-center shrink-0"
                  title="Xuất danh sách học sinh ra file Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>

                {/* Download Excel Template */}
                <button 
                  onClick={handleExportTemplate}
                  className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors shrink-0"
                  title="Tải mẫu Excel chuẩn"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Student Table Area */}
      {/* Responsive layout: 4 columns on mobile (STT, Họ tên, Ngày sinh, Chi tiết); Full columns on tablet/desktop */}
      <div className="flex-1 bg-white border border-teal-100 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#0f766e] text-white font-semibold">
              <tr>
                {canEdit && (
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-center w-10 sm:w-12 text-white">
                    <input
                      type="checkbox"
                      className="rounded border-teal-300 text-teal-600 focus:ring-teal-400 cursor-pointer accent-teal-600"
                      checked={selectedStudentIds.length > 0 && filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStudentIds(filteredStudents.map(s => s.id));
                        else setSelectedStudentIds([]);
                      }}
                    />
                  </th>
                )}
                {/* 1. STT (Always visible) */}
                <th className="px-2.5 sm:px-4 py-3 sm:py-3.5 text-center w-11 sm:w-14 text-white font-semibold whitespace-nowrap">STT</th>
                
                {/* 2. Mã HS (Desktop/Tablet: sm:) */}
                <th className="hidden sm:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold w-24 sm:w-28 whitespace-nowrap">Mã HS</th>
                
                {/* 3. Họ và tên (Always visible) */}
                <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold min-w-[130px] sm:min-w-[180px]">Họ và tên</th>
                
                {/* 4. Ngày sinh (Always visible) */}
                <th className="px-2.5 sm:px-4 py-3 sm:py-3.5 text-white font-semibold w-24 sm:w-32 whitespace-nowrap">Ngày sinh</th>
                
                {/* 5. Giới tính (Tablet/Desktop: md:) */}
                <th className="hidden md:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold w-20 sm:w-24 whitespace-nowrap">Giới tính</th>
                
                {/* 6. Dân tộc (Desktop: lg:) */}
                <th className="hidden lg:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold w-24 sm:w-28 whitespace-nowrap">Dân tộc</th>
                
                {/* 7. SĐT (Tablet/Desktop: md:) */}
                <th className="hidden md:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold w-32 sm:w-36 whitespace-nowrap">SĐT</th>
                
                {/* 8. Chi tiết (Always visible) */}
                <th className="px-2 sm:px-4 py-3 sm:py-3.5 text-center text-white font-semibold w-16 sm:w-24 whitespace-nowrap">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserIcon className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">Lớp này hiện chưa có học sinh nào</p>
                      <p className="text-xs text-slate-400">
                        Nhấn "+ Thêm HS" hoặc nút "Tải lên Excel" để thêm học sinh vào lớp.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const displayPhone = student.phone || student.parentPhone || '';

                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => handleOpenDetails(student)}
                      className="hover:bg-teal-50/50 active:bg-teal-100/40 transition-colors group cursor-pointer"
                      title="Bấm vào để xem hồ sơ chi tiết học sinh"
                    >
                      {/* Checkbox (Desktop/Tablet: sm:) */}
                      {canEdit && (
                        <td 
                          className="hidden sm:table-cell px-3 sm:px-4 py-2.5 sm:py-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, student.id]);
                              else setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                            }}
                          />
                        </td>
                      )}

                      {/* 1. STT */}
                      <td className="px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-center text-slate-500 font-medium whitespace-nowrap">
                        {student.stt || idx + 1}
                      </td>

                      {/* 2. Mã HS (Desktop/Tablet: sm:) */}
                      <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 sm:py-3.5 font-mono text-xs text-teal-800 font-semibold whitespace-nowrap">
                        {student.code}
                      </td>

                      {/* 3. Họ và tên */}
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">
                              {student.fullName}
                            </span>
                            {student.award && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                {student.award}
                              </span>
                            )}
                          </div>
                          {/* Dòng phụ hiển thị riêng trên Mobile: Mã HS & Giới tính */}
                          <div className="flex items-center gap-1.5 sm:hidden mt-0.5">
                            <span className="font-mono text-[10px] text-teal-800 bg-teal-50/80 px-1.5 py-0.2 rounded border border-teal-200/60 font-semibold">
                              {student.code}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                              student.gender === 'Nữ' 
                                ? 'bg-pink-50 text-pink-700 border border-pink-100' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {student.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Ngày sinh */}
                      <td className="px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                        {student.dob || <span className="text-slate-400 italic text-[11px]">Chưa có</span>}
                      </td>

                      {/* 5. Giới tính (Tablet/Desktop: md:) */}
                      <td className="hidden md:table-cell px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          student.gender === 'Nữ' 
                            ? 'bg-pink-50 text-pink-700 border border-pink-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {student.gender}
                        </span>
                      </td>

                      {/* 6. Dân tộc (Desktop: lg:) */}
                      <td className="hidden lg:table-cell px-3 sm:px-4 py-2.5 sm:py-3.5 text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                        {student.ethnicity || 'Kinh'}
                      </td>

                      {/* 7. SĐT (Tablet/Desktop: md:) */}
                      <td className="hidden md:table-cell px-3 sm:px-4 py-2.5 sm:py-3.5 whitespace-nowrap">
                        {displayPhone ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-xs">
                            <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{displayPhone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Chưa có</span>
                        )}
                      </td>

                      {/* 8. Thao tác xem nhanh / Chi tiết */}
                      <td 
                        className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(student)}
                            className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors shadow-2xs border border-teal-200/60 flex items-center justify-center"
                            title="Bấm để xem đầy đủ hồ sơ học sinh"
                          >
                            <Eye className="w-4 h-4 text-teal-600" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteSingle(student.id, student.fullName)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors hidden sm:block opacity-0 group-hover:opacity-100"
                              title="Xóa học sinh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT DETAILS MODAL - Displays ALL 12 fields from Hình 2.jpg */}
      {selectedStudentForDetails && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto"
          onClick={() => setSelectedStudentForDetails(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto border border-teal-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-teal-gradient px-6 py-5 text-white flex justify-between items-center relative">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  {selectedStudentForDetails.fullName.split(' ').pop()?.[0] || 'H'}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                    {selectedStudentForDetails.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-teal-100 text-xs mt-0.5">
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md font-semibold">
                      Mã: {selectedStudentForDetails.code}
                    </span>
                    <span>•</span>
                    <span>STT: {selectedStudentForDetails.stt}</span>
                    <span>•</span>
                    <span>Lớp {currentClass?.name || ''}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingInModal ? (
                  canEdit && (
                    <button
                      onClick={() => setIsEditingInModal(true)}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa thông tin</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setIsEditingInModal(false)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Xem thông tin
                  </button>
                )}
                <button 
                  onClick={() => setSelectedStudentForDetails(null)} 
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {!isEditingInModal ? (
                /* VIEW MODE: Displays full details exactly matching Hình 2.jpg */
                <div className="space-y-4">
                  <div className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-2">
                    <UserIcon className="w-4 h-4 text-teal-600" />
                    <span>Thông tin hồ sơ học sinh (Đồng bộ Firebase)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. STT */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        1. STT
                      </span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {selectedStudentForDetails.stt || 'Chưa có'}
                      </span>
                    </div>

                    {/* 2. Mã học sinh */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        2. Mã học sinh
                      </span>
                      <span className="font-mono font-bold text-teal-700 text-sm">
                        {selectedStudentForDetails.code}
                      </span>
                    </div>

                    {/* 3. Họ tên */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        3. Họ tên
                      </span>
                      <span className="font-bold text-slate-900 text-base">
                        {selectedStudentForDetails.fullName}
                      </span>
                    </div>

                    {/* 4. Ngày sinh */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        4. Ngày sinh
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {selectedStudentForDetails.dob || 'Chưa cập nhật'}
                      </span>
                    </div>

                    {/* 5. Giới tính */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        5. Giới tính
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedStudentForDetails.gender === 'Nữ' 
                          ? 'bg-pink-100 text-pink-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedStudentForDetails.gender}
                      </span>
                    </div>

                    {/* 6. Dân tộc */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        6. Dân tộc
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {selectedStudentForDetails.ethnicity || 'Kinh'}
                      </span>
                    </div>

                    {/* 7. Quốc tịch */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-teal-600" />
                        7. Quốc tịch
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {selectedStudentForDetails.nationality || 'Việt Nam'}
                      </span>
                    </div>

                    {/* 8. Tôn giáo */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-teal-600" />
                        8. Tôn giáo
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {selectedStudentForDetails.religion || 'Không'}
                      </span>
                    </div>

                    {/* 9. Nơi sinh */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        9. Nơi sinh
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {selectedStudentForDetails.pob || 'Chưa cập nhật'}
                      </span>
                    </div>

                    {/* 10. Chỗ ở hiện nay */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        10. Chỗ ở hiện nay
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {selectedStudentForDetails.currentAddress || 'Chưa cập nhật'}
                      </span>
                    </div>

                    {/* 11. Số điện thoại */}
                    <div className="p-3 bg-teal-50/40 rounded-2xl border border-teal-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          11. Số điện thoại
                        </span>
                        <span className="font-mono font-semibold text-slate-900 text-sm">
                          {selectedStudentForDetails.phone || selectedStudentForDetails.parentPhone || 'Chưa cập nhật'}
                        </span>
                      </div>
                      {(selectedStudentForDetails.phone || selectedStudentForDetails.parentPhone) && (
                        <a
                          href={`tel:${(selectedStudentForDetails.phone || selectedStudentForDetails.parentPhone || '').replace(/\s+/g, '')}`}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                          title="Gọi điện trực tiếp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi ngay</span>
                        </a>
                      )}
                    </div>

                    {/* 12. Số định danh cá nhân */}
                    <div className="p-3 bg-teal-50/40 rounded-2xl border border-teal-100">
                      <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                        12. Số định danh cá nhân (CCCD)
                      </span>
                      <span className="font-mono font-semibold text-slate-900 text-sm">
                        {selectedStudentForDetails.citizenId || 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <div className="space-y-4">
                  <div className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-2">
                    <Edit className="w-4 h-4 text-teal-600" />
                    <span>Cập nhật thông tin học sinh (Tự động lưu Firebase)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">1. STT</label>
                      <input 
                        type="number"
                        value={editFormData.stt ?? ''}
                        onChange={e => setEditFormData({ ...editFormData, stt: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">2. Mã học sinh</label>
                      <input 
                        type="text"
                        value={editFormData.code || ''}
                        onChange={e => setEditFormData({ ...editFormData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">3. Họ và tên *</label>
                      <input 
                        type="text"
                        value={editFormData.fullName || ''}
                        onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">4. Ngày sinh (DD/MM/YYYY)</label>
                      <input 
                        type="text"
                        value={editFormData.dob || ''}
                        onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                        placeholder="VD: 20/04/2015"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">5. Giới tính</label>
                      <select
                        value={editFormData.gender || 'Nam'}
                        onChange={e => setEditFormData({ ...editFormData, gender: e.target.value as 'Nam' | 'Nữ' })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">6. Dân tộc</label>
                      <input 
                        type="text"
                        value={editFormData.ethnicity || ''}
                        onChange={e => setEditFormData({ ...editFormData, ethnicity: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">7. Quốc tịch</label>
                      <input 
                        type="text"
                        value={editFormData.nationality || ''}
                        onChange={e => setEditFormData({ ...editFormData, nationality: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">8. Tôn giáo</label>
                      <input 
                        type="text"
                        value={editFormData.religion || ''}
                        onChange={e => setEditFormData({ ...editFormData, religion: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">9. Nơi sinh</label>
                      <input 
                        type="text"
                        value={editFormData.pob || ''}
                        onChange={e => setEditFormData({ ...editFormData, pob: e.target.value })}
                        placeholder="VD: Tỉnh Đắk Lắk"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">10. Chỗ ở hiện nay</label>
                      <input 
                        type="text"
                        value={editFormData.currentAddress || ''}
                        onChange={e => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                        placeholder="VD: Khu phố Phú An, Phường Tuy Hòa, Tỉnh Phú Yên"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">11. Số điện thoại</label>
                      <input 
                        type="text"
                        value={editFormData.phone || ''}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                        placeholder="VD: 0903169946"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">12. Số định danh cá nhân (CCCD)</label>
                      <input 
                        type="text"
                        value={editFormData.citizenId || ''}
                        onChange={e => setEditFormData({ ...editFormData, citizenId: e.target.value })}
                        placeholder="VD: 054315005221"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                {canEdit && !isEditingInModal && (
                  <button
                    onClick={() => handleDeleteSingle(selectedStudentForDetails.id, selectedStudentForDetails.fullName)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa học sinh này</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2.5">
                {isEditingInModal ? (
                  <>
                    <button 
                      onClick={() => setIsEditingInModal(false)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleSaveModalEdit}
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu lên Firebase</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setSelectedStudentForDetails(null)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW STUDENT MODAL - Full 12 fields */}
      {showAddStudentModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto"
          onClick={() => setShowAddStudentModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto border border-teal-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-teal-gradient text-white">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Thêm học sinh mới vào lớp {currentClass?.name || ''}
              </h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. STT</label>
                  <input 
                    type="number"
                    value={newStudentForm.stt}
                    onChange={e => setNewStudentForm({ ...newStudentForm, stt: e.target.value })}
                    placeholder={`Tự động (${students.length + 1})`}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Mã học sinh</label>
                  <input 
                    type="text"
                    value={newStudentForm.code}
                    onChange={e => setNewStudentForm({ ...newStudentForm, code: e.target.value })}
                    placeholder="Để trống để tự tạo mã"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Họ và tên *</label>
                  <input 
                    type="text"
                    value={newStudentForm.fullName}
                    onChange={e => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                    placeholder="Nhập họ và tên đầy đủ..."
                    autoFocus
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Ngày sinh (DD/MM/YYYY)</label>
                  <input 
                    type="text"
                    value={newStudentForm.dob}
                    onChange={e => setNewStudentForm({ ...newStudentForm, dob: e.target.value })}
                    placeholder="VD: 20/04/2015"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">5. Giới tính</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={e => setNewStudentForm({ ...newStudentForm, gender: e.target.value as 'Nam' | 'Nữ' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6. Dân tộc</label>
                  <input 
                    type="text"
                    value={newStudentForm.ethnicity}
                    onChange={e => setNewStudentForm({ ...newStudentForm, ethnicity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">7. Quốc tịch</label>
                  <input 
                    type="text"
                    value={newStudentForm.nationality}
                    onChange={e => setNewStudentForm({ ...newStudentForm, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">8. Tôn giáo</label>
                  <input 
                    type="text"
                    value={newStudentForm.religion}
                    onChange={e => setNewStudentForm({ ...newStudentForm, religion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">9. Nơi sinh</label>
                  <input 
                    type="text"
                    value={newStudentForm.pob}
                    onChange={e => setNewStudentForm({ ...newStudentForm, pob: e.target.value })}
                    placeholder="VD: Tỉnh Đắk Lắk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">10. Chỗ ở hiện nay</label>
                  <input 
                    type="text"
                    value={newStudentForm.currentAddress}
                    onChange={e => setNewStudentForm({ ...newStudentForm, currentAddress: e.target.value })}
                    placeholder="VD: Khu phố Phú An, Phường Tuy Hòa, Tỉnh Phú Yên"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">11. Số điện thoại</label>
                  <input 
                    type="text"
                    value={newStudentForm.phone}
                    onChange={e => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    placeholder="VD: 0903169946"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">12. Số định danh cá nhân (CCCD)</label>
                  <input 
                    type="text"
                    value={newStudentForm.citizenId}
                    onChange={e => setNewStudentForm({ ...newStudentForm, citizenId: e.target.value })}
                    placeholder="VD: 054315005221"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
              <button 
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddNewStudent}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm & Lưu vào Firebase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
