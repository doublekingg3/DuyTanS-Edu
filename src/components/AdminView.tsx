import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { SchoolClass, Student, UserAccount, UserPermissions, SchoolYear, AppSettings, defaultSettings, sortClasses, getUserTeacherType } from '../data';
import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate, PieChart as PieChartIcon, BarChart2, RefreshCcw, Settings, CheckCircle, X, BookOpen, Check, FileSpreadsheet, Copy, CheckCheck, LayoutList, Grid } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAlert } from "../contexts/AlertContext";
import { db } from '../lib/firebase';
import { defaultDb } from '../lib/firebase_default';
import { doc, setDoc, deleteDoc, updateDoc, writeBatch, addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import AdminReports from './AdminReports';
import ClassAssignmentPicker from './ClassAssignmentPicker';

export default function AdminView({ 
  classes, 
  students, 
  users, 
  schoolYears, 
  settings, 
  onUpdateSettings,
  externalActiveTab, 
  onTabChange 
}: { 
  classes: SchoolClass[], 
  students: Student[], 
  users: UserAccount[], 
  schoolYears: SchoolYear[], 
  settings?: AppSettings, 
  onUpdateSettings?: (newSettings: AppSettings) => Promise<void> | void,
  externalActiveTab?: string, 
  onTabChange?: (tab: string) => void 
}) {
  const { showAlert, showConfirm } = useAlert();

  const [appSettings, setAppSettings] = useState<AppSettings>(settings || defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  
  React.useEffect(() => {
    if (settings) {
      setAppSettings(settings);
    }
  }, [settings]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh < 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          let MAX_WIDTH = 1200;
          let MAX_HEIGHT = 800;
          let quality = 0.72;
          let maxByteLength = 260000;
          
          if (field === 'portalLogo' || field === 'loginLogo') {
            MAX_WIDTH = 400;
            MAX_HEIGHT = 400;
            quality = 0.82;
            maxByteLength = 120000;
          } else if (field === 'pageIcon') {
            MAX_WIDTH = 128;
            MAX_HEIGHT = 128;
            quality = 0.85;
            maxByteLength = 40000;
          } else {
            MAX_WIDTH = 1280;
            MAX_HEIGHT = 720;
            quality = 0.65;
            maxByteLength = 260000;
          }
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          if (compressedDataUrl.length > maxByteLength) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality * 0.7);
          }
          
          setAppSettings(prev => ({ ...prev, [field]: compressedDataUrl }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const cleanSettings: AppSettings = {
        pageTitle: (appSettings.pageTitle || '').trim() || defaultSettings.pageTitle,
        appName: (appSettings.appName || '').trim() || defaultSettings.appName,
        pageIcon: appSettings.pageIcon || '',
        portalLogo: appSettings.portalLogo || '',
        loginLogo: appSettings.loginLogo || '',
        portalBackground: appSettings.portalBackground || '',
        loginBackground: appSettings.loginBackground || '',
        disablePortal: !!appSettings.disablePortal
      };

      // 1. Sync to current active Firebase Firestore
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, cleanSettings, { merge: true });

      // 2. Cross-sync to default Firebase instance as permanent fallback
      try {
        const defaultSettingsRef = doc(defaultDb, 'settings', 'general');
        await setDoc(defaultSettingsRef, cleanSettings, { merge: true });
      } catch (err) {
        console.warn('Cross-sync to defaultDb skipped/warn:', err);
      }

      // 3. Save local cache backup for instant restoration
      try {
        localStorage.setItem('edumanage_app_settings', JSON.stringify(cleanSettings));
      } catch (e) {}

      // 4. Update parent app state
      if (onUpdateSettings) {
        await onUpdateSettings(cleanSettings);
      }

      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(nowStr);

      showAlert('Đã lưu và đồng bộ cấu hình giao diện & logo lên Firebase thành công!', 'success');
    } catch (error) {
      console.error("Error saving settings to Firebase:", error);
      showAlert('Lỗi khi lưu cấu hình lên Firebase. Vui lòng thử lại với ảnh dung lượng nhỏ hơn.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  type TabType = 'classes' | 'accounts' | 'school_years' | 'backup' | 'firebase' | 'ai_config' | 'reports' | 'settings' | 'system_config';
  type SystemConfigSubTab = 'settings' | 'backup' | 'ai_config' | 'firebase';

  const [configSubTab, setConfigSubTab] = useState<SystemConfigSubTab>(() => {
    if (externalActiveTab === 'backup' || externalActiveTab === 'ai_config' || externalActiveTab === 'firebase') {
      return externalActiveTab;
    }
    return 'settings';
  });

  const [activeTabState, setActiveTabState] = useState<TabType>(() => {
    if (externalActiveTab === 'settings' || externalActiveTab === 'backup' || externalActiveTab === 'ai_config' || externalActiveTab === 'firebase' || externalActiveTab === 'system_config') {
      return 'system_config';
    }
    return (externalActiveTab as TabType) || 'classes';
  });

  React.useEffect(() => {
    if (externalActiveTab) {
      if (externalActiveTab === 'settings' || externalActiveTab === 'backup' || externalActiveTab === 'ai_config' || externalActiveTab === 'firebase') {
        setActiveTabState('system_config');
        setConfigSubTab(externalActiveTab as SystemConfigSubTab);
      } else if (externalActiveTab === 'system_config') {
        setActiveTabState('system_config');
      } else {
        setActiveTabState(externalActiveTab as TabType);
      }
    }
  }, [externalActiveTab]);

  const activeTab = activeTabState;

  const setActiveTab = (tab: TabType) => {
    if (tab === 'settings' || tab === 'backup' || tab === 'ai_config' || tab === 'firebase') {
      setActiveTabState('system_config');
      setConfigSubTab(tab as SystemConfigSubTab);
      onTabChange?.('system_config');
    } else {
      setActiveTabState(tab);
      onTabChange?.(tab);
    }
  };
  const [aiConfigText, setAiConfigText] = useState(localStorage.getItem('aiAdminConfig') || 'Fanpage: https://facebook.com/truong\nHotline: 0123.456.789\nCác khoá học hiện có: Tiếng Anh giao tiếp, Toán tư duy, Kỹ năng sống');

  
  const [firebaseConfigStr, setFirebaseConfigStr] = useState(localStorage.getItem('customFirebaseConfig') || '');
  
  
  
  // School Years state
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<SchoolYear | null>(null);
  const [yearFormData, setYearFormData] = useState({ name: '' });
  const activeYears = schoolYears.filter(y => !y.isDeleted);
  const deletedYears = schoolYears.filter(y => y.isDeleted);
  const [selectedYearIds, setSelectedYearIds] = useState<string[]>([]);
  const [isYearTrashModalOpen, setIsYearTrashModalOpen] = useState(false);
  const [selectedTrashYearIds, setSelectedTrashYearIds] = useState<string[]>([]);
  
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

    const confirmed = await showConfirm('Hành động này sẽ khôi phục dữ liệu từ tệp sao lưu. Dữ liệu hiện tại có thể bị ghi đè. Bạn có chắc chắn muốn tiếp tục?');
    if (!confirmed) {
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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isClassTrashModalOpen, setIsClassTrashModalOpen] = useState(false);
  const [selectedTrashClassIds, setSelectedTrashClassIds] = useState<string[]>([]);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [selectedTrashUserIds, setSelectedTrashUserIds] = useState<string[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userAssignmentYear, setUserAssignmentYear] = useState('');
  const [userFormData, setUserFormData] = useState<{
    username: string;
    password: string;
    fullName: string;
    role: 'admin' | 'teacher' | 'subject_teacher' | 'staff';
    teacherType: 'gvcn' | 'gvbm';
    isHomeroom: boolean;
    isSubject: boolean;
    subjects: string[];
    homeroomClasses: string[];
    subjectClasses: string[];
    permissions: UserPermissions;
  }>({
    username: '',
    password: '',
    fullName: '',
    role: 'teacher' as 'admin' | 'teacher' | 'staff',
    teacherType: 'gvcn',
    isHomeroom: true,
    isSubject: false,
    subjects: [],
    homeroomClasses: [],
    subjectClasses: [],
    permissions: {
      schedule: 'edit',
      students: 'edit',
      grades: 'edit',
      weeklyPlan: 'edit',
      lunchMenu: 'view',
      attendance: 'edit'
    }
  });

  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [formData, setFormData] = useState({
    schoolYearId: '',
    name: '',
    homeroomTeacher: '',
    specialization: ''
  });

  const activeClasses = sortClasses(classes.filter(c => !c.isDeleted));
  const deletedClasses = sortClasses(classes.filter(c => c.isDeleted));
  const filteredClasses = activeClasses.filter(c => 
    ((c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
    (c.homeroomTeacher || '').toLowerCase().includes((searchTerm || '').toLowerCase())) &&
    (classFilterYear ? c.schoolYearId === classFilterYear : true)
  );

  // Parent Access Codes state
  const [parentAccessClassId, setParentAccessClassId] = useState<string>('all');
  const [parentAccessSearch, setParentAccessSearch] = useState<string>('');
  const [parentAccessCopiedId, setParentAccessCopiedId] = useState<string | null>(null);
  const [parentAccessViewMode, setParentAccessViewMode] = useState<'table' | 'cards'>('table');

  // Filtered students for Parent Access list
  const parentAccessStudents = React.useMemo(() => {
    let list = students.filter(s => !s.isDeleted);
    
    // Filter by selected class
    if (parentAccessClassId !== 'all') {
      list = list.filter(s => s.classId === parentAccessClassId);
    }
    
    // Filter by search query (name, code, class)
    if (parentAccessSearch.trim()) {
      const q = parentAccessSearch.trim().toLowerCase();
      list = list.filter(s => {
        const studentClass = classes.find(c => c.id === s.classId);
        const className = studentClass ? studentClass.name.toLowerCase() : '';
        const code = (s.code || (studentClass ? `${studentClass.name}-${s.stt.toString().padStart(3, '0')}` : '')).toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          code.includes(q) ||
          className.includes(q)
        );
      });
    }

    // Sort by class name then by STT
    return [...list].sort((a, b) => {
      const classA = classes.find(c => c.id === a.classId)?.name || '';
      const classB = classes.find(c => c.id === b.classId)?.name || '';
      if (classA !== classB) {
        return classA.localeCompare(classB, undefined, { numeric: true });
      }
      return (a.stt || 0) - (b.stt || 0);
    });
  }, [students, classes, parentAccessClassId, parentAccessSearch]);

  // Export Parent Access Excel: STT | Lớp | Mã định danh | Họ và tên | Mật khẩu
  const handleExportParentAccessExcel = () => {
    let exportList = students.filter(s => !s.isDeleted);
    let targetClassName = 'Tất cả các lớp';
    
    if (parentAccessClassId !== 'all') {
      exportList = exportList.filter(s => s.classId === parentAccessClassId);
      const selectedClass = classes.find(c => c.id === parentAccessClassId);
      if (selectedClass) {
        targetClassName = `Lớp ${selectedClass.name}`;
      }
    }

    exportList = [...exportList].sort((a, b) => {
      const classA = classes.find(c => c.id === a.classId)?.name || '';
      const classB = classes.find(c => c.id === b.classId)?.name || '';
      if (classA !== classB) {
        return classA.localeCompare(classB, undefined, { numeric: true });
      }
      return (a.stt || 0) - (b.stt || 0);
    });

    if (exportList.length === 0) {
      showAlert('Không có dữ liệu học sinh để xuất Excel.', 'info');
      return;
    }

    // Formatted rows strictly as requested: STT | Lớp | Mã định danh | Họ và tên | Mật khẩu
    const headers = ['STT', 'Lớp', 'Mã định danh', 'Họ và tên', 'Mật khẩu'];
    
    const rows = exportList.map((s, idx) => {
      const studentClass = classes.find(c => c.id === s.classId);
      const className = studentClass ? studentClass.name : 'Chưa xếp lớp';
      const studentCode = s.code || (studentClass ? `${studentClass.name}-${s.stt.toString().padStart(3, '0')}` : `HS-${s.stt}`);
      const password = (s as any).password || '12345678';
      
      return [
        idx + 1,
        className,
        studentCode,
        s.fullName,
        password
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 8 },  // STT
      { wch: 14 }, // Lớp
      { wch: 22 }, // Mã định danh
      { wch: 30 }, // Họ và tên
      { wch: 18 }  // Mật khẩu
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = (parentAccessClassId !== 'all' 
      ? `Ma_Truy_Cap_${classes.find(c => c.id === parentAccessClassId)?.name || 'Lop'}`
      : 'Ma_Truy_Cap_Phu_Huynh'
    ).substring(0, 31);
      
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const safeClassName = targetClassName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
    const fileName = `Danh_Sach_Ma_Truy_Cap_Phu_Huynh_${safeClassName}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showAlert(`Đã xuất file Excel mã truy cập phụ huynh (${exportList.length} học sinh) thành công!`, 'success');
  };

  const handleCopyAccessInfo = (student: Student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    const className = studentClass ? studentClass.name : '';
    const code = student.code || (studentClass ? `${studentClass.name}-${student.stt.toString().padStart(3, '0')}` : '');
    const password = (student as any).password || '12345678';
    
    const textToCopy = `Học sinh: ${student.fullName} (Lớp: ${className})\nMã định danh: ${code}\nMật khẩu: ${password}`;
    navigator.clipboard.writeText(textToCopy);
    setParentAccessCopiedId(student.id);
    setTimeout(() => {
      setParentAccessCopiedId(null);
    }, 2000);
  };

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
    if (!formData.name || !formData.homeroomTeacher) {
      showAlert('Vui lòng nhập tên lớp và giáo viên chủ nhiệm.', 'error');
      return;
    }
    try {
      if (editingClass) {
        await setDoc(doc(db, 'classes', editingClass.id), formData, { merge: true });
        showAlert('Cập nhật lớp thành công.', 'success');
      } else {
        const newClass = { ...formData, id: uuidv4() };
        await setDoc(doc(db, 'classes', newClass.id), newClass);
        showAlert('Thêm lớp mới thành công.', 'success');
      }
      setIsAddModalOpen(false);
    } catch (e) {
      showAlert('Lỗi khi lưu lớp.', 'error');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const hasStudents = students.some(s => s.classId === classId && !s.isDeleted);
    if (hasStudents) {
      showAlert('Không thể xóa lớp học này vì đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.', 'error');
      return;
    }
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn chuyển lớp này vào thùng rác?');
    if (isConfirmed) {
      try {
        await setDoc(doc(db, 'classes', classId), { isDeleted: true }, { merge: true });
        showAlert('Đã chuyển lớp vào thùng rác.', 'success');
      } catch (error) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };

  const handleDeleteSelectedClasses = async () => {
    if (selectedClassIds.length === 0) return;
    
    // Check if any selected class has students
    const classesWithStudents = selectedClassIds.filter(id => students.some(s => s.classId === id && !s.isDeleted));
    if (classesWithStudents.length > 0) {
      showAlert('Không thể xóa: Có lớp học đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.', 'error');
      return;
    }

    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn chuyển ${selectedClassIds.length} lớp đã chọn vào thùng rác?`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedClassIds.forEach(id => {
          batch.set(doc(db, 'classes', id), { isDeleted: true }, { merge: true });
        });
        await batch.commit();
        setSelectedClassIds([]);
        showAlert('Đã chuyển các lớp vào thùng rác.', 'success');
      } catch (error) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };

  const handleSaveYear = async () => {
    if (!yearFormData.name) {
      showAlert('Vui lòng nhập tên năm học.', 'error');
      return;
    }
    try {
      const yearId = yearFormData.name.replace(/[^0-9]/g, '');
      const data = { id: yearId, name: yearFormData.name };
      await setDoc(doc(db, 'schoolYears', yearId), data, { merge: true });
      showAlert('Lưu năm học thành công.', 'success');
      setIsAddYearModalOpen(false);
    } catch (e) {
      showAlert('Lỗi khi lưu năm học.', 'error');
    }
  };


  const handleDeleteYear = async (id: string) => {
    const hasClasses = classes.some(c => c.schoolYearId === id && !c.isDeleted);
    if (hasClasses) {
      showAlert('Không thể xóa năm học này vì đang có lớp học. Vui lòng xóa hoặc chuyển các lớp trước.', 'error');
      return;
    }
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn chuyển năm học này vào thùng rác?');
    if (isConfirmed) {
      try {
        await setDoc(doc(db, 'schoolYears', id), { isDeleted: true }, { merge: true });
        showAlert('Đã chuyển năm học vào thùng rác.', 'success');
      } catch (e) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };

  const handleDeleteSelectedYears = async () => {
    if (selectedYearIds.length === 0) return;
    const yearsWithClasses = selectedYearIds.filter(id => classes.some(c => c.schoolYearId === id && !c.isDeleted));
    if (yearsWithClasses.length > 0) {
      showAlert('Không thể xóa: Có năm học đang chứa lớp học.', 'error');
      return;
    }
    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn chuyển ${selectedYearIds.length} năm học đã chọn vào thùng rác?`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedYearIds.forEach(id => {
          batch.set(doc(db, 'schoolYears', id), { isDeleted: true }, { merge: true });
        });
        await batch.commit();
        setSelectedYearIds([]);
        showAlert('Đã chuyển các năm học vào thùng rác.', 'success');
      } catch (error) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };


  const handlePromoteSubmit = async () => {
    if (!promoteClassData || !promoteClassData.targetClassId) {
      showAlert('Vui lòng chọn lớp đích.', 'error');
      return;
    }
    if (promoteClassData.studentsToPromote.size === 0) {
      showAlert('Vui lòng chọn ít nhất 1 học sinh.', 'error');
      return;
    }
    try {
      const batch = writeBatch(db);
      promoteClassData.studentsToPromote.forEach(studentId => {
        batch.set(doc(db, 'students', studentId), { classId: promoteClassData.targetClassId }, { merge: true });
      });
      await batch.commit();
      showAlert('Chuyển lớp thành công.', 'success');
      setIsPromoteModalOpen(false);
      setPromoteClassData(null);
    } catch (e) {
      showAlert('Lỗi khi chuyển lớp.', 'error');
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
    const cleanUsername = (editingUser && isMasterAdmin(editingUser)) ? editingUser.username : userFormData.username.trim();

    // Check for duplicate username when creating a new user or changing username
    const isDuplicate = users.some(u => 
      u.id !== userId && 
      !u.isDeleted && 
      u.username.trim().toLowerCase() === cleanUsername.toLowerCase()
    );
    if (isDuplicate) {
      showAlert(`Tên tài khoản (mã giáo viên) "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác.`, 'error');
      return;
    }

    const isTeacher = userFormData.role === 'teacher' || userFormData.role === 'subject_teacher';
    const effectiveRole = isTeacher ? 'teacher' : userFormData.role;
    const effectiveTeacherType: 'gvcn' | 'gvbm' = isTeacher ? (userFormData.teacherType || 'gvcn') : 'gvcn';

    let homeroomClasses: string[] = [];
    let subjectClasses: string[] = [];

    if (effectiveRole === 'admin') {
      homeroomClasses = userFormData.isHomeroom ? userFormData.homeroomClasses : [];
      subjectClasses = userFormData.isSubject ? userFormData.subjectClasses.filter(cId => !homeroomClasses.includes(cId)) : [];
    } else if (isTeacher) {
      if (effectiveTeacherType === 'gvbm') {
        homeroomClasses = [];
        subjectClasses = userFormData.subjectClasses || [];
      } else {
        // GVCN
        homeroomClasses = userFormData.isHomeroom ? userFormData.homeroomClasses : [];
        subjectClasses = userFormData.isSubject ? userFormData.subjectClasses.filter(cId => !homeroomClasses.includes(cId)) : [];
      }
    }

    const userData: any = {
      id: userId,
      username: cleanUsername,
      fullName: userFormData.fullName.trim(),
      role: effectiveRole,
      subjects: isTeacher ? userFormData.subjects : [],
      homeroomClasses: homeroomClasses,
      subjectClasses: subjectClasses
    };

    if (isTeacher) {
      userData.teacherType = effectiveTeacherType;
    }

    if (effectiveRole !== 'admin') {
      const finalPermissions = { ...userFormData.permissions };
      if (effectiveTeacherType === 'gvbm') {
        finalPermissions.students = 'view';
        finalPermissions.attendance = 'edit'; // GVBM được quyền điểm danh các lớp
      }
      userData.permissions = finalPermissions;
    }

    if (userFormData.password) {
      userData.password = userFormData.password;
    } else if (editingUser && editingUser.password) {
      userData.password = editingUser.password;
    }
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, userData, { merge: true });
      showAlert(editingUser ? 'Đã cập nhật tài khoản thành công!' : 'Đã tạo tài khoản mới thành công!', 'success');
      setIsAddUserModalOpen(false);
      setEditingUser(null);
      setUserFormData({ 
        username: '', 
        password: '', 
        fullName: '', 
        role: 'teacher' as any, 
        teacherType: 'gvcn',
        isHomeroom: true, 
        isSubject: false, 
        subjects: [], 
        homeroomClasses: [], 
        subjectClasses: [],
        permissions: {
          schedule: 'edit',
          students: 'edit',
          grades: 'edit',
          weeklyPlan: 'edit',
          lunchMenu: 'view',
          attendance: 'edit'
        }
      });
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      showAlert(`Đã xảy ra lỗi khi lưu tài khoản: ${errMsg}`, 'error');
    }
  };

  const isMasterAdmin = (u?: UserAccount | null) => {
    if (!u) return false;
    return u.username?.trim().toLowerCase() === 'admin' || u.id === 'admin';
  };

  const handleDeleteSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return;
    
    const safeSelectedIds = selectedUserIds.filter(id => {
      const u = users.find(user => user.id === id);
      return u && !isMasterAdmin(u);
    });

    if (safeSelectedIds.length === 0) {
      showAlert('Không có tài khoản hợp lệ để xoá (không thể xoá tài khoản Admin quản trị hệ thống).', 'error');
      return;
    }

    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn chuyển ${safeSelectedIds.length} tài khoản đã chọn vào thùng rác?`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        safeSelectedIds.forEach(id => {
          const docRef = doc(db, 'users', id);
          batch.set(docRef, { isDeleted: true }, { merge: true });
        });
        await batch.commit();
        setSelectedUserIds([]);
        showAlert('Đã chuyển các tài khoản vào thùng rác.', 'success');
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản hàng loạt:', error);
        showAlert(`Lỗi xóa TK: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && isMasterAdmin(targetUser)) {
      showAlert('Tài khoản Admin quản trị hệ thống là cố định, không thể xóa.', 'error');
      return;
    }

    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn chuyển tài khoản ${targetUser?.fullName ? `"${targetUser.fullName}"` : 'này'} vào thùng rác?`);
    if (isConfirmed) {
      try {
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, { isDeleted: true }, { merge: true });
        showAlert('Đã chuyển tài khoản vào thùng rác.', 'success');
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        showAlert(`Lỗi xóa TK: ${error instanceof Error ? error.message : JSON.stringify(error)}`, 'error');
      }
    }
  };

  const openEditUserModal = (u: UserAccount) => {
    setEditingUser(u);
    const teacherType = getUserTeacherType(u);
    const homeroomClasses = u.homeroomClasses || [];
    const subjectClasses = (u.subjectClasses || []).filter(cId => !homeroomClasses.includes(cId));
    setUserFormData({ 
      username: u.username, 
      password: '', 
      fullName: u.fullName, 
      role: (u.role === 'subject_teacher' ? 'teacher' : u.role) as any, 
      teacherType: teacherType,
      isHomeroom: teacherType === 'gvcn', 
      isSubject: teacherType === 'gvbm' || !!subjectClasses.length, 
      subjects: u.subjects || [], 
      homeroomClasses: homeroomClasses, 
      subjectClasses: subjectClasses,
      permissions: {
        schedule: u.permissions?.schedule || (u.role === 'staff' || teacherType === 'gvbm' ? 'view' : 'edit'),
        students: u.permissions?.students || (u.role === 'staff' || teacherType === 'gvbm' ? 'view' : 'edit'),
        grades: u.permissions?.grades || (u.role === 'staff' || teacherType === 'gvbm' ? 'view' : 'edit'),
        weeklyPlan: u.permissions?.weeklyPlan || (u.role === 'staff' || teacherType === 'gvbm' ? 'view' : 'edit'),
        lunchMenu: u.role === 'staff' ? (u.permissions?.lunchMenu || 'edit') : 'view',
        attendance: u.permissions?.attendance || 'edit'
      }
    });
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
            role: roleRaw === 'admin' ? 'admin' : roleRaw === 'staff' ? 'staff' : 'teacher',
            isHomeroom: false,
            isSubject: false,
            homeroomClasses: [],
            subjectClasses: [],
            subjects: []
          };
          
          await setDoc(doc(db, 'users', userData.id), userData);
          successCount++;
        }
        
        showAlert(`Đã nhập thành công ${successCount} tài khoản mới!`, 'success');
        if (fileInputRefUsers.current) fileInputRefUsers.current.value = '';
      } catch (err) {
        console.error(err);
        showAlert('Có lỗi xảy ra khi đọc file Excel.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserFormData({ 
      username: '', 
      password: '', 
      fullName: '', 
      role: 'teacher' as any, 
      teacherType: 'gvcn',
      isHomeroom: true, 
      isSubject: false, 
      subjects: [], 
      homeroomClasses: [], 
      subjectClasses: [],
      permissions: {
        schedule: 'edit',
        students: 'edit',
        grades: 'edit',
        weeklyPlan: 'edit',
        lunchMenu: 'view',
        attendance: 'edit'
      }
    });
    setIsAddUserModalOpen(true);
  };

  const activeUsers = users.filter(u => !u.isDeleted);
  const deletedUsers = users.filter(u => u.isDeleted);
  const filteredUsers = activeUsers.filter(u => 
    (u.username || '').toLowerCase().includes((userSearchTerm || '').toLowerCase()) || 
    (u.fullName || '').toLowerCase().includes((userSearchTerm || '').toLowerCase())
  );

  return (
    <div className="h-full bg-[#f0fdfa]/30 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-teal-100 pb-2">
          <button 
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'classes' ? 'bg-teal-gradient text-white shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'}`}
          >
            <Building2 className="w-4 h-4" /> Lớp học
          </button>
          <button 
            onClick={() => setActiveTab('school_years')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'school_years' ? 'bg-teal-gradient text-white shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'}`}
          >
            <Calendar className="w-4 h-4" /> Năm học
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-teal-gradient text-white shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'}`}
          >
            <Shield className="w-4 h-4" /> Tài khoản & Quyền
          </button>
          <button 
            onClick={() => setActiveTab('system_config')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${(activeTab === 'system_config' || activeTab === 'settings' || activeTab === 'backup' || activeTab === 'ai_config' || activeTab === 'firebase') ? 'bg-teal-gradient text-white shadow-xs' : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'}`}
          >
            <Settings className="w-4 h-4" /> Cấu hình hệ thống
          </button>
        </div>

        {activeTab === 'classes' && (
          <>

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

            <div className="flex items-center gap-3 flex-wrap justify-end">
              {selectedClassIds.length > 0 && (
                <button 
                  onClick={handleDeleteSelectedClasses}
                  className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                >
                  <Trash2 className="w-4 h-4" /> Xóa {selectedClassIds.length} lớp
                </button>
              )}
              <button 
                onClick={() => setIsClassTrashModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Thùng rác ({deletedClasses.length})
              </button>
              <button 
                onClick={handleExportTemplate}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> Tải mẫu Excel
              </button>
              <button 
                onClick={() => document.getElementById('upload-classes-file')?.click()}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" /> Nhập Excel
              </button>
              <input type="file" id="upload-classes-file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
              <button 
                onClick={() => {
                  setEditingClass(null);
                  setFormData({ name: '', homeroomTeacher: '', schoolYearId: classFilterYear || (schoolYears[0]?.id || ''), specialization: '' });
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Thêm Lớp
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedClassIds.length > 0 && filteredClasses.length > 0 && selectedClassIds.length === filteredClasses.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedClassIds(filteredClasses.map(c => c.id));
                        else setSelectedClassIds([]);
                      }}
                    />
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 whitespace-nowrap">Tên Lớp</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">GVCN</th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center whitespace-nowrap">Phân ban</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center whitespace-nowrap">Sĩ số</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu lớp học
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(c => {
                    const studentCount = students.filter(s => s.classId === c.id).length;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-50 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedClassIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedClassIds([...selectedClassIds, c.id]);
                              else setSelectedClassIds(selectedClassIds.filter(id => id !== c.id));
                            }}
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-50 whitespace-nowrap">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">{c.name}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs sm:text-sm shrink-0">
                              {c.homeroomTeacher ? c.homeroomTeacher.charAt(0) : '?'}
                            </div>
                            <span className="font-medium text-slate-700 text-xs sm:text-sm leading-snug">{c.homeroomTeacher || 'Chưa có'}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-2.5 sm:py-4 border-b border-slate-50 text-center whitespace-nowrap">
                          {c.specialization ? (
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${c.specialization === 'Tự Nhiên' ? 'bg-blue-100 text-blue-700' : c.specialization === 'Xã Hội' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                              {c.specialization}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs sm:text-sm">Cơ Bản</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-6 py-2.5 sm:py-4 border-b border-slate-50 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs sm:text-sm">
                            {studentCount} hs
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-50 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteClass(c.id)}
                              className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Chuyển vào thùng rác"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
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
                              className="p-1.5 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Lên lớp / Chuyển lớp"
                            >
                              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(c)}
                              className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Sửa lớp"
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
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
        </>
        )}

        
        {activeTab === 'school_years' && (
          <>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-800">Quản lý Năm học</h1>
                <p className="text-slate-500 mt-1">Danh sách các năm học trong hệ thống</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedYearIds.length > 0 && (
                  <button 
                    onClick={handleDeleteSelectedYears}
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa {selectedYearIds.length} năm học
                  </button>
                )}
                <button 
                  onClick={() => setIsYearTrashModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Thùng rác ({deletedYears.length})
                </button>
                <button 
                  onClick={() => { setEditingYear(null); setYearFormData({ name: '' }); setIsAddYearModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm Năm học
                </button>
              </div>
            </div>

            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead>

                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selectedYearIds.length > 0 && activeYears.length > 0 && selectedYearIds.length === activeYears.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedYearIds(activeYears.map(y => y.id));
                          else setSelectedYearIds([]);
                        }}
                      />
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>

                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Số lượng Lớp</th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {activeYears.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Chưa có năm học nào</td>
                    </tr>
                  ) : (
                    activeYears.map(y => {
                      const classCount = classes.filter(c => c.schoolYearId === y.id).length;
                      return (

                        <tr key={y.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedYearIds.includes(y.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedYearIds([...selectedYearIds, y.id]);
                                else setSelectedYearIds(selectedYearIds.filter(id => id !== y.id));
                              }}
                            />
                          </td>
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
                                title="Chuyển vào thùng rác"
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
                {/* Nút gán mã tự động tạm ẩn do trường sử dụng mã CSDL Ngành
                <button 
                  onClick={handleSortAndGenerateStudentIDs}
                  className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
                  title="Tự động xếp Mã Học Sinh toàn trường theo A-Z (Ví dụ: 26270001)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Sắp xếp mã học sinh
                </button>
*/}
                <button 
                  onClick={openAddUserModal}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Thêm
                </button>
                <button 
                  onClick={() => setIsTrashModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Thùng rác ({deletedUsers.length})
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
                {selectedUserIds.length > 0 && (
                  <button 
                    onClick={handleDeleteSelectedUsers}
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa {selectedUserIds.length} tài khoản
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedUserIds.length > 0 && filteredUsers.filter(u => !isMasterAdmin(u)).length > 0 && selectedUserIds.length === filteredUsers.filter(u => !isMasterAdmin(u)).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                                const ids = filteredUsers.filter(u => !isMasterAdmin(u)).map(u => u.id);
                                setSelectedUserIds(ids);
                            } else {
                                setSelectedUserIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 whitespace-nowrap">Mã GV (Tài khoản)</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 whitespace-nowrap">Tên hiển thị</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 whitespace-nowrap text-center">Phân quyền</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 min-w-[220px]">Lớp phân công</th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          Không tìm thấy tài khoản
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={`${u.id}-${Math.random()}`} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                              disabled={isMasterAdmin(u)}
                              checked={selectedUserIds.includes(u.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds([...selectedUserIds, u.id]);
                                } else {
                                  setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 whitespace-nowrap">
                            <span className="font-bold text-slate-800 font-mono">{u.username}</span>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                {(u.fullName || 'U').charAt(0)}
                              </div>
                              <span className="font-medium text-slate-700">{u.fullName || 'Chưa cập nhật'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 whitespace-nowrap text-center">
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap bg-purple-50 text-purple-700 border border-purple-200">
                                Ban Giám Hiệu
                              </span>
                            ) : u.role === 'staff' ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">
                                Giáo vụ
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200">
                                Giáo viên
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50">
                            {(u.role === 'teacher' || u.role === 'admin') && (
                              <div className="text-sm text-slate-600">
                                {u.homeroomClasses && u.homeroomClasses.length > 0 && (
                                  <div className="mb-1"><span className="font-semibold text-indigo-600">GVCN:</span> {u.homeroomClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ')}</div>
                                )}
                                {u.subjectClasses && u.subjectClasses.length > 0 && (
                                  <div><span className="font-semibold text-emerald-600">GVBM:</span> {u.subjectClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ')}</div>
                                )}
                                {(!u.homeroomClasses?.length && !u.subjectClasses?.length) && (u.role === 'teacher' ? <span className="text-slate-400 italic">Chưa phân công</span> : null)}
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
                                disabled={isMasterAdmin(u)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isMasterAdmin(u) ? 'Tài khoản Admin quản trị hệ thống không thể xóa' : 'Chuyển vào thùng rác'}
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
            
            {/* Phụ huynh codes (Interactive list & Excel Export by Class) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
              {/* Header with Title & Excel Export */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                      <Key className="w-5 h-5 text-teal-700" />
                      <span>Mã truy cập Phụ huynh</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Cổng Phụ Huynh
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Quản lý mã định danh và mật khẩu đăng nhập của từng học sinh theo lớp
                  </p>
                </div>

                {/* Nút Xuất file Excel theo lớp */}
                <button
                  type="button"
                  onClick={handleExportParentAccessExcel}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                  title="Xuất file Excel theo lớp: STT | Lớp | Mã định danh | Họ và tên | Mật khẩu"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
                  <span>
                    {parentAccessClassId === 'all'
                      ? 'Xuất Excel tất cả các lớp'
                      : `Xuất Excel lớp ${classes.find(c => c.id === parentAccessClassId)?.name || ''}`}
                  </span>
                  <span className="bg-emerald-700/80 px-2 py-0.5 rounded-md text-xs font-mono font-bold text-emerald-100">
                    {parentAccessClassId === 'all'
                      ? students.filter(s => !s.isDeleted).length
                      : students.filter(s => !s.isDeleted && s.classId === parentAccessClassId).length} HS
                  </span>
                </button>
              </div>

              {/* Menu tùy chọn hiển thị dữ liệu theo lớp & Thanh tìm kiếm */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Menu chọn Lớp */}
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                    <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <label htmlFor="parent-access-class-menu" className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                      Xem theo lớp:
                    </label>
                    <select
                      id="parent-access-class-menu"
                      value={parentAccessClassId}
                      onChange={e => setParentAccessClassId(e.target.value)}
                      className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="all">
                        Tất cả các lớp ({students.filter(s => !s.isDeleted).length} HS)
                      </option>
                      {activeClasses.map(c => {
                        const count = students.filter(s => !s.isDeleted && s.classId === c.id).length;
                        return (
                          <option key={c.id} value={c.id}>
                            Lớp {c.name} ({count} học sinh)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Badge số lượng hiển thị */}
                  <span className="text-xs font-medium text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                    Đang hiển thị: <strong className="text-teal-700 font-bold">{parentAccessStudents.length}</strong> học sinh
                  </span>
                </div>

                {/* Ô tìm kiếm & Chuyển chế độ xem */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={parentAccessSearch}
                      onChange={e => setParentAccessSearch(e.target.value)}
                      placeholder="Tìm tên HS, mã định danh..."
                      className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    />
                    {parentAccessSearch && (
                      <button
                        onClick={() => setParentAccessSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Toggle chế độ xem: Bảng / Thẻ */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setParentAccessViewMode('table')}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                        parentAccessViewMode === 'table'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Hiển thị dạng Bảng chi tiết"
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentAccessViewMode('cards')}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                        parentAccessViewMode === 'cards'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Hiển thị dạng Thẻ"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hướng dẫn & Định dạng xuất Excel */}
              <div className="p-4 sm:p-5">
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-900">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <Key className="w-4 h-4 text-teal-700 shrink-0 mt-0.5 sm:mt-0" />
                    <span>
                      Phụ huynh đăng nhập tại Cổng Phụ huynh bằng <strong>Mã định danh</strong> (Mã HS hoặc TênLớp-STT) và <strong>Mật khẩu</strong> mặc định: <strong className="font-mono text-teal-800 bg-white px-1.5 py-0.5 rounded border border-teal-200">12345678</strong>.
                    </span>
                  </div>
                  <div className="text-slate-600 shrink-0 flex items-center gap-1.5">
                    <span className="font-medium">Cấu trúc Excel:</span>
                    <span className="font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                      STT | Lớp | Mã định danh | Họ và tên | Mật khẩu
                    </span>
                  </div>
                </div>

                {/* Danh sách học sinh: Dạng Bảng */}
                {parentAccessViewMode === 'table' ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <th className="py-3 px-4 font-bold text-center w-16 whitespace-nowrap bg-slate-50">STT</th>
                            <th className="py-3 px-4 font-bold text-center w-28 whitespace-nowrap bg-slate-50">Lớp</th>
                            <th className="py-3 px-4 font-bold whitespace-nowrap bg-slate-50">Mã định danh</th>
                            <th className="py-3 px-4 font-bold whitespace-nowrap bg-slate-50 min-w-[200px]">Họ và tên</th>
                            <th className="py-3 px-4 font-bold text-center w-36 whitespace-nowrap bg-slate-50">Mật khẩu</th>
                            <th className="py-3 px-4 font-bold text-right whitespace-nowrap bg-slate-50 w-32">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parentAccessStudents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-10 text-center text-slate-500">
                                <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="font-medium">Không tìm thấy học sinh nào phù hợp.</p>
                                {(parentAccessClassId !== 'all' || parentAccessSearch) && (
                                  <button
                                    onClick={() => { setParentAccessClassId('all'); setParentAccessSearch(''); }}
                                    className="mt-2 text-xs text-teal-700 hover:underline font-semibold"
                                  >
                                    Xem tất cả các lớp
                                  </button>
                                )}
                              </td>
                            </tr>
                          ) : (
                            parentAccessStudents.map((student, idx) => {
                              const studentClass = classes.find(c => c.id === student.classId);
                              const className = studentClass ? studentClass.name : 'Chưa xếp';
                              const code = student.code || (studentClass ? `${studentClass.name}-${student.stt.toString().padStart(3, '0')}` : `HS-${student.stt}`);
                              const password = (student as any).password || '12345678';
                              const isCopied = parentAccessCopiedId === student.id;

                              return (
                                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-3 px-4 text-center font-medium text-slate-500">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      {className}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <span className="inline-flex items-center font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                                      {code}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                                        {(student.fullName || 'H').charAt(0)}
                                      </div>
                                      <span className="font-semibold text-slate-800 whitespace-nowrap">
                                        {student.fullName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center font-mono text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
                                      {password}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyAccessInfo(student)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                        isCopied
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-200'
                                      }`}
                                      title="Sao chép tên, mã định danh và mật khẩu"
                                    >
                                      {isCopied ? (
                                        <>
                                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Đã chép</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Sao chép</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Danh sách học sinh: Dạng Thẻ */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {parentAccessStudents.length === 0 ? (
                      <div className="col-span-full py-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium">Không tìm thấy học sinh nào phù hợp.</p>
                      </div>
                    ) : (
                      parentAccessStudents.map((student, idx) => {
                        const studentClass = classes.find(c => c.id === student.classId);
                        const className = studentClass ? studentClass.name : 'Chưa xếp';
                        const code = student.code || (studentClass ? `${studentClass.name}-${student.stt.toString().padStart(3, '0')}` : `HS-${student.stt}`);
                        const password = (student as any).password || '12345678';
                        const isCopied = parentAccessCopiedId === student.id;

                        return (
                          <div
                            key={student.id}
                            className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-2xs hover:shadow-xs hover:border-teal-200 transition-all flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate">
                                    {student.fullName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Lớp: <span className="font-semibold text-indigo-700">{className}</span>
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                                {code}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                MK: <strong className="font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{password}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAccessInfo(student)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                  isCopied
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Sao chép</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {(activeTab === 'system_config' || activeTab === 'settings' || activeTab === 'backup' || activeTab === 'ai_config' || activeTab === 'firebase') && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-teal-100">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-[#0f766e]" />
                  Cấu hình hệ thống
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Quản lý giao diện, sao lưu dự phòng, trợ lý AI và kết nối đám mây của nhà trường
                </p>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="bg-white p-1.5 rounded-2xl border border-teal-100 shadow-2xs flex flex-wrap gap-1.5 items-center">
              <button
                onClick={() => setConfigSubTab('settings')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  configSubTab === 'settings'
                    ? 'bg-teal-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" /> Giao diện & Logo
              </button>
              <button
                onClick={() => setConfigSubTab('backup')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  configSubTab === 'backup'
                    ? 'bg-teal-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'
                }`}
              >
                <Database className="w-4 h-4" /> Sao lưu dữ liệu
              </button>
              <button
                onClick={() => setConfigSubTab('ai_config')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  configSubTab === 'ai_config'
                    ? 'bg-teal-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Trợ lý AI
              </button>
              <button
                onClick={() => setConfigSubTab('firebase')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  configSubTab === 'firebase'
                    ? 'bg-teal-gradient text-white shadow-xs'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-[#f0fdfa]'
                }`}
              >
                <Cloud className="w-4 h-4" /> Đám mây
              </button>
            </div>

            {/* Sub-tab 1: Giao diện & Logo */}
            {configSubTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-[#0f766e]" />
                      Cấu hình Giao diện & Thương hiệu
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Tùy biến tên trường, logo và hình nền. Tự động đồng bộ lên Firebase khi lưu.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {lastSavedTime && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Đã đồng bộ Firebase ({lastSavedTime})
                      </span>
                    )}
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="px-4 py-2 bg-teal-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs disabled:opacity-50 text-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingSettings ? 'Đang lưu & Đồng bộ...' : 'Lưu Cấu hình'}
                    </button>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Ứng dụng (Page Title)</label>
                    <input
                      type="text"
                      value={appSettings.pageTitle}
                      onChange={(e) => setAppSettings({ ...appSettings, pageTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                      placeholder="Trường Phổ Thông Duy Tân"
                    />
                    <p className="text-xs text-slate-500 mt-1">Sẽ hiển thị ở tiêu đề trang (thẻ browser).</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Hiển thị (Login/DuyTan School Manager)</label>
                    <input
                      type="text"
                      value={appSettings.appName}
                      onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                      placeholder="Trường Phổ Thông Duy Tân"
                    />
                    <p className="text-xs text-slate-500 mt-1">Sẽ hiển thị ở trang đăng nhập thay cho EduManage Pro.</p>
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-[#f0fdfa] p-4 rounded-xl flex items-center justify-between border border-teal-100">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Tắt trang Portal (Vào thẳng trang đăng nhập)</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Khi bật tính năng này, hệ thống sẽ bỏ qua trang Portal giới thiệu và đi thẳng vào giao diện đăng nhập.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={appSettings.disablePortal || false}
                        onChange={(e) => setAppSettings({ ...appSettings, disablePortal: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f766e]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hình nền Giao diện Portal (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appSettings.portalBackground}
                        onChange={(e) => setAppSettings({ ...appSettings, portalBackground: e.target.value })}
                        className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                        placeholder="Nhập URL hoặc tải ảnh lên"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm" title="Tải ảnh lên">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Tải lên</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'portalBackground')} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">URL hình ảnh nền cho trang Portal.</p>
                    {appSettings.portalBackground && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                        <img src={appSettings.portalBackground} alt="Preview Portal Background" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAppSettings(prev => ({ ...prev, portalBackground: '' }))}
                          className="absolute top-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Xóa ảnh
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon Tiêu đề (Favicon URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appSettings.pageIcon}
                        onChange={(e) => setAppSettings({ ...appSettings, pageIcon: e.target.value })}
                        className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                        placeholder="Nhập URL hoặc tải ảnh lên"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm" title="Tải ảnh lên">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Tải lên</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'pageIcon')} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">URL hình ảnh nhỏ trên thẻ trình duyệt.</p>
                    {appSettings.pageIcon && (
                      <div className="mt-2 flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <img src={appSettings.pageIcon} alt="Preview Icon" className="w-8 h-8 rounded object-contain border border-slate-300 bg-white" />
                        <span className="text-xs text-slate-600 font-medium">Xem trước Icon browser</span>
                        <button
                          type="button"
                          onClick={() => setAppSettings(prev => ({ ...prev, pageIcon: '' }))}
                          className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo Giao diện Portal (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appSettings.portalLogo}
                        onChange={(e) => setAppSettings({ ...appSettings, portalLogo: e.target.value })}
                        className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                        placeholder="Nhập URL hoặc tải ảnh lên"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm" title="Tải ảnh lên">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Tải lên</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'portalLogo')} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sẽ thay thế icon cái mũ ở trang Portal.</p>
                    {appSettings.portalLogo && (
                      <div className="mt-2 flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <img src={appSettings.portalLogo} alt="Preview Portal Logo" className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 bg-white" />
                        <span className="text-xs text-slate-600 font-medium">Xem trước Logo Portal</span>
                        <button
                          type="button"
                          onClick={() => setAppSettings(prev => ({ ...prev, portalLogo: '' }))}
                          className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo Trang Đăng nhập (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appSettings.loginLogo}
                        onChange={(e) => setAppSettings({ ...appSettings, loginLogo: e.target.value })}
                        className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                        placeholder="Nhập URL hoặc tải ảnh lên"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm" title="Tải ảnh lên">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Tải lên</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'loginLogo')} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sẽ thay thế icon cái mũ ở trang Đăng nhập.</p>
                    {appSettings.loginLogo && (
                      <div className="mt-2 flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <img src={appSettings.loginLogo} alt="Preview Login Logo" className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 bg-white" />
                        <span className="text-xs text-slate-600 font-medium">Xem trước Logo Đăng nhập</span>
                        <button
                          type="button"
                          onClick={() => setAppSettings(prev => ({ ...prev, loginLogo: '' }))}
                          className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hình nền Trang Đăng nhập (URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appSettings.loginBackground}
                        onChange={(e) => setAppSettings({ ...appSettings, loginBackground: e.target.value })}
                        className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-[#0f766e] text-sm"
                        placeholder="Nhập URL hoặc tải ảnh lên"
                      />
                      <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm" title="Tải ảnh lên">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Tải lên</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'loginBackground')} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">URL hình ảnh nền cho trang Đăng nhập.</p>
                    {appSettings.loginBackground && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                        <img src={appSettings.loginBackground} alt="Preview Login Background" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAppSettings(prev => ({ ...prev, loginBackground: '' }))}
                          className="absolute top-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Xóa ảnh
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Sao lưu dữ liệu */}
            {configSubTab === 'backup' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-teal-50 text-[#0f766e] rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
                  <Database className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Tạo bản sao lưu dữ liệu</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm">
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
                    className="px-6 py-3 bg-teal-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs text-sm"
                  >
                    <Download className="w-5 h-5" /> Tải xuống bản sao lưu
                  </button>
                  
                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs text-sm"
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
            )}

            {/* Sub-tab 3: Trợ lý AI */}
            {configSubTab === 'ai_config' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Cấu hình Trợ Lý AI</h2>
                    <p className="text-slate-500 text-xs sm:text-sm">Định hướng phong cách và cung cấp thông tin chuẩn của nhà trường để AI hỗ trợ giáo viên tốt nhất.</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-800 mb-1">Thông tin nền của Nhà trường</label>
                  <p className="text-slate-500 text-xs mb-3">Nhập Fanpage, Số điện thoại, các khóa học kỹ năng, hoặc triết lý giáo dục để Trợ lý AI tự động lồng ghép vào lời nhận xét.</p>
                  <textarea
                    className="w-full h-52 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-[#0f766e] resize-none transition-all text-slate-700 text-sm leading-relaxed"
                    value={aiConfigText}
                    onChange={(e) => setAiConfigText(e.target.value)}
                    placeholder="Ví dụ: Trường Phổ Thông Duy Tân. Slogan: 'Vươn tầm tri thức'. Hotlines: 0901234567..."
                  />
                </div>
                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <button
                    onClick={() => {
                      localStorage.setItem('aiAdminConfig', aiConfigText);
                      showAlert('Cập nhật cấu hình Trợ lý AI thành công!', 'success');
                    }}
                    className="px-6 py-2.5 bg-teal-gradient hover:opacity-90 text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" /> Lưu Cấu Hình
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Đám mây Firebase */}
            {configSubTab === 'firebase' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start gap-4 mb-6 p-4 bg-teal-50 text-teal-900 rounded-xl border border-teal-100">
                  <Server className="w-6 h-6 shrink-0 mt-1 text-[#0f766e]" />
                  <div>
                    <h3 className="font-bold mb-1">Tại sao cần cấu hình Firebase riêng?</h3>
                    <p className="text-xs sm:text-sm text-teal-800/90 leading-relaxed">
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
                      placeholder={'{\n  "apiKey": "AIzaSy...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-app",\n  ...\n}'}
                      className="w-full h-44 p-4 font-mono text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={async () => {
                        if (!firebaseConfigStr.trim()) {
                          try {
                            await deleteDoc(doc(defaultDb, 'system', 'firebaseConfig'));
                          } catch(e) {}
                          localStorage.removeItem('customFirebaseConfig');
                          showAlert('Đã xóa cấu hình riêng. Đang quay lại cơ sở dữ liệu mặc định...', 'success');
                          setTimeout(() => window.location.reload(), 1500);
                          return;
                        }
                        
                        try {
                          JSON.parse(firebaseConfigStr);
                          await setDoc(doc(defaultDb, 'system', 'firebaseConfig'), { configStr: firebaseConfigStr });
                          localStorage.setItem('customFirebaseConfig', firebaseConfigStr);
                          showAlert('Lưu cấu hình thành công cho toàn hệ thống. Đang khởi động lại...', 'success');
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (e) {
                          console.error(e);
                          showAlert('Lỗi: JSON cấu hình không hợp lệ hoặc không có quyền lưu.', 'error');
                        }
                      }}
                      className="px-5 py-2.5 bg-teal-gradient text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs text-sm"
                    >
                      <Save className="w-4 h-4" /> Lưu và Khởi động lại
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await deleteDoc(doc(defaultDb, 'system', 'firebaseConfig'));
                        } catch (e) { console.error(e) }
                        setFirebaseConfigStr('');
                        localStorage.removeItem('customFirebaseConfig');
                        showAlert('Đã trở về cấu hình mặc định cho toàn hệ thống.', 'info');
                        setTimeout(() => window.location.reload(), 1500);
                      }}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
                    >
                      Dùng cấu hình mặc định
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">{editingUser ? 'Sửa Tài khoản' : 'Thêm Tài khoản mới'}</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Giáo viên (Tài khoản đăng nhập) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={userFormData.username}
                  onChange={e => setUserFormData({...userFormData, username: e.target.value})}
                  disabled={isMasterAdmin(editingUser)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  placeholder="Ví dụ: teacher_abc"
                />
                {isMasterAdmin(editingUser) && (
                  <p className="text-xs text-slate-400 mt-1">Tài khoản Admin quản trị viên hệ thống có tên đăng nhập cố định.</p>
                )}
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
                  value={userFormData.role === 'subject_teacher' ? 'teacher' : userFormData.role}
                  onChange={e => {
                    const newRole = e.target.value as 'admin' | 'teacher' | 'staff';
                    if (newRole === 'teacher') {
                      const tType = userFormData.teacherType || 'gvcn';
                      setUserFormData({
                        ...userFormData,
                        role: 'teacher',
                        teacherType: tType,
                        isHomeroom: tType === 'gvcn',
                        isSubject: tType === 'gvbm' ? true : userFormData.isSubject,
                        permissions: {
                          schedule: tType === 'gvbm' ? 'view' : 'edit',
                          students: tType === 'gvbm' ? 'view' : 'edit',
                          grades: tType === 'gvbm' ? 'view' : 'edit',
                          weeklyPlan: tType === 'gvbm' ? 'view' : 'edit',
                          lunchMenu: 'view',
                          attendance: 'edit'
                        }
                      });
                    } else {
                      setUserFormData({
                        ...userFormData,
                        role: newRole
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-800"
                >
                  <option value="teacher">Giáo viên</option>
                  <option value="staff">Giáo vụ</option>
                  <option value="admin">Ban Giám Hiệu (Admin)</option>
                </select>
              </div>

              {/* 2 vai trò nhỏ của Giáo viên: GVCN và GVBM */}
              {(userFormData.role === 'teacher' || userFormData.role === 'subject_teacher') && (
                <div className="col-span-1 bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Vai trò cụ thể của Giáo viên <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {userFormData.teacherType === 'gvbm' ? 'Chế độ GV Bộ môn' : 'Chế độ GV Chủ nhiệm'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: GVCN */}
                    <div 
                      onClick={() => {
                        setUserFormData(prev => ({
                          ...prev,
                          teacherType: 'gvcn',
                          isHomeroom: true,
                          permissions: {
                            schedule: 'edit',
                            students: 'edit',
                            grades: 'edit',
                            weeklyPlan: 'edit',
                            lunchMenu: 'view',
                            attendance: 'edit'
                          }
                        }));
                      }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        userFormData.teacherType !== 'gvbm'
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="teacherType"
                          checked={userFormData.teacherType !== 'gvbm'}
                          onChange={() => {}}
                          className="w-4 h-4 text-teal-700 focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="font-bold text-sm text-slate-800">1. Giáo viên Chủ nhiệm (GVCN)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-6 leading-relaxed">
                        Quản lý lớp chủ nhiệm của mình. Toàn quyền quản lý học sinh, kế hoạch tuần, nhận xét và điểm danh lớp mình.
                      </p>
                    </div>

                    {/* Option 2: GVBM */}
                    <div 
                      onClick={() => {
                        setUserFormData(prev => ({
                          ...prev,
                          teacherType: 'gvbm',
                          isHomeroom: false,
                          isSubject: true,
                          homeroomClasses: [],
                          permissions: {
                            schedule: 'view',
                            students: 'view',
                            grades: 'view',
                            weeklyPlan: 'view',
                            lunchMenu: 'view',
                            attendance: 'edit' // GVBM được quyền điểm danh các lớp
                          }
                        }));
                      }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        userFormData.teacherType === 'gvbm'
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="teacherType"
                          checked={userFormData.teacherType === 'gvbm'}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="font-bold text-sm text-slate-800">2. Giáo viên Bộ môn (GVBM)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-6 leading-relaxed">
                        Chỉ xem thông tin các lớp học cần xem. <strong>Được quyền điểm danh các lớp</strong> giảng dạy; không được sửa/xóa hồ sơ học sinh.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {userFormData.role !== 'admin' && (
                <div className="col-span-1 border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span>Phân quyền chi tiết chức năng</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {userFormData.role === 'teacher' && userFormData.teacherType === 'gvbm' ? (
                          <span className="text-indigo-700 font-medium">
                            Quy tắc GVBM: Xem hồ sơ học sinh & lịch học. Được quyền điểm danh các lớp phụ trách; khóa quyền sửa/xóa học sinh.
                          </span>
                        ) : (
                          'Thiết lập quyền "Chỉ xem" hoặc "Toàn quyền / Sửa đổi" cho từng phân hệ (BGH Admin giữ nguyên toàn quyền)'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
                    {[
                      { key: 'schedule', label: '1. Thời khóa biểu & Lịch học' },
                      { key: 'students', label: '2. Danh sách học sinh & Hồ sơ' },
                      { key: 'grades', label: '3. Bảng điểm & Đánh giá' },
                      { key: 'weeklyPlan', label: '4. Kế hoạch tuần & Phê duyệt' },
                      { key: 'lunchMenu', label: '5. Thực đơn bán trú & Duyệt' },
                      { key: 'attendance', label: '6. Điểm danh chuyên cần' }
                    ].map(({ key, label }) => {
                      const isLunchForTeacher = key === 'lunchMenu' && userFormData.role !== 'staff';
                      const isGVBM = userFormData.role === 'teacher' && userFormData.teacherType === 'gvbm';
                      const currentVal = isLunchForTeacher ? 'view' : (userFormData.permissions?.[key as keyof UserPermissions] || 'edit');
                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700">{label}</span>
                            {isLunchForTeacher && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">Chỉ BGH & Giáo vụ</span>
                            )}
                            {isGVBM && key === 'attendance' && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">GVBM được quyền điểm danh</span>
                            )}
                            {isGVBM && key === 'students' && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Chỉ xem (khóa sửa/xóa)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                              <input 
                                type="radio" 
                                name={`perm_${key}`}
                                value="view"
                                checked={currentVal === 'view'}
                                onChange={() => setUserFormData({
                                  ...userFormData,
                                  permissions: { ...userFormData.permissions, [key]: 'view' }
                                })}
                                className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                              <span className={currentVal === 'view' ? 'font-medium text-amber-700' : 'text-slate-600'}>
                                Chỉ xem
                              </span>
                            </label>
                            <label className={`flex items-center gap-1.5 text-xs ${isLunchForTeacher ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                              <input 
                                type="radio" 
                                name={`perm_${key}`}
                                value="edit"
                                disabled={isLunchForTeacher}
                                checked={currentVal === 'edit'}
                                onChange={() => !isLunchForTeacher && setUserFormData({
                                  ...userFormData,
                                  permissions: { ...userFormData.permissions, [key]: 'edit' }
                                })}
                                className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed cursor-pointer"
                              />
                              <span className={currentVal === 'edit' ? 'font-medium text-indigo-700' : 'text-slate-600'}>
                                Sửa đổi / Đầy đủ
                              </span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(userFormData.role === 'teacher' || userFormData.role === 'admin' || userFormData.role === 'subject_teacher') && (
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
                  
                  {/* Phân công lớp Chủ nhiệm (Chỉ dành cho GVCN hoặc Admin) */}
                  {userFormData.teacherType !== 'gvbm' && (
                    <div className="bg-white border border-teal-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 mb-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={userFormData.isHomeroom} 
                            onChange={e => {
                              const isChecked = e.target.checked;
                              setUserFormData(prev => ({
                                ...prev, 
                                isHomeroom: isChecked,
                                subjectClasses: isChecked 
                                  ? prev.subjectClasses.filter(cId => !prev.homeroomClasses.includes(cId))
                                  : prev.subjectClasses
                              }));
                            }}
                            className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-teal-700" />
                            <span>1. Lớp Chủ nhiệm (GVCN)</span>
                          </span>
                        </label>

                        {userFormData.isHomeroom && (
                          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                            Chế độ Giáo viên Chủ nhiệm
                          </span>
                        )}
                      </div>

                      {userFormData.isHomeroom && (
                        <ClassAssignmentPicker
                          title="Danh sách chọn Lớp Chủ nhiệm"
                          subtitle="Chọn một hoặc nhiều lớp học mà giáo viên này làm chủ nhiệm. Giáo viên sẽ có toàn quyền quản lý lớp."
                          badgeLabel="GVCN"
                          classes={classes.filter(c => !userAssignmentYear || c.schoolYearId === userAssignmentYear)}
                          selectedClassIds={userFormData.homeroomClasses}
                          onChange={(newHomeroom) => {
                            setUserFormData(prev => ({
                              ...prev,
                              homeroomClasses: newHomeroom,
                              subjectClasses: prev.subjectClasses.filter(cId => !newHomeroom.includes(cId))
                            }));
                          }}
                          students={students}
                          accentColor="teal"
                          allowSelectAll={true}
                        />
                      )}
                    </div>
                  )}

                  {/* Phân công Môn học & Lớp giảng dạy (GVBM) */}
                  <div className="bg-white border border-indigo-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={userFormData.teacherType === 'gvbm' ? true : userFormData.isSubject} 
                          disabled={userFormData.teacherType === 'gvbm'}
                          onChange={e => setUserFormData({...userFormData, isSubject: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
                        />
                        <span className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>
                            {userFormData.teacherType === 'gvbm' 
                              ? '2. Môn học & Lớp giảng dạy (GVBM)' 
                              : '2. Giảng dạy thêm lớp khác (với vai trò GVBM)'}
                          </span>
                        </span>
                      </label>

                      <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Được quyền điểm danh các lớp này
                      </span>
                    </div>

                    {(userFormData.teacherType === 'gvbm' || userFormData.isSubject) && (
                      <div className="space-y-4 pt-1">
                        {/* Môn học phụ trách */}
                        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Môn học phụ trách ({userFormData.subjects.length} môn đã chọn)
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const allSubs = ['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'GDCD', 'Tin Học', 'Thể Dục', 'Công Nghệ', 'Âm Nhạc', 'Mỹ Thuật', 'KHTN', 'KHXH'];
                                  setUserFormData(prev => ({ ...prev, subjects: allSubs }));
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                              >
                                Chọn tất cả
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => setUserFormData(prev => ({ ...prev, subjects: [] }))}
                                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                              >
                                Bỏ chọn
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'GDCD', 'Tin Học', 'Thể Dục', 'Công Nghệ', 'Âm Nhạc', 'Mỹ Thuật', 'KHTN', 'KHXH'].map(subject => {
                              const isSubSelected = userFormData.subjects.includes(subject);
                              return (
                                <button
                                  key={subject}
                                  type="button"
                                  onClick={() => {
                                    if (isSubSelected) {
                                      setUserFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
                                    } else {
                                      setUserFormData(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
                                    }
                                  }}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-1 shadow-2xs ${
                                    isSubSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {isSubSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  <span>{subject}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* ClassAssignmentPicker for GVBM */}
                        <ClassAssignmentPicker
                          title="Danh sách chọn Lớp Giảng dạy"
                          subtitle="Chọn các lớp học giáo viên bộ môn giảng dạy. Giáo viên có quyền điểm danh chuyên cần và theo dõi học sinh các lớp này."
                          badgeLabel="GVBM"
                          classes={classes.filter(c => !userAssignmentYear || c.schoolYearId === userAssignmentYear)}
                          selectedClassIds={userFormData.subjectClasses}
                          onChange={(newSubjects) => {
                            setUserFormData(prev => ({
                              ...prev,
                              subjectClasses: newSubjects
                            }));
                          }}
                          students={students}
                          accentColor="indigo"
                          disabledClassIds={userFormData.teacherType !== 'gvbm' && userFormData.isHomeroom ? userFormData.homeroomClasses : []}
                          disabledReason="Đã là lớp GVCN"
                          allowSelectAll={true}
                        />
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

      {activeTab === 'reports' && (
        <AdminReports students={students} />
      )}

      {/* CLASS TRASH MODAL */}
      {isClassTrashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Thùng rác lớp học</h2>
                <p className="text-sm text-slate-500 mt-1">Các lớp học đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.</p>
              </div>
              <button 
                onClick={() => {
                  setIsClassTrashModalOpen(false);
                  setSelectedTrashClassIds([]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                {selectedTrashClassIds.length > 0 && (
                  <>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(`Khôi phục ${selectedTrashClassIds.length} lớp học đã chọn?`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashClassIds.forEach(id => {
                              batch.set(doc(db, 'classes', id), { isDeleted: false }, { merge: true });
                            });
                            await batch.commit();
                            setSelectedTrashClassIds([]);
                            showAlert('Đã khôi phục các lớp học.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi khôi phục.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 border border-green-200"
                    >
                      <RefreshCcw className="w-4 h-4" /> Khôi phục đã chọn
                    </button>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(`Xóa vĩnh viễn ${selectedTrashClassIds.length} lớp học? Hành động này KHÔNG THỂ hoàn tác.`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashClassIds.forEach(id => {
                              batch.delete(doc(db, 'classes', id));
                            });
                            await batch.commit();
                            setSelectedTrashClassIds([]);
                            showAlert('Đã xóa vĩnh viễn.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi xóa vĩnh viễn.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {deletedClasses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Thùng rác trống</h3>
                  <p className="text-slate-500 mt-1">Không có lớp học nào trong thùng rác.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedTrashClassIds.length > 0 && selectedTrashClassIds.length === deletedClasses.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTrashClassIds(deletedClasses.map(c => c.id));
                            else setSelectedTrashClassIds([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Lớp</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedClasses.map(c => (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedTrashClassIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashClassIds([...selectedTrashClassIds, c.id]);
                              else setSelectedTrashClassIds(selectedTrashClassIds.filter(id => id !== c.id));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{c.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await setDoc(doc(db, 'classes', c.id), { isDeleted: false }, { merge: true });
                                  showAlert('Đã khôi phục lớp học', 'success');
                                } catch(e) {}
                              }}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Khôi phục"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await showConfirm('Xóa vĩnh viễn lớp học này?');
                                if (isConfirmed) {
                                  try {
                                    await deleteDoc(doc(db, 'classes', c.id));
                                    showAlert('Đã xóa vĩnh viễn', 'success');
                                  } catch(e) {}
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* YEAR TRASH MODAL */}
      {isYearTrashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Thùng rác năm học</h2>
                <p className="text-sm text-slate-500 mt-1">Các năm học đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.</p>
              </div>
              <button 
                onClick={() => {
                  setIsYearTrashModalOpen(false);
                  setSelectedTrashYearIds([]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                {selectedTrashYearIds.length > 0 && (
                  <>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(`Khôi phục ${selectedTrashYearIds.length} năm học đã chọn?`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashYearIds.forEach(id => {
                              batch.set(doc(db, 'schoolYears', id), { isDeleted: false }, { merge: true });
                            });
                            await batch.commit();
                            setSelectedTrashYearIds([]);
                            showAlert('Đã khôi phục các năm học.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi khôi phục.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 border border-green-200"
                    >
                      <RefreshCcw className="w-4 h-4" /> Khôi phục đã chọn
                    </button>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(`Xóa vĩnh viễn ${selectedTrashYearIds.length} năm học? Hành động này KHÔNG THỂ hoàn tác.`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashYearIds.forEach(id => {
                              batch.delete(doc(db, 'schoolYears', id));
                            });
                            await batch.commit();
                            setSelectedTrashYearIds([]);
                            showAlert('Đã xóa vĩnh viễn.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi xóa vĩnh viễn.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {deletedYears.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Thùng rác trống</h3>
                  <p className="text-slate-500 mt-1">Không có năm học nào trong thùng rác.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedTrashYearIds.length > 0 && selectedTrashYearIds.length === deletedYears.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTrashYearIds(deletedYears.map(y => y.id));
                            else setSelectedTrashYearIds([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedYears.map(y => (
                      <tr key={y.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedTrashYearIds.includes(y.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashYearIds([...selectedTrashYearIds, y.id]);
                              else setSelectedTrashYearIds(selectedTrashYearIds.filter(id => id !== y.id));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{y.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await setDoc(doc(db, 'schoolYears', y.id), { isDeleted: false }, { merge: true });
                                  showAlert('Đã khôi phục năm học', 'success');
                                } catch(e) {}
                              }}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Khôi phục"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await showConfirm('Xóa vĩnh viễn năm học này?');
                                if (isConfirmed) {
                                  try {
                                    await deleteDoc(doc(db, 'schoolYears', y.id));
                                    showAlert('Đã xóa vĩnh viễn', 'success');
                                  } catch(e) {}
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRASH MODAL */}
      {isTrashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Thùng rác tài khoản</h2>
                <p className="text-sm text-slate-500 mt-1">Các tài khoản đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.</p>
              </div>
              <button 
                onClick={() => {
                  setIsTrashModalOpen(false);
                  setSelectedTrashUserIds([]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                {selectedTrashUserIds.length > 0 && (
                  <>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(`Khôi phục ${selectedTrashUserIds.length} tài khoản đã chọn?`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashUserIds.forEach(id => {
                              batch.set(doc(db, 'users', id), { isDeleted: false }, { merge: true });
                            });
                            await batch.commit();
                            setSelectedTrashUserIds([]);
                            showAlert('Đã khôi phục các tài khoản.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi khôi phục.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 border border-green-200"
                    >
                      <RefreshCcw className="w-4 h-4" /> Khôi phục đã chọn
                    </button>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(`Xóa vĩnh viễn ${selectedTrashUserIds.length} tài khoản? Hành động này KHÔNG THỂ hoàn tác.`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashUserIds.forEach(id => {
                              batch.delete(doc(db, 'users', id));
                            });
                            await batch.commit();
                            setSelectedTrashUserIds([]);
                            showAlert('Đã xóa vĩnh viễn.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi xóa vĩnh viễn.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {deletedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Thùng rác trống</h3>
                  <p className="text-slate-500 mt-1">Không có tài khoản nào trong thùng rác.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedTrashUserIds.length > 0 && selectedTrashUserIds.length === deletedUsers.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTrashUserIds(deletedUsers.map(u => u.id));
                            else setSelectedTrashUserIds([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tài khoản / Tên</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Phân quyền</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedUsers.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedTrashUserIds.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashUserIds([...selectedTrashUserIds, u.id]);
                              else setSelectedTrashUserIds(selectedTrashUserIds.filter(id => id !== u.id));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{u.username}</div>
                          <div className="text-sm text-slate-500">{u.fullName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {u.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await setDoc(doc(db, 'users', u.id), { isDeleted: false }, { merge: true });
                                  showAlert('Đã khôi phục tài khoản', 'success');
                                } catch(e) {}
                              }}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Khôi phục"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await showConfirm('Xóa vĩnh viễn tài khoản này?');
                                if (isConfirmed) {
                                  try {
                                    await deleteDoc(doc(db, 'users', u.id));
                                    showAlert('Đã xóa vĩnh viễn', 'success');
                                  } catch(e) {}
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
