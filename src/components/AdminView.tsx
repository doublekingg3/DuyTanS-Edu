import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { SchoolClass, Student, UserAccount, SchoolYear, AppSettings, defaultSettings } from '../data';
import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate } from 'lucide-react';
import { useAlert } from "../contexts/AlertContext";
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, writeBatch, addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default function AdminView({ classes, students, users, schoolYears, settings }: { classes: SchoolClass[], students: Student[], users: UserAccount[], schoolYears: SchoolYear[], settings?: AppSettings }) {
  const { showAlert, showConfirm } = useAlert();

  const [appSettings, setAppSettings] = useState<AppSettings>(settings || defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  React.useEffect(() => {
    if (settings) {
      setAppSettings(settings);
    }
  }, [settings]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        showAlert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh < 800KB để đảm bảo lưu trữ.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppSettings(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, appSettings);
      showAlert('Đã lưu cấu hình giao diện thành công!', 'success');
    } catch (error) {
      showAlert('Lỗi khi lưu cấu hình', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'classes' | 'accounts' | 'school_years' | 'backup' | 'firebase' | 'ai_config'>('classes');
  const [aiConfigText, setAiConfigText] = useState(localStorage.getItem('aiAdminConfig') || 'Fanpage: https://facebook.com/truong\nHotline: 0123.456.789\nCác khoá học hiện có: Tiếng Anh giao tiếp, Toán tư duy, Kỹ năng sống');

  
  const [firebaseConfigStr, setFirebaseConfigStr] = useState(localStorage.getItem('customFirebaseConfig') || '');
  
  
  
  // School Years state
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<SchoolYear | null>(null);
  const [yearFormData, setYearFormData] = useState({ name: '' });
  
  // Promote Class state
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteClassData, setPromoteClassData] = useState<{sourceClass: SchoolClass, targetClassId: string, studentsToPromote: Set<string>} | null>(null);

  // Classes state
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilterYear, setClassFilterYear] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Hành động này sẽ khôi phục dữ liệu từ tệp sao lưu. Dữ liệu hiện tại có thể bị ghi đè. Bạn có chắc chắn muốn tiếp tục?')) {
      if (e.target) e.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      showAlert('Đang khôi phục dữ liệu...', 'info');

      const restoreCollection = async (collectionName: string, items: any[]) => {
        if (!items || !Array.isArray(items)) return;
        const colRef = collection(db, collectionName);
        const promises = items.map(item => {
          if (!item.id) return Promise.resolve();
          const docRef = doc(colRef, item.id);
          return setDoc(docRef, item);
        });
        await Promise.all(promises);
      };

      await restoreCollection('schoolYears', data.schoolYears);
      await restoreCollection('classes', data.classes);
      await restoreCollection('students', data.students);
      await restoreCollection('users', data.users);

      showAlert('Khôi phục dữ liệu thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi khôi phục dữ liệu:', err);
      showAlert('Có lỗi xảy ra khi đọc tệp sao lưu.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Users state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userAssignmentYear, setUserAssignmentYear] = useState('');
  const [userFormData, setUserFormData] = useState<{username: string, password: string, fullName: string, role: 'admin'|'teacher', isHomeroom: boolean, isSubject: boolean, subjects: string[], homeroomClasses: string[], subjectClasses: string[]}>({
    username: '',
    password: '',
    fullName: '',
    role: 'teacher' as 'admin' | 'teacher',
    isHomeroom: false,
    isSubject: false,
    subjects: [],
    homeroomClasses: [],
    subjectClasses: []
  });

  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [formData, setFormData] = useState({
    schoolYearId: '',
    name: '',
    homeroomTeacher: '',
    specialization: ''
  });

  const filteredClasses = classes.filter(c => 
    ((c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
    (c.homeroomTeacher || '').toLowerCase().includes((searchTerm || '').toLowerCase())) &&
    (classFilterYear ? c.schoolYearId === classFilterYear : true)
  );

  const handleExportTemplate = async () => {
    try {
      const XLSX = (await import('xlsx'));
      
      const headers = ['ID_Lop', 'Tên Lớp', 'Giáo viên Chủ nhiệm', 'Phân ban'];
      
      const data = classes.map(c => [
        c.id,
        c.name,
        c.homeroomTeacher,
        c.specialization || ''
      ]);
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!cols'] = [{ hidden: true }, { wch: 25 }, { wch: 30 }, { wch: 20 }];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'LopHoc');
      
      XLSX.writeFile(wb, 'Template_LopHoc.xlsx');
    } catch (error) {
      console.error('Error generating Excel file:', error);
      showAlert('Có lỗi xảy ra khi tạo file Excel.', 'error');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const XLSX = (await import('xlsx'));
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const batch = writeBatch(db);
      let count = 0;
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const idCell = row[0]?.toString();
        const nameCell = row[1]?.toString();
        const teacherCell = row[2]?.toString();
        const specializationCell = row[3]?.toString();
        
        if (!nameCell || !teacherCell) continue;
        
        const classId = idCell && idCell.trim() !== '' ? idCell : uuidv4();
        const docRef = doc(db, 'classes', classId);
        
        batch.set(docRef, {
          id: classId,
          name: nameCell,
          homeroomTeacher: teacherCell,
          specialization: specializationCell || ''
        }, { merge: true });
        
        count++;
      }
      
      if (count > 0) {
        await batch.commit();
        showAlert(`Đã nhập dữ liệu ${count} lớp học thành công.`, 'success');
      } else {
        showAlert('Không tìm thấy dữ liệu lớp học nào trong file.', 'info');
      }
    } catch (error) {
      console.error('Error importing Excel:', error);
      showAlert('Có lỗi xảy ra khi đọc file Excel. Vui lòng thử lại.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveClass = async () => {
    if (!formData.name.trim() || !formData.homeroomTeacher.trim() || !formData.schoolYearId) {
      showAlert('Vui lòng điền đầy đủ thông tin (Năm học, Tên lớp, GVCN)', 'error');
      return;
    }

    const classId = editingClass ? editingClass.id : `${formData.schoolYearId}-${formData.name.replace(/\s+/g, '')}`;
    
    const classData = {
      id: classId,
      name: formData.name,
      homeroomTeacher: formData.homeroomTeacher,
      schoolYearId: formData.schoolYearId,
      specialization: formData.specialization
    };

    try {
      const docRef = doc(db, 'classes', classId);
      await setDoc(docRef, classData);
      setIsAddModalOpen(false);
      setEditingClass(null);
      setFormData({ schoolYearId: schoolYears[0]?.id || '', name: '', homeroomTeacher: '', specialization: '' });
      showAlert('Lưu lớp học thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi lưu lớp:', error);
      showAlert('Đã xảy ra lỗi khi lưu lớp học.', 'error');
    }
  };

  const handleSaveYear = async () => {
    if (!yearFormData.name.trim()) {
      showAlert('Vui lòng nhập tên năm học', 'error');
      return;
    }
    
    const yearId = editingYear ? editingYear.id : yearFormData.name.replace(/[^a-zA-Z0-9]/g, '');
    
    try {
      const docRef = doc(db, 'schoolYears', yearId);
      await setDoc(docRef, { id: yearId, name: yearFormData.name });
      setIsAddYearModalOpen(false);
      setEditingYear(null);
      setYearFormData({ name: '' });
      showAlert('Lưu năm học thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi lưu năm học:', error);
      showAlert('Đã xảy ra lỗi.', 'error');
    }
  };

  const handleDeleteYear = async (yearId: string) => {
    const hasClasses = classes.some(c => c.id.startsWith(yearId + '-'));
    if (hasClasses) {
      showAlert('Không thể xóa năm học vì đang có lớp học thuộc năm này.', 'error');
      return;
    }
    if (await showConfirm('Bạn có chắc chắn muốn xóa năm học này?')) {
      await deleteDoc(doc(db, 'schoolYears', yearId));
      showAlert('Xóa năm học thành công.', 'success');
    }
  };
  
  const handlePromoteSubmit = async () => {
    if (!promoteClassData?.targetClassId) {
      showAlert('Vui lòng chọn lớp mới để chuyển học sinh đến.', 'error');
      return;
    }
    if (promoteClassData.studentsToPromote.size === 0) {
      showAlert('Vui lòng chọn ít nhất 1 học sinh.', 'error');
      return;
    }
    try {
      const batch = writeBatch(db);
      let count = 0;
      Array.from(promoteClassData.studentsToPromote as Set<string>).forEach((studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const oldClass = classes.find(c => c.id === student.classId);
          const historyEntry = {
            classId: student.classId,
            className: oldClass?.name || '',
            schoolYearId: oldClass?.schoolYearId || '',
            grades: student.grades || {},
            term1Grades: student.term1Grades || {},
            term2Grades: student.term2Grades || {},
            yearGrades: student.yearGrades || {},
            academicPerformance: student.academicPerformance || '',
            conduct: student.conduct || '',
            cp: student.cp || 0,
            kp: student.kp || 0,
            award: student.award || ''
          };
          
          const docRef = doc(db, 'students', student.id);
          const updatedStudent = {
            classId: promoteClassData.targetClassId,
            historicalRecords: [...(student.historicalRecords || []), historyEntry],
            status: 'Đang học',
            academicPerformance: '',
            conduct: '',
            cp: 0,
            kp: 0,
            award: '',
            grades: {
              math: 0, physics: 0, chemistry: 0, biology: 0, it: 0, localEdu: 'Đ', literature: 0, history: 0, foreignLanguage: 0, pe: 'Đ', defense: 0, japanese: 0, experiential: 'Đ', technology: 0, geography: 0, civicEdu: 0
            },
            term1Grades: {},
            term2Grades: {},
            yearGrades: {},
            term1Details: {},
            term2Details: {},
            displayGrades: {},
            comments: [],
            notifications: [],
            attendanceRecords: {}
          };
          
          batch.update(docRef, updatedStudent);
          count++;
        }
      });
      await batch.commit();
      showAlert(`Đã chuyển thành công ${count} học sinh lên lớp mới.`, 'success');
      setIsPromoteModalOpen(false);
      setPromoteClassData(null);
    } catch (err) {
      console.error(err);
      showAlert('Đã xảy ra lỗi.', 'error');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const hasStudents = students.some(s => s.classId === classId);
    if (hasStudents) {
      showAlert('Không thể xóa lớp học này vì đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.', 'error');
      return;
    }
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa lớp học này?');
    if (isConfirmed) {
      try {
        const docRef = doc(db, 'classes', classId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Lỗi khi xóa lớp:', error);
        showAlert('Đã xảy ra lỗi khi xóa lớp học.', 'error');
      }
    }
  };

  const openEditModal = (c: SchoolClass) => {
    setEditingClass(c);
    setFormData({ schoolYearId: c.id.split('-')[0] || schoolYears[0]?.id || '', name: c.name, homeroomTeacher: c.homeroomTeacher, specialization: c.specialization || '' });
    setIsAddModalOpen(true);
  };

  const handleCleanupOrphanedData = async () => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xoá tất cả học sinh mồ côi (thuộc về các lớp đã bị xoá)? Thao tác này không thể hoàn tác.');
    if (!isConfirmed) return;
    
    try {
      const validClassIds = new Set(classes.map(c => c.id));
      const orphanedStudents = students.filter(s => !validClassIds.has(s.classId));
      
      if (orphanedStudents.length === 0) {
        showAlert('Không tìm thấy dữ liệu học sinh mồ côi.', 'info');
        return;
      }

      const batch = writeBatch(db);
      orphanedStudents.forEach(s => {
        batch.delete(doc(db, 'students', s.id));
      });
      await batch.commit();
      showAlert(`Đã xoá thành công ${orphanedStudents.length} học sinh mồ côi.`, 'success');
    } catch (error) {
      console.error('Lỗi khi dọn dẹp:', error);
      showAlert('Có lỗi xảy ra khi dọn dẹp dữ liệu.', 'error');
    }
  };

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ schoolYearId: '', name: '', homeroomTeacher: '', specialization: '' });
    setIsAddModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userFormData.username.trim() || !userFormData.fullName.trim() || (!editingUser && !userFormData.password)) {
      showAlert('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    const userId = editingUser ? editingUser.id : uuidv4();
    const userData: any = {
      id: userId,
      username: userFormData.username,
      fullName: userFormData.fullName,
      role: userFormData.role,
      subjects: userFormData.role === 'teacher' && userFormData.isSubject ? userFormData.subjects : [],
      homeroomClasses: userFormData.role === 'teacher' && userFormData.isHomeroom ? userFormData.homeroomClasses : [],
      subjectClasses: userFormData.role === 'teacher' && userFormData.isSubject ? userFormData.subjectClasses : []
    };
    if (userFormData.password) {
      userData.password = userFormData.password;
    } else if (editingUser) {
      userData.password = editingUser.password;
    }
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, userData);
      setIsAddUserModalOpen(false);
      setEditingUser(null);
      setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', isHomeroom: false, isSubject: false, subjects: [], homeroomClasses: [], subjectClasses: [] });
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
      showAlert('Đã xảy ra lỗi khi lưu tài khoản.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {

    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa tài khoản này?');
    if (isConfirmed) {
      try {
        const docRef = doc(db, 'users', userId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        showAlert('Đã xảy ra lỗi khi xóa tài khoản.', 'error');
      }
    }
  };

  const openEditUserModal = (u: UserAccount) => {
    setEditingUser(u);
    setUserFormData({ username: u.username, password: '', fullName: u.fullName, role: u.role, isHomeroom: !!u.homeroomClasses?.length, isSubject: !!u.subjectClasses?.length, subjects: u.subjects || [], homeroomClasses: u.homeroomClasses || [], subjectClasses: u.subjectClasses || [] });
    setIsAddUserModalOpen(true);
  };

  const fileInputRefUsers = useRef<HTMLInputElement>(null);

  const handleDownloadUserTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Mã Giáo viên (username)', 'Mật khẩu (password)', 'Họ và tên (fullName)', 'Vai trò (admin/teacher)'],
      ['GV001', '123456', 'Nguyễn Văn A', 'teacher'],
      ['GV002', '123456', 'Lê Thị B', 'teacher'],
      ['ADMIN', '123456', 'Nguyễn Hiệu Trưởng', 'admin'],
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
            isHomeroom: false,
            isSubject: false,
            homeroomClasses: [],
            subjectClasses: [],
            subjects: []
          };
          
          await addDoc(collection(db, 'users'), userData);
          successCount++;
        }
        
        alert(`Đã nhập thành công ${successCount} tài khoản mới!`);
        if (fileInputRefUsers.current) fileInputRefUsers.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi đọc file Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', isHomeroom: false, isSubject: false, subjects: [], homeroomClasses: [], subjectClasses: [] });
    setIsAddUserModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes((userSearchTerm || '').toLowerCase()) || 
    (u.fullName || '').toLowerCase().includes((userSearchTerm || '').toLowerCase())
  );

  return (
    <div className="h-full bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex flex-wrap gap-1">
          <button 
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'classes' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Building2 className="w-4 h-4" /> Lớp học
          </button>
          <button 
            onClick={() => setActiveTab('school_years')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'school_years' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Calendar className="w-4 h-4" /> Năm học
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Shield className="w-4 h-4" /> Tài khoản & Phân quyền
          </button>
          <button 
            onClick={() => setActiveTab('backup')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'backup' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Database className="w-4 h-4" /> Sao lưu dữ liệu
          </button>
          <button 
            onClick={() => setActiveTab('ai_config')}
            className={`whitespace-nowrap px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'ai_config' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Sparkles className="w-4 h-4" /> Cấu hình AI
          </button>
          <button 
            onClick={() => setActiveTab('firebase')}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'firebase' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Cloud className="w-4 h-4" /> Kết nối Firebase
          </button>
        </div>

        {activeTab === 'classes' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-800">Quản lý Lớp học</h1>
                <p className="text-slate-500 mt-1">Báo cáo tổng quan số lượng học sinh và giáo viên chủ nhiệm</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input 
                  type="file" 
                  accept=".xlsx" 
                  ref={fileInputRef} 
                  onChange={handleImportExcel} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" /> Nhập Excel
                </button>
                <button 
                  onClick={handleCleanupOrphanedData}
                  className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Dọn rác
                </button>
                <button 
                  onClick={handleExportTemplate}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Mẫu Excel
                </button>
                <button 
                  onClick={openAddModal}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm Lớp mới
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Tổng số Lớp</p>
                  <p className="text-2xl font-bold font-display text-slate-800">{filteredClasses.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Tổng số Học sinh</p>
                  <p className="text-2xl font-bold font-display text-slate-800">{students.filter(s => filteredClasses.some(c => c.id === s.classId)).length}</p>
                </div>
              </div>
            </div>

        {/* Classes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex gap-4 w-full sm:w-auto flex-col sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm lớp, giáo viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={classFilterYear}
                onChange={e => setClassFilterYear(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700"
              >
                <option value="">Tất cả năm học</option>
                {schoolYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Lớp</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Giáo viên Chủ nhiệm</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Phân ban</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Sĩ số Học sinh</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu lớp học
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(c => {
                    const studentCount = students.filter(s => s.classId === c.id).length;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 border-b border-slate-50">
                          <span className="font-bold text-slate-800">{c.name}</span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                              {c.homeroomTeacher.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{c.homeroomTeacher}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                          {c.specialization ? (
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${c.specialization === 'Tự Nhiên' ? 'bg-blue-100 text-blue-700' : c.specialization === 'Xã Hội' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                              {c.specialization}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">Cơ Bản</span>
                          )}
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
                            {studentCount} hs
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            
                            <button 
                              onClick={() => {
                                const classStudents = students.filter(s => s.classId === c.id);
                                if (classStudents.length === 0) {
                                  showAlert('Lớp không có học sinh.', 'info');
                                  return;
                                }
                                setPromoteClassData({
                                  sourceClass: c,
                                  targetClassId: '',
                                  studentsToPromote: new Set(classStudents.map(s => s.id))
                                });
                                setIsPromoteModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Lên lớp / Chuyển lớp"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(c)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Sửa lớp"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClass(c.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa lớp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        
        {activeTab === 'school_years' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-800">Quản lý Năm học</h1>
                <p className="text-slate-500 mt-1">Danh sách các năm học trong hệ thống</p>
              </div>
              <button 
                onClick={() => { setEditingYear(null); setYearFormData({ name: '' }); setIsAddYearModalOpen(true); }}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Thêm Năm học
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Số lượng Lớp</th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolYears.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Chưa có năm học nào</td>
                    </tr>
                  ) : (
                    schoolYears.map(y => {
                      const classCount = classes.filter(c => c.schoolYearId === y.id).length;
                      return (
                        <tr key={y.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50 font-bold text-slate-800">{y.name}</td>
                          <td className="px-6 py-4 border-b border-slate-50 text-center text-slate-600 font-medium">
                            {classCount}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingYear(y); setYearFormData({ name: y.name }); setIsAddYearModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Sửa"
                              ><Edit2 className="w-4 h-4" /></button>
                              <button 
                                onClick={() => handleDeleteYear(y.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              ><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}


        {activeTab === 'accounts' && (
          <>

            {/* Cấu hình Giao diện */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-8">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                  Cấu hình Giao diện
                </h2>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingSettings ? 'Đang lưu...' : 'Lưu Cấu hình'}
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Ứng dụng (Page Title)</label>
                  <input
                    type="text"
                    value={appSettings.pageTitle}
                    onChange={(e) => setAppSettings({ ...appSettings, pageTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="EduManage Pro"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ hiển thị ở tiêu đề trang (thẻ browser).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Hiển thị (Login/EduManager)</label>
                  <input
                    type="text"
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="EduManage Pro"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ hiển thị ở trang đăng nhập thay cho EduManage Pro.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hình nền Giao diện Portal \(URL\)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.portalBackground}
                      onChange={(e) => setAppSettings({ ...appSettings, portalBackground: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập URL hoặc tải ảnh lên"
                    />
                    <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1" title="Tải ảnh lên">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'portalBackground')} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">URL hình ảnh nền cho trang Portal.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icon Tiêu đề \(Favicon URL\)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.pageIcon}
                      onChange={(e) => setAppSettings({ ...appSettings, pageIcon: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập URL hoặc tải ảnh lên"
                    />
                    <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1" title="Tải ảnh lên">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'pageIcon')} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">URL hình ảnh nhỏ trên thẻ trình duyệt.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo Giao diện Portal \(URL\)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.portalLogo}
                      onChange={(e) => setAppSettings({ ...appSettings, portalLogo: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập URL hoặc tải ảnh lên"
                    />
                    <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1" title="Tải ảnh lên">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'portalLogo')} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Sẽ thay thế icon cái mũ ở trang Portal.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo Trang Đăng nhập \(URL\)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.loginLogo}
                      onChange={(e) => setAppSettings({ ...appSettings, loginLogo: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập URL hoặc tải ảnh lên"
                    />
                    <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1" title="Tải ảnh lên">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'loginLogo')} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Sẽ thay thế icon cái mũ ở trang Đăng nhập.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-800">Tài khoản & Phân quyền</h1>
                <p className="text-slate-500 mt-1">Quản lý tài khoản Ban Giám Hiệu, Giáo viên và mã truy cập Phụ huynh</p>
              </div>
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
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã GV, tên..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Mã GV (Tài khoản)</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên hiển thị</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Phân quyền</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Lớp phân công</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Không tìm thấy tài khoản
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50">
                            <span className="font-bold text-slate-800 font-mono">{u.username}</span>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                {(u.fullName || 'U').charAt(0)}
                              </div>
                              <span className="font-medium text-slate-700">{u.fullName || 'Chưa cập nhật'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-semibold text-sm ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                              {u.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50">
                            {u.role === 'teacher' && (
                              <div className="text-sm text-slate-600">
                                {u.homeroomClasses && u.homeroomClasses.length > 0 && (
                                  <div className="mb-1"><span className="font-semibold text-indigo-600">GVCN:</span> {u.homeroomClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ')}</div>
                                )}
                                {u.subjectClasses && u.subjectClasses.length > 0 && (
                                  <div><span className="font-semibold text-emerald-600">GVBM:</span> {u.subjectClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ')}</div>
                                )}
                                {(!u.homeroomClasses?.length && !u.subjectClasses?.length) && <span className="text-slate-400 italic">Chưa phân công</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openEditUserModal(u)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Sửa tài khoản"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Phụ huynh codes (Read-only list generated from students) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-800">Mã truy cập Phụ huynh</h3>
                  <p className="text-sm text-slate-500">Mã được tạo tự động dựa trên: Lớp-STT</p>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200 mb-4 flex gap-3">
                  <Key className="w-5 h-5 shrink-0" />
                  <p>Phụ huynh đăng nhập bằng mã học sinh (VD: <strong>10QT3A-001</strong>). Không cần mật khẩu. Dưới đây là danh sách gợi ý mã để gửi cho phụ huynh.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                  {students.map(student => {
                    const studentClass = classes.find(c => c.id === student.classId);
                    if (!studentClass) return null;
                    const code = student.code || `${studentClass.name}-${student.stt.toString().padStart(3, '0')}`;
                    return (
                      <div key={student.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-medium text-slate-800">{student.fullName}</p>
                          <p className="text-xs text-slate-500">Lớp: {studentClass.name}</p>
                        </div>
                        <div className="bg-slate-100 text-slate-700 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-slate-200">
                          {code}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      
      {/* Add/Edit Year Modal */}
      {isAddYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">{editingYear ? 'Sửa Năm học' : 'Thêm Năm học'}</h3>
              <button onClick={() => setIsAddYearModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Năm học (VD: 2024-2025) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={yearFormData.name}
                  onChange={e => setYearFormData({...yearFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="2024-2025"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsAddYearModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg">Hủy</button>
              <button onClick={handleSaveYear} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {isPromoteModalOpen && promoteClassData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Kết chuyển học sinh (Lên lớp)</h3>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex-1">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">Từ lớp hiện tại</p>
                  <p className="font-bold text-slate-800 text-lg">{promoteClassData.sourceClass.name}</p>
                </div>
                <div className="text-indigo-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">Đến lớp mới</p>
                  <select 
                    value={promoteClassData.targetClassId}
                    onChange={(e) => setPromoteClassData({...promoteClassData, targetClassId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.filter(c => c.id !== promoteClassData.sourceClass.id).map(c => {
                      const year = schoolYears.find(y => c.schoolYearId === y.id || c.id.startsWith(y.id));
                      return (
                        <option key={c.id} value={c.id}>{c.name} {year ? `(Năm học: ${year.name})` : ''}</option>
                      )
                    })}
                  </select>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={promoteClassData.studentsToPromote.size === students.filter(s => s.classId === promoteClassData.sourceClass.id).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPromoteClassData({
                                ...promoteClassData,
                                studentsToPromote: new Set(students.filter(s => s.classId === promoteClassData.sourceClass.id).map(s => s.id))
                              });
                            } else {
                              setPromoteClassData({
                                ...promoteClassData,
                                studentsToPromote: new Set()
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-500">Học sinh</th>
                      <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-500">Trạng thái (Học lực/Hạnh kiểm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.classId === promoteClassData.sourceClass.id).map(student => (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={promoteClassData.studentsToPromote.has(student.id)}
                            onChange={(e) => {
                              const newSet = new Set(promoteClassData.studentsToPromote);
                              if (e.target.checked) {
                                newSet.add(student.id);
                              } else {
                                newSet.delete(student.id);
                              }
                              setPromoteClassData({
                                ...promoteClassData,
                                studentsToPromote: newSet
                              });
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{student.fullName}</div>
                          <div className="text-xs text-slate-500">Mã: {student.code || student.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">
                            Học lực: <span className="font-medium">{student.academicPerformance || 'Chưa có'}</span>
                            {' - '}
                            Hạnh kiểm: <span className="font-medium">{student.conduct || 'Chưa có'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsPromoteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg">Hủy</button>
              <button onClick={handlePromoteSubmit} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Chuyển lên lớp mới</button>
            </div>
          </div>
        </div>
      )}


      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">{editingClass ? 'Sửa thông tin Lớp' : 'Thêm Lớp mới'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm học <span className="text-red-500">*</span></label>
                <select 
                  value={formData.schoolYearId}
                  onChange={e => setFormData({...formData, schoolYearId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-slate-700"
                >
                  <option value="">-- Chọn năm học --</option>
                  {schoolYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Lớp <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Ví dụ: 10QT3A"
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Giáo viên Chủ nhiệm <span className="text-red-500">*</span></label>
                <div 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all flex items-center bg-white cursor-pointer"
                  onClick={() => setShowTeacherDropdown(true)}
                >
                  <span className="flex-1 text-slate-700">{formData.homeroomTeacher || 'Chọn Giáo viên Chủ nhiệm...'}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>

                {showTeacherDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTeacherDropdown(false)}></div>
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
                      <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            autoFocus
                            placeholder="Tìm tên hoặc mã giáo viên..."
                            value={teacherSearchTerm}
                            onChange={e => setTeacherSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {users
                          .filter(u => u.role === 'teacher')
                          .filter(u => (u.fullName || '').toLowerCase().includes((teacherSearchTerm || '').toLowerCase()) || (u.username || '').toLowerCase().includes((teacherSearchTerm || '').toLowerCase()))
                          .map(teacher => (
                            <div 
                              key={teacher.id}
                              className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onClick={() => {
                                setFormData({...formData, homeroomTeacher: teacher.fullName});
                                setShowTeacherDropdown(false);
                                setTeacherSearchTerm('');
                              }}
                            >
                              <div className="font-medium text-slate-800 text-sm">{teacher.fullName}</div>
                              <div className="text-xs text-slate-500">Mã GV: {teacher.username}</div>
                            </div>
                          ))}
                        {users.filter(u => u.role === 'teacher' && ((u.fullName || '').toLowerCase().includes((teacherSearchTerm || '').toLowerCase()) || (u.username || '').toLowerCase().includes((teacherSearchTerm || '').toLowerCase()))).length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-slate-500">
                            Không tìm thấy giáo viên nào.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phân ban</label>
                <select 
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Không có / Cơ Bản</option>
                  <option value="Tự Nhiên">Tự Nhiên</option>
                  <option value="Xã Hội">Xã Hội</option>
                </select>
              </div>
            </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveClass}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">{editingUser ? 'Sửa Tài khoản' : 'Thêm Tài khoản mới'}</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Giáo viên (Tài khoản đăng nhập) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={userFormData.username}
                  onChange={e => setUserFormData({...userFormData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  placeholder="Ví dụ: teacher_abc"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu {editingUser ? '(Để trống nếu không muốn đổi)' : <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="password" 
                  value={userFormData.password}
                  onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={userFormData.fullName}
                  onChange={e => setUserFormData({...userFormData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Ví dụ: Cô Lan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phân quyền</label>
                <select
                  value={userFormData.role}
                  onChange={e => setUserFormData({...userFormData, role: e.target.value as 'admin' | 'teacher'})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Ban Giám Hiệu (Admin)</option>
                </select>

              </div>
              {userFormData.role === 'teacher' && (
                <div className="col-span-1 border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-semibold text-slate-800">Phân công chuyên môn</h4>
                    <div className="flex-1"></div>
                    <div className="w-1/2">
                      <select
                        value={userAssignmentYear}
                        onChange={e => setUserAssignmentYear(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="">-- Tất cả năm học --</option>
                        {schoolYears.map(y => (
                          <option key={y.id} value={y.id}>{y.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl space-y-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userFormData.isHomeroom} 
                        onChange={e => setUserFormData({...userFormData, isHomeroom: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Là Giáo viên Chủ nhiệm (GVCN)</span>
                    </label>
                    {userFormData.isHomeroom && (
                      <div className="ml-6">
                        <select
                          multiple
                          value={userFormData.homeroomClasses}
                          onChange={e => {
                            const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                            setUserFormData({...userFormData, homeroomClasses: values});
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                        >
                          {classes.filter(c => !userAssignmentYear || c.schoolYearId === userAssignmentYear).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều lớp</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userFormData.isSubject} 
                        onChange={e => setUserFormData({...userFormData, isSubject: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Là Giáo viên Bộ môn (GVBM)</span>
                    </label>
                    {userFormData.isSubject && (
                      <div className="ml-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                          <div className="flex flex-wrap gap-2">
                            {['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'GDCD', 'Tin Học', 'Thể Dục', 'Công Nghệ'].map(subject => (
                              <label key={subject} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                                <input 
                                  type="checkbox"
                                  checked={userFormData.subjects.includes(subject)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setUserFormData({...userFormData, subjects: [...userFormData.subjects, subject]});
                                    } else {
                                      setUserFormData({...userFormData, subjects: userFormData.subjects.filter(s => s !== subject)});
                                    }
                                  }}
                                  className="text-indigo-600 focus:ring-indigo-500 rounded-sm w-3.5 h-3.5"
                                />
                                <span className="text-sm font-medium text-slate-700">{subject}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Lớp giảng dạy</label>
                          <select
                            multiple
                            value={userFormData.subjectClasses}
                            onChange={e => {
                              const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                              setUserFormData({...userFormData, subjectClasses: values});
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                          >
                            {classes.filter(c => !userAssignmentYear || c.schoolYearId === userAssignmentYear).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều lớp</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveUser}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Lưu Tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

        {activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-display text-slate-800">Sao lưu dữ liệu</h1>
              <p className="text-slate-500 mt-1">Xuất toàn bộ dữ liệu của hệ thống để dự phòng</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Tạo bản sao lưu cục bộ</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Tải xuống tệp JSON chứa toàn bộ dữ liệu hệ thống hiện tại, bao gồm danh sách năm học, lớp học, học sinh và tài khoản người dùng.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const dataToExport = {
                      schoolYears,
                      classes,
                      students,
                      users
                    };
                    const dataStr = JSON.stringify(dataToExport, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                    const exportFileDefaultName = `edumanage_backup_${new Date().toISOString().split('T')[0]}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                    showAlert('Đã tạo bản sao lưu dữ liệu.', 'success');
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-5 h-5" /> Tải xuống bản sao lưu
                </button>
                
                <button
                  onClick={() => backupFileInputRef.current?.click()}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Upload className="w-5 h-5" /> Phục hồi dữ liệu (Upload)
                </button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={backupFileInputRef}
                  onChange={handleRestoreBackup}
                />
              </div>
            </div>
          </div>
        )}

        
        {activeTab === 'ai_config' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-display text-slate-800">Cấu hình Trợ lý AI</h1>
              <p className="text-slate-500 mt-1">Thông tin nhà trường cung cấp để AI sử dụng khi nhận xét học sinh</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Thông tin chính thống (Fanpage, SĐT, Khoá học,...)</label>
              <textarea
                className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                value={aiConfigText}
                onChange={(e) => setAiConfigText(e.target.value)}
                placeholder="Nhập thông tin tại đây..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem('aiAdminConfig', aiConfigText);
                    showAlert('Đã lưu cấu hình AI', 'success');
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'firebase' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-display text-slate-800">Cấu hình kết nối Firebase</h1>
              <p className="text-slate-500 mt-1">Thiết lập cơ sở dữ liệu riêng biệt để đưa ứng dụng vào sử dụng chính thức</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-6 p-4 bg-indigo-50 text-indigo-800 rounded-xl">
                <Server className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Tại sao cần cấu hình Firebase riêng?</h3>
                  <p className="text-sm">
                    Theo mặc định, ứng dụng sử dụng cơ sở dữ liệu mẫu. Để đưa ứng dụng lên hệ thống thật cho giáo viên sử dụng, bạn cần cung cấp <strong>firebaseConfig</strong> của dự án Firebase (Firestore) do trường bạn quản lý. Dữ liệu sẽ được lưu trữ an toàn trên đó.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">JSON Cấu hình Firebase (firebaseConfig)</label>
                  <textarea
                    value={firebaseConfigStr}
                    onChange={(e) => setFirebaseConfigStr(e.target.value)}
                    placeholder="Dán cấu hình dạng JSON vào đây. Ví dụ:
{
  &quot;apiKey&quot;: &quot;AIzaSy...&quot;,
  &quot;authDomain&quot;: &quot;your-app.firebaseapp.com&quot;,
  &quot;projectId&quot;: &quot;your-app&quot;,
  ...
}"
                    className="w-full h-48 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (!firebaseConfigStr.trim()) {
                        localStorage.removeItem('customFirebaseConfig');
                        showAlert('Đã xóa cấu hình riêng. Đang quay lại cơ sở dữ liệu mặc định...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                        return;
                      }
                      
                      try {
                        JSON.parse(firebaseConfigStr);
                        localStorage.setItem('customFirebaseConfig', firebaseConfigStr);
                        showAlert('Lưu cấu hình thành công. Hệ thống sẽ khởi động lại...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      } catch (e) {
                        showAlert('JSON cấu hình không hợp lệ. Vui lòng kiểm tra lại.', 'error');
                      }
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Lưu và Khởi động lại
                  </button>
                  <button
                    onClick={() => {
                      setFirebaseConfigStr('');
                      localStorage.removeItem('customFirebaseConfig');
                      showAlert('Đã trở về cấu hình mặc định', 'info');
                      setTimeout(() => window.location.reload(), 1500);
                    }}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Dùng cấu hình mặc định
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
