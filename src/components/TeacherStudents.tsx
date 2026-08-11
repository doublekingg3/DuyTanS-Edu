import React, { useState } from 'react';
import { Student, getSubjectName, Grades, SchoolClass, SchoolYear } from '../data';
import { Search, MessageSquare, Send, UserCheck, UserX, Clock, Plus, Edit2, Trash2, X, Download, Upload, LogOut, Calendar, ChevronDown, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { useAlert } from "../contexts/AlertContext";
import { db } from '../lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';

export default function TeacherStudents({ 
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
  const [courseYear, setCourseYear] = useState('20242027');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newComment, setNewComment] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editForm, setEditForm] = useState<Partial<Student>>({});

  // Temporary attendance state for demo
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'leave_early'>>({});
  
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceModal, setAttendanceModal] = useState<{isOpen: boolean, studentId: string, status: 'late' | 'absent' | 'leave_early', reason: string}>({ isOpen: false, studentId: '', status: 'late', reason: '' });
  const [editParentModal, setEditParentModal] = useState<{isOpen: boolean, studentId: string, name: string, phone: string, email: string}>({ isOpen: false, studentId: '', name: '', phone: '', email: '' });

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportTemplate = async () => {
    try {
      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      const yearStr = currentYear?.id || '20242027';

      const XLSX = await import('xlsx');
      const headers = ['Họ và Tên', 'Giới tính', 'Dân tộc', 'Ngày sinh', 'Nơi sinh', 'Niên khoá'];
      const data = [
        ['Nguyễn Văn A', 'Nam', 'Kinh', '01/01/2008', 'TP.HCM', yearStr],
        ['Trần Thị B', 'Nữ', 'Kinh', '15/02/2008', 'Hà Nội', yearStr]
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hoc_Sinh');
      XLSX.writeFile(wb, 'Mau_Nhap_Danh_Sach_Hoc_Sinh.xlsx');
    } catch (error) {
      console.error('Lỗi khi tạo file mẫu:', error);
      showAlert('Có lỗi khi tạo file Excel.', 'error');
    }
  };

      const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!classId) {
      showAlert('Vui lòng chọn lớp trước khi import học sinh.', 'error');
      if (e.target) e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      if (!rows || rows.length <= 1) {
        showAlert('File không có dữ liệu.', 'error');
        return;
      }
      
      const headersRow = rows[0] as string[];
      const nameIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Họ và Tên'));
      const genderIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Giới tính'));
      const ethnicityIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Dân tộc'));
      const dobIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Ngày sinh'));
      const pobIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Nơi sinh'));
      const cohortIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Niên khoá'));
      
      if (nameIdx === -1) {
        showAlert('File không đúng mẫu. Thiếu cột "Họ và Tên".', 'error');
        return;
      }
      
      const validRows = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const fullName = row[nameIdx]?.toString();
        if (!fullName) continue;
        validRows.push(row);
      }

      if (validRows.length === 0) {
        showAlert('Không tìm thấy dữ liệu hợp lệ trong file.', 'info');
        return;
      }

      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      
      let cohort = validRows[0][cohortIdx]?.toString();
      if (!cohort) {
        cohort = currentYear?.id || '20242027';
      }

      let nextStartId = 1;
      try {
        const counterRef = doc(db, 'counters', `studentCode_${cohort}`);
        nextStartId = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          let lastId = 0;
          if (counterDoc.exists()) {
            lastId = counterDoc.data().lastId || 0;
          }
          const nextId = lastId + 1;
          transaction.set(counterRef, { lastId: lastId + validRows.length }, { merge: true });
          return nextId;
        });
      } catch (err) {
        console.error("Error generating student code:", err);
        showAlert('Có lỗi khi tạo mã học sinh tự động. Vui lòng thử lại.', 'error');
        return;
      }

      const newStudents: Student[] = [];
      validRows.forEach((row, idx) => {
        const fullName = row[nameIdx]?.toString();
        const id = uuidv4();
        const stt = nextStartId + idx;
        const code = `${cohort}${stt.toString().padStart(3, '0')}`;
        
        newStudents.push({
          id,
          code,
          classId: classId,
          stt: students.length + idx + 1,
          fullName: fullName as string,
          gender: row[genderIdx]?.toString() === 'Nữ' ? 'Nữ' : 'Nam',
          ethnicity: row[ethnicityIdx]?.toString() || 'Kinh',
          dob: row[dobIdx]?.toString() || '01/01/2008',
          pob: row[pobIdx]?.toString() || '',
          grades: {} as Grades,
          academicPerformance: '',
          conduct: '',
          cp: 0,
          kp: 0,
          award: '',
          status: 'Đang học',
          notifications: [],
          comments: []
        });
      });
      
      if (newStudents.length > 0) {
        if (onAddMultipleStudents) {
          onAddMultipleStudents(newStudents);
          showAlert(`Đã import thành công ${newStudents.length} học sinh.`, 'success');
        } else {
          for (const s of newStudents) {
            onAddStudent(s);
          }
          showAlert(`Đã import thành công ${newStudents.length} học sinh.`, 'success');
        }
      }
    } catch (error) {
      console.error('Lỗi khi import Excel:', error);
      showAlert('Có lỗi khi đọc file Excel.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };


  const handleAddComment = () => {
    if (!selectedStudent || !newComment.trim()) return;
    onAddComment(selectedStudent.id, newComment);
    setNewComment('');
    onSendNotification(
      selectedStudent.id, 
      'Nhận xét mới từ giáo viên', 
      newComment
    );
  };

  const markAttendance = (id: string, status: 'present' | 'absent' | 'late' | 'leave_early') => {
    if (status === 'late' || status === 'absent' || status === 'leave_early') {
      setAttendanceModal({ isOpen: true, studentId: id, status, reason: '' });
      return;
    }
    
    // For present, update immediately
    const today = attendanceDate;
    const student = students.find(s => s.id === id);
    if (student) {
      const currentRecords = student.attendanceRecords || {};
      const newStudent = {
        ...student,
        attendanceRecords: {
          ...currentRecords,
          [today]: { status: 'present' as const, time: new Date().toISOString() }
        }
      };
      onEditStudent(newStudent);
      setAttendance(prev => ({ ...prev, [id]: status }));
      showAlert('Đã điểm danh Có mặt.', 'success');
    }
  };
  
  const confirmAttendance = () => {
    const today = attendanceDate;
    const student = students.find(s => s.id === attendanceModal.studentId);
    if (student) {
      const currentRecords = student.attendanceRecords || {};
      const newStudent = {
        ...student,
        attendanceRecords: {
          ...currentRecords,
          [today]: { status: attendanceModal.status as 'present' | 'late' | 'absent' | 'leave_early', reason: attendanceModal.reason, time: new Date().toISOString() }
        }
      };
      onEditStudent(newStudent);
      setAttendance(prev => ({ ...prev, [attendanceModal.studentId]: attendanceModal.status }));
      showAlert(`Đã điểm danh ${attendanceModal.status === 'late' ? 'Đi trễ' : attendanceModal.status === 'leave_early' ? 'Xin về' : 'Vắng mặt'} và lưu lý do.`);
    }
    setAttendanceModal({ ...attendanceModal, isOpen: false });
  };
  
  const confirmParentUpdate = () => {
    const student = students.find(s => s.id === editParentModal.studentId);
    if (student) {
      const newStudent = {
        ...student,
        parentName: editParentModal.name,
        parentPhone: editParentModal.phone,
        // Since we don't have parentEmail in interface, we can add it or ignore it, let's just use parentPhone and parentName
      };
      onEditStudent(newStudent);
      showAlert('Đã cập nhật thông tin phụ huynh.', 'success');
    }
    setEditParentModal({ ...editParentModal, isOpen: false });
  };

  const openAddModal = () => {
    if (!classId) {
      showAlert('Vui lòng chọn lớp trước khi thêm học sinh.', 'error');
      return;
    }
    setModalMode('add');
    setEditForm({
      fullName: '',
      gender: 'Nam',
      ethnicity: 'Kinh',
      status: 'Đang học',
      academicPerformance: 'T',
      conduct: 'T',
      cp: 0,
      kp: 0,
      award: '',
      grades: {
        math: 0, physics: 0, chemistry: 0, biology: 0, it: 0, localEdu: 'Đ', literature: 0, history: 0, foreignLanguage: 0, pe: 'Đ', defense: 0, japanese: 0, experiential: 'Đ', technology: 0, geography: 0, civicEdu: 0
      },
      comments: [],
      notifications: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setModalMode('edit');
    setEditForm({ ...student });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa học sinh này không?');
    if (isConfirmed) {
      onDeleteStudent(id);
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    }
  };

      const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      const defaultCohort = currentYear?.id || '20242027';
      
      let cohort = window.prompt("Nhập niên khoá cho học sinh này (ví dụ: 20242027):", defaultCohort);
      if (!cohort || cohort.trim() === '') {
        showAlert('Cần có niên khoá để tạo mã học sinh.', 'error');
        return;
      }
      
      let nextId = 1;
      try {
        const counterRef = doc(db, 'counters', `studentCode_${cohort}`);
        nextId = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          let lastId = 0;
          if (counterDoc.exists()) {
            lastId = counterDoc.data().lastId || 0;
          }
          const next = lastId + 1;
          transaction.set(counterRef, { lastId: next }, { merge: true });
          return next;
        });
      } catch (err) {
        console.error("Error generating student code:", err);
        showAlert('Có lỗi khi tạo mã học sinh. Thử lại sau.', 'error');
        return;
      }

      const newStudent: Student = {
        ...(editForm as Student),
        id: uuidv4(),
        code: `${cohort}${nextId.toString().padStart(3, '0')}`,
        classId: classId,
        stt: students.length + 1
      };
      onAddStudent(newStudent);
      setSelectedStudent(newStudent);
    } else {
      onEditStudent(editForm as Student);
      setSelectedStudent(editForm as Student);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 relative">
      {/* Sidebar: Student List */}
      <div className="w-[320px] max-w-sm border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold font-display text-slate-800">Danh sách Học sinh</h2>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <button 
                onClick={handleExportTemplate}
                className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Tải file mẫu Excel"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Nhập từ Excel"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button 
                onClick={openAddModal}
                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                title="Thêm học sinh"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredStudents.map(student => (
            <button 
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between ${selectedStudent?.id === student.id ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <div>
                <div className="font-medium text-slate-800 text-sm">{student.fullName}</div>
                <div className="mt-1 flex gap-1">
                  {(() => {
                    const status = student.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] ? attendance[student.id] : undefined);
                    if (status === 'present') return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Có mặt</span>;
                    if (status === 'absent') return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">Vắng</span>;
                    if (status === 'late') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">Trễ</span>;
                    if (status === 'leave_early') return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">Xin về</span>;
                    return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">Chưa ĐD</span>;
                  })()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Student Detail & Actions */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {selectedStudent ? (
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Student Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold font-display text-slate-900">{selectedStudent.fullName}</h1>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(selectedStudent)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors" title="Chỉnh sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(selectedStudent.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors" title="Xóa học sinh">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-2">
                  <span className="flex items-center gap-1.5"><span className="text-slate-400">Mã HS:</span> <span className="font-mono font-medium text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{selectedStudent.code || selectedStudent.id}</span></span>
                  <span className="flex items-center gap-1.5"><span className="text-slate-400">Giới tính:</span> <span className="font-medium text-slate-900">{selectedStudent.gender}</span></span>
                  <span className="flex items-center gap-1.5"><span className="text-slate-400">Ngày sinh:</span> <span className="font-medium text-slate-900">{selectedStudent.dob || '01/01/2008'}</span></span>
                  <span className="flex items-center gap-1.5"><span className="text-slate-400">Nơi sinh:</span> <span className="font-medium text-slate-900">{selectedStudent.pob || ''}</span></span>
                  <span className="flex items-center gap-1.5"><span className="text-slate-400">Dân tộc:</span> <span className="font-medium text-slate-900">{selectedStudent.ethnicity}</span></span>
                  <span className="flex items-center gap-1.5"><span className="text-slate-400">Trạng thái:</span> <span className="font-bold text-green-600">{selectedStudent.status}</span></span>
                </div>
              </div>
              
              {/* Attendance Actions */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Điểm danh
                  </span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                    title="Chọn ngày để điểm danh bù"
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => markAttendance(selectedStudent.id, 'present')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'present' ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-500 hover:text-green-600'}`} title="Có mặt"><UserCheck className="w-4 h-4"/> Có mặt</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'late')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'late' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-yellow-500 hover:text-yellow-600'}`} title="Đi trễ"><Clock className="w-4 h-4"/> Đi trễ</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'leave_early')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'leave_early' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600'}`} title="Xin về"><LogOut className="w-4 h-4"/> Xin về</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'absent')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-600'}`} title="Vắng mặt"><UserX className="w-4 h-4"/> Vắng</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Info & Parents */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-bold text-slate-700">Thông tin Phụ huynh & Liên hệ</h3>
                    <button onClick={() => setEditParentModal({ isOpen: true, studentId: selectedStudent.id, name: selectedStudent.parentName || 'Nguyễn Văn A (Mẫu)', phone: selectedStudent.parentPhone || '0909 123 456', email: 'phuhuynh@example.com' })} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Chỉnh sửa</button>
                  </div>
                </div>
                <div className="p-5 space-y-4 text-sm">
                   <div className="flex justify-between border-b border-slate-50 pb-3">
                     <span className="text-slate-500">Họ tên Phụ huynh:</span>
                     <span className="font-medium text-slate-800">{selectedStudent.parentName || 'Nguyễn Văn A (Mẫu)'}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-3">
                     <span className="text-slate-500">Số điện thoại:</span>
                     <span className="font-medium text-slate-800">{selectedStudent.parentPhone || '0909 123 456'}</span>
                   </div>
                   <div className="flex justify-between pb-3">
                     <span className="text-slate-500">Email liên hệ:</span>
                     <span className="font-medium text-slate-800">phuhuynh@example.com</span>
                   </div>
                   <button className="w-full py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                     Gửi tin nhắn trực tiếp
                   </button>
                </div>
              </div>

              {/* Feedback & Comments */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Nhận xét của giáo viên
                  </h3>
                </div>
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {selectedStudent.comments.length === 0 ? (
                    <div className="text-center text-sm text-slate-400 py-8 italic">Chưa có nhận xét nào.</div>
                  ) : (
                    selectedStudent.comments.map(c => (
                      <div key={c.id} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                        <div className="text-sm text-slate-700 font-medium">{c.text}</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-3">{new Date(c.date).toLocaleString('vi-VN')}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập nhận xét..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  />
                  <button 
                    onClick={handleAddComment}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-md shadow-indigo-200 transition-colors"
                    title="Gửi nhận xét"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                <PieChartIcon className="w-6 h-6 text-indigo-600" />
                Thống kê điểm danh
              </h2>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-slate-500">Ngày:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                />
              </div>
              <div className="h-64 w-full relative">
                {(() => {
                  const presentCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'present').length;
                  const lateCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'late').length;
                  const leaveEarlyCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'leave_early').length;
                  const absentCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'absent').length;
                  const notTrackedCount = students.length - presentCount - lateCount - leaveEarlyCount - absentCount;

                  const pieData = [
                    { name: 'Có mặt', value: presentCount, color: '#22c55e' },
                    { name: 'Đi trễ', value: lateCount, color: '#eab308' },
                    { name: 'Xin về', value: leaveEarlyCount, color: '#f97316' },
                    { name: 'Vắng mặt', value: absentCount, color: '#ef4444' },
                    { name: 'Chưa ĐD', value: notTrackedCount, color: '#cbd5e1' }
                  ].filter(d => d.value > 0);

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => [`${value} học sinh`, 'Số lượng']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex flex-col items-center opacity-60">
              <Search className="w-10 h-10 mb-3 text-slate-400" />
              <p className="text-base font-medium">Chọn học sinh bên trái để xem và cập nhật thông tin</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-full">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {modalMode === 'add' ? 'Thêm học sinh mới' : 'Chỉnh sửa thông tin'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="student-form" onSubmit={handleSaveModal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.fullName || ''}
                    onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editForm.gender || 'Nam'}
                      onChange={e => setEditForm({...editForm, gender: e.target.value as 'Nam'|'Nữ'})}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dân tộc</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editForm.ethnicity || ''}
                      onChange={e => setEditForm({...editForm, ethnicity: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chuyển lớp</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.classId || classId}
                    onChange={e => setEditForm({...editForm, classId: e.target.value})}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.status || ''}
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                form="student-form"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Ghi chú lý do {attendanceModal.status === 'late' ? 'Đi trễ' : attendanceModal.status === 'leave_early' ? 'Xin về' : 'Vắng mặt'}
              </h3>
              <button onClick={() => setAttendanceModal({...attendanceModal, isOpen: false})} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Lý do (hiển thị cho phụ huynh xem):</label>
              <textarea 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-24"
                value={attendanceModal.reason}
                onChange={e => setAttendanceModal({...attendanceModal, reason: e.target.value})}
                placeholder="Nhập lý do..."
              />
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setAttendanceModal({...attendanceModal, isOpen: false})} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Hủy
                </button>
                <button onClick={confirmAttendance} className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Parent Info Modal */}
      {editParentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Sửa thông tin Phụ huynh
              </h3>
              <button onClick={() => setEditParentModal({...editParentModal, isOpen: false})} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Họ tên Phụ huynh:</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={editParentModal.name}
                  onChange={e => setEditParentModal({...editParentModal, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại:</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={editParentModal.phone}
                  onChange={e => setEditParentModal({...editParentModal, phone: e.target.value})}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditParentModal({...editParentModal, isOpen: false})} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Hủy
                </button>
                <button onClick={confirmParentUpdate} className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
