import React, { useState, useRef } from 'react';
import { Student, SchoolClass, SchoolYear } from '../data';
import { Search, Plus, Upload, Download, Save, User as UserIcon, X, Check, FileSpreadsheet, Trash2, CheckCircle } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import { doc, runTransaction, writeBatch, deleteDoc } from 'firebase/firestore';

export default function TeacherStudents({ 
  role,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isQuickAttendanceModalOpen, setIsQuickAttendanceModalOpen] = useState(false);
  const [quickAttendanceRecords, setQuickAttendanceRecords] = useState<Record<string, {status: 'present' | 'absent' | 'late' | 'leave_early', reason: string}>>({});
  
  // Local state for attendance reasons to edit directly in table
  const [attendanceReasons, setAttendanceReasons] = useState<Record<string, string>>({});
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState('Nam');
  const [newStudentDob, setNewStudentDob] = useState('');
  const [newStudentEthnicity, setNewStudentEthnicity] = useState('Kinh');

  const getFirstName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    return parts.length > 0 ? parts[parts.length - 1] : '';
  };
  const filteredStudents = [...students].filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => getFirstName(a.fullName).localeCompare(getFirstName(b.fullName), 'vi'));

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave_early') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const reason = (status === 'absent' || status === 'late') ? (attendanceReasons[studentId] || '') : '';
    
    const currentRecords = student.attendanceRecords || {};
    const newStudent = {
        ...student,
        attendanceRecords: {
            ...currentRecords,
            [attendanceDate]: { status, time: new Date().toISOString(), reason }
        }
    };
    onEditStudent(newStudent);
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendanceReasons(prev => ({...prev, [studentId]: reason}));
  };

  const saveReason = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const status = student.attendanceRecords?.[attendanceDate]?.status || 'present';
    const currentRecords = student.attendanceRecords || {};
    
    const newStudent = {
        ...student,
        attendanceRecords: {
            ...currentRecords,
            [attendanceDate]: { status, time: new Date().toISOString(), reason: attendanceReasons[studentId] }
        }
    };
    onEditStudent(newStudent);
    showAlert('Đã lưu lý do.', 'success');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (!row[1]) return; // Họ và Tên is now row[1]
        newStudents.push({
          id: uuidv4(),
          code: row[0] ? String(row[0]).trim() : 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          fullName: row[1] || 'Chưa cập nhật',
          gender: (row[2] || 'Nam') as 'Nam' | 'Nữ',
          ethnicity: row[3] || 'Kinh',
          dob: row[4] || '01/01/2000',
          pob: row[5] || 'Chưa cập nhật',
          classId: classId,
          stt: 0, cp: 0, kp: 0, award: '', status: '', academicPerformance: '',
          comments: [], notifications: [],
          grades: { math: '', physics: '', chemistry: '', biology: '', it: '', technology: '', localEdu: '', literature: '', history: '', geography: '', civicEdu: '', foreignLanguage: '', pe: '', defense: '', japanese: '', experiential: '' },
          conduct: '',
          attendanceRecords: {}
        });
        importedCount++;
      });
      
      if (onAddMultipleStudents && newStudents.length > 0) {
        onAddMultipleStudents(newStudents);
        showAlert(`Đã import thành công ${importedCount} học sinh`, 'success');
      } else {
        showAlert('Tính năng thêm nhiều học sinh chưa được hỗ trợ', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Có lỗi khi import dữ liệu', 'error');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const handleDeleteSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedStudentIds.length} học sinh đã chọn?`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedStudentIds.forEach(id => {
          batch.delete(doc(db, 'students', id));
        });
        await batch.commit();
        setSelectedStudentIds([]);
        showAlert('Xóa học sinh thành công', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  const handleDeleteSingle = async (id: string) => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa vĩnh viễn học sinh này?');
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, 'students', id));
        if (selectedStudentIds.includes(id)) {
          setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
        }
        showAlert('Xóa học sinh thành công', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  const handleAddNewStudent = () => {
    if (!newStudentName.trim()) {
      showAlert('Vui lòng nhập họ và tên học sinh', 'error');
      return;
    }
    const student: Student = {
      id: uuidv4(),
      code: newStudentCode.trim() || 'S' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      fullName: newStudentName,
      gender: newStudentGender as 'Nam' | 'Nữ',
      ethnicity: newStudentEthnicity,
      dob: newStudentDob || '01/01/2000',
      pob: '',
      classId: classId,
      stt: 0, cp: 0, kp: 0, award: '', status: '', academicPerformance: '',
      comments: [], notifications: [],
      grades: { math: '', physics: '', chemistry: '', biology: '', it: '', technology: '', localEdu: '', literature: '', history: '', geography: '', civicEdu: '', foreignLanguage: '', pe: '', defense: '', japanese: '', experiential: '' },
      conduct: '',
      attendanceRecords: {}
    };
    onAddStudent(student);
    setShowAddStudentModal(false);
    setNewStudentCode('');
    setNewStudentName('');
    setNewStudentGender('Nam');
    setNewStudentDob('');
    showAlert('Đã thêm học sinh mới', 'success');
  };

  // Import/Export Logic (Keeping core logic from original)
  const handleExportTemplate = async () => {
    try {
      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      const yearStr = currentYear?.id || '20242027';
      const XLSX = await import('xlsx');
      const headers = ['Mã HS', 'Họ và Tên', 'Giới tính', 'Dân tộc', 'Ngày sinh', 'Nơi sinh', 'Niên khoá'];
      const data = [
        ['26270001', 'Nguyễn Văn A', 'Nam', 'Kinh', '01/01/2008', 'TP.HCM', yearStr],
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Hoc_Sinh');
      XLSX.writeFile(wb, 'Mau_Nhap_Hoc_Sinh.xlsx');
    } catch (error) {
      console.error("Export error", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Danh sách Học sinh & Điểm danh</h2>
          <p className="text-slate-500 mt-1">Quản lý thông tin và điểm danh hàng ngày</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedStudentIds.length > 0 && role !== 'subject_teacher' && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Xóa {selectedStudentIds.length} HS
            </button>
          )}
          
                    <button
            onClick={() => {
              const records = {};
              students.forEach(s => {
                records[s.id] = { status: 'present', reason: '' };
              });
              setQuickAttendanceRecords(records);
              setIsQuickAttendanceModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm border border-emerald-200"
          >
            <CheckCircle className="w-4 h-4" /> Điểm danh nhanh
          </button>
          <input 
            type="date" 
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {role !== 'subject_teacher' && (<><button 
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
            title="Tải mẫu Excel (Dùng để nhập HS mới)"
          >
            <Download className="w-5 h-5" />
          </button></>)}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                {role !== 'subject_teacher' && (
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedStudentIds.length > 0 && filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedStudentIds(filteredStudents.map(s => s.id));
                      else setSelectedStudentIds([]);
                    }}
                  />
                </th>
)}
                <th className="px-4 py-3 text-center w-12">STT</th>
                <th className="px-4 py-3">Mã HS</th>
                <th className="px-4 py-3">Họ và Tên</th>
                <th className="px-4 py-3">Trạng thái điểm danh ({new Date(attendanceDate).toLocaleDateString('vi-VN')})</th>
                <th className="px-4 py-3 w-64">Lý do (Nếu vắng/trễ)</th>
                {role !== 'subject_teacher' && <th className="px-4 py-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Không tìm thấy học sinh nào.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const currentStatus = student.attendanceRecords?.[attendanceDate]?.status || 'present'; // Default to present visually if none set, or maybe undefined? Let's say undefined = Chua DD.
                  const statusVal = student.attendanceRecords?.[attendanceDate]?.status;
                  const dbReason = student.attendanceRecords?.[attendanceDate]?.reason || '';
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      {role !== 'subject_teacher' && (
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, student.id]);
                            else setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                          }}
                        />
                      </td>
)}
                      <td className="px-4 py-4 text-center text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">{student.code}</td>
                      <td className="px-4 py-4 font-medium text-slate-800">{student.fullName}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`status-${student.id}`} 
                              checked={statusVal === 'present'}
                              onChange={() => handleAttendanceChange(student.id, 'present')}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
                            />
                            <span className="text-slate-700">Có mặt</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`status-${student.id}`} 
                              checked={statusVal === 'absent'}
                              onChange={() => handleAttendanceChange(student.id, 'absent')}
                              className="w-4 h-4 text-red-600 focus:ring-red-600"
                            />
                            <span className="text-slate-700">Vắng mặt</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`status-${student.id}`} 
                              checked={statusVal === 'late'}
                              onChange={() => handleAttendanceChange(student.id, 'late')}
                              className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-slate-700">Đi trễ</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            disabled={statusVal !== 'absent' && statusVal !== 'late'}
                            value={attendanceReasons[student.id] !== undefined ? attendanceReasons[student.id] : dbReason}
                            onChange={(e) => handleReasonChange(student.id, e.target.value)}
                            onBlur={() => saveReason(student.id)}
                            placeholder={statusVal === 'absent' || statusVal === 'late' ? "Nhập lý do..." : ""}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-transparent transition-all"
                          />
                        </div>
                      </td>
                      {role !== 'subject_teacher' && (
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedStudentForDetails(student)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            Hồ sơ
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(student.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
)}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

            {/* Add Student Modal */}
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

      {/* Student Details Modal */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold font-display text-slate-800 text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                Hồ sơ học sinh
              </h3>
              <button onClick={() => setSelectedStudentForDetails(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-2xl font-display">
                  {selectedStudentForDetails.fullName.split(' ').pop()?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-slate-800">{selectedStudentForDetails.fullName}</h4>
                  <p className="text-slate-500 font-mono text-sm">Mã: {selectedStudentForDetails.code}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Giới tính</div>
                    <div className="font-medium text-slate-800">{selectedStudentForDetails.gender || 'Chưa cập nhật'}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày sinh</div>
                    <div className="font-medium text-slate-800">{selectedStudentForDetails.dob || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Thông tin liên hệ phụ huynh</div>
<p className="text-sm text-slate-500 italic mt-2">Tính năng đang phát triển.</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                onClick={() => setSelectedStudentForDetails(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Attendance Modal */}
      {isQuickAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Điểm danh nhanh - {new Date(attendanceDate).toLocaleDateString('vi-VN')}</h3>
              <button onClick={() => setIsQuickAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">STT</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">Họ và Tên</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200 text-center">Có mặt</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200 w-1/3">Ghi chú (nếu vắng/trễ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const record = quickAttendanceRecords[student.id];
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-slate-500">{idx + 1}</td>
                        <td className="px-6 py-3 font-medium text-slate-800">{student.fullName}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={record?.status === 'present'}
                                onChange={(e) => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], status: e.target.checked ? 'present' : 'absent'}}))}
                                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 transition-colors"
                              />
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            type="text" 
                            placeholder="Nhập lý do..."
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={record?.reason || ''}
                            onChange={(e) => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], reason: e.target.value}}))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsQuickAttendanceModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  try {
                    const batch = writeBatch(db);
                    filteredStudents.forEach(student => {
                      const record = quickAttendanceRecords[student.id];
                      if (record) {
                        const studentRef = doc(db, 'students', student.id);
                        const currentRecords = student.attendanceRecords || {};
                        const updatedRecords = {
                          ...currentRecords,
                          [attendanceDate]: { 
                            status: record.status, 
                            time: new Date().toISOString(), 
                            reason: record.reason 
                          }
                        };
                        batch.set(studentRef, { attendanceRecords: updatedRecords }, { merge: true });
                      }
                    });
                    await batch.commit();
                    showAlert('Điểm danh thành công!', 'success');
                    setIsQuickAttendanceModalOpen(false);
                  } catch (e) {
                    console.error(e);
                    showAlert('Lỗi khi lưu điểm danh', 'error');
                  }
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >OK</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
