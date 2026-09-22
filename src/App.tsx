import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initialStudents, initialClasses, initialUsers, initialSchoolYears, Student, SchoolClass, Grades, UserAccount, SchoolYear, AppSettings, defaultSettings, getUserTeacherType } from './data';
import TeacherView from './components/TeacherView';
import ParentView from './components/ParentView';
import AdminView from './components/AdminView';
import Login from './components/Login';
import Portal from './components/Portal';
import SchoolLogo from './components/SchoolLogo';
import { GraduationCap, Calendar, Users, UserCircle, Shield, Loader2, LogOut, ArrowLeft, KeyRound, Bell, ChevronDown } from 'lucide-react';
import ChangePasswordModal from './components/ChangePasswordModal';
import { v4 as uuidv4 } from 'uuid';
import { db } from './lib/firebase';
import { defaultDb } from './lib/firebase_default';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';

export default function App() {
  const [appMode, setAppMode] = useState<'portal' | 'edu_manager' | 'tkb'>('portal');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher' | 'subject_teacher' | 'parent' | 'staff'>('admin');
  const [loggedInUserId, setLoggedInUserId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For parent view simulation, select the first student by default
  const [parentStudentId, setParentStudentId] = useState('');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearChange = (newYearId: string) => {
    setSelectedYearId(newYearId);
    const classesInNewYear = classes.filter(c => !c.isDeleted && (!newYearId || c.schoolYearId === newYearId));
    if (classesInNewYear.length > 0) {
      const classWithStudents = classesInNewYear.find(c => students.some(s => s.classId === c.id)) || classesInNewYear[0];
      setSelectedClassId(classWithStudents.id);
    }
  };

  useEffect(() => {
    if (schoolYears.length > 0 && !selectedYearId) {
      // Prefer year that has classes with active students, or first available year
      const yearWithStudents = schoolYears.find(y => 
        classes.some(c => !c.isDeleted && c.schoolYearId === y.id && students.some(s => s.classId === c.id))
      );
      const initialYear = yearWithStudents ? yearWithStudents.id : schoolYears[0].id;
      setSelectedYearId(initialYear);

      const matchingClasses = classes.filter(c => !c.isDeleted && (!initialYear || c.schoolYearId === initialYear));
      const classWithStudents = matchingClasses.find(c => students.some(s => s.classId === c.id)) || matchingClasses[0];
      if (classWithStudents) {
        setSelectedClassId(classWithStudents.id);
      }
    }
  }, [schoolYears, classes, students, selectedYearId]);

  useEffect(() => {
    if (classes.length > 0 && (!selectedClassId || !classes.some(c => c.id === selectedClassId && !c.isDeleted))) {
      const matchingClasses = classes.filter(c => !c.isDeleted && (!selectedYearId || c.schoolYearId === selectedYearId));
      const classWithStudents = matchingClasses.find(c => students.some(s => s.classId === c.id)) || matchingClasses[0] || classes.find(c => !c.isDeleted);
      if (classWithStudents) {
        setSelectedClassId(classWithStudents.id);
      }
    }
  }, [classes, students, selectedYearId, selectedClassId]);

  useEffect(() => {
    const studentsRef = collection(db, 'students');
    const classesRef = collection(db, 'classes');
    const usersRef = collection(db, 'users');
    const schoolYearsRef = collection(db, 'schoolYears');
    const settingsRef = doc(db, 'settings', 'general');
    
    let studentsLoaded = false;
    let classesLoaded = false;
    let usersLoaded = false;
    let schoolYearsLoaded = false;
    let settingsLoaded = false;
    
    const checkLoading = () => {
      if (studentsLoaded && classesLoaded && usersLoaded && schoolYearsLoaded && settingsLoaded) {
        setLoading(false);
      }
    };

    const unsubscribeStudents = onSnapshot(studentsRef, async (snapshot) => {
      if (snapshot.empty) {
        setStudents([]);
        studentsLoaded = true;
        checkLoading();
      } else {
        const loadedStudents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            nationality: 'Việt Nam',
            religion: 'Không',
            pob: '',
            currentAddress: '',
            phone: data.phone || data.parentPhone || '',
            citizenId: '',
            ...data,
            id: doc.id
          } as Student;
        });
        // Sort by STT to maintain order
        loadedStudents.sort((a, b) => a.stt - b.stt);
        setStudents(loadedStudents);
        if (loadedStudents.length > 0 && !parentStudentId) {
          setParentStudentId(loadedStudents[0].id);
        }
        studentsLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching students:", error);
      studentsLoaded = true;
      checkLoading();
    });

    const unsubscribeClasses = onSnapshot(classesRef, async (snapshot) => {
      if (snapshot.empty) {
        setClasses([]);
        classesLoaded = true;
        checkLoading();
      } else {
        const loadedClasses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SchoolClass));
        setClasses(loadedClasses);
        classesLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching classes:", error);
      classesLoaded = true;
      checkLoading();
    });

    const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          initialUsers.forEach(u => {
            const docRef = doc(usersRef, u.id);
            batch.set(docRef, u);
          });
          await batch.commit();
        } catch (error) {
          console.error("Error creating initial users:", error);
        }
        setUsers([]);
        usersLoaded = true;
        checkLoading();
      } else {
        const loadedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserAccount));
        setUsers(loadedUsers);
        usersLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching users:", error);
      usersLoaded = true;
      checkLoading();
    });

    
    const unsubscribeSchoolYears = onSnapshot(schoolYearsRef, async (snapshot) => {
      if (snapshot.empty) {
        setSchoolYears([]);
        schoolYearsLoaded = true;
        checkLoading();
      } else {
        const loadedYears = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SchoolYear));
        setSchoolYears(loadedYears);
        schoolYearsLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching schoolYears:", error);
      schoolYearsLoaded = true;
      checkLoading();
    });



    const unsubscribeSettings = onSnapshot(settingsRef, async (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      } else {
        try {
          await setDoc(settingsRef, defaultSettings);
        } catch (error) {
          console.error("Error creating default settings:", error);
        }
      }
      settingsLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error fetching settings:", error);
      settingsLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribeSchoolYears();
      unsubscribeStudents();
      unsubscribeClasses();
      unsubscribeUsers();
      unsubscribeSettings();
    };
  }, []);


  useEffect(() => {
    if (settings.pageTitle) {
      document.title = settings.pageTitle;
    }
    if (settings.pageIcon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.pageIcon;
    }
  }, [settings.pageTitle, settings.pageIcon]);

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, newSettings, { merge: true });
    } catch (e) {
      console.error("Error saving settings to active db:", e);
    }
    try {
      await setDoc(doc(defaultDb, 'settings', 'general'), newSettings, { merge: true });
    } catch (e) {
      console.warn("Cross-syncing settings to defaultDb:", e);
    }
  };

  const handleAddComment = async (studentId: string, text: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const newComment = {
      id: uuidv4(),
      teacherId: 'teacher-1',
      text,
      date: new Date().toISOString()
    };
    
    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, {
      comments: [...student.comments, newComment]
    });
  };

  const handleSendNotification = async (studentId: string, title: string, message: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newNotification = {
      id: uuidv4(),
      title,
      message,
      date: new Date().toISOString(),
      isRead: false
    };

    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, {
      notifications: [newNotification, ...student.notifications]
    });
  };

  const handleAddMultipleStudents = async (newStudents: Student[]) => {
    const CHUNK_SIZE = 400;
    
    for (let i = 0; i < newStudents.length; i += CHUNK_SIZE) {
      const chunk = newStudents.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      
      chunk.forEach(student => {
        const docRef = doc(db, 'students', student.id);
        batch.set(docRef, student);
      });
      
      await batch.commit();
    }
  };

  const handleAddStudent = async (student: Student) => {
    const docRef = doc(db, 'students', student.id);
    await setDoc(docRef, student);
  };

  const handleEditStudent = async (student: Student) => {
    const docRef = doc(db, 'students', student.id);
    await setDoc(docRef, student, { merge: true });
  };

  const handleDeleteStudent = async (studentId: string) => {
    const docRef = doc(db, 'students', studentId);
    await deleteDoc(docRef);
  };

  const handleUpdateGrade = async (studentId: string, field: string, newValue: string | number | any) => {
    const numValue = typeof newValue === 'string' && newValue.trim() !== '' && !isNaN(Number(newValue)) ? Number(newValue) : newValue;
    const docRef = doc(db, 'students', studentId);
    
    const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award', 'term1IsExcellent', 'term2IsExcellent', 'yearIsExcellent', 'term1RankOverride', 'term2RankOverride', 'yearRankOverride'].includes(field);
    const updatePath = isTopLevelField ? field : (field.startsWith('weeklyData.') || field.startsWith('monthlyData.') || field.startsWith('term1Grades.') || field.startsWith('term2Grades.')  || field.startsWith('term1Details.') || field.startsWith('term2Details.')) ? field : `grades.${field}`;
    
    await updateDoc(docRef, {
      [updatePath]: numValue
    });
  };

  const handleUpdateMultipleGrades = async (updates: { studentId: string, field: string, newValue: string | number | any }[]) => {
    // Firestore batch limit is 500 operations
    const CHUNK_SIZE = 400;
    
    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      
      chunk.forEach(update => {
        const numValue = typeof update.newValue === 'string' && update.newValue.trim() !== '' && !isNaN(Number(update.newValue)) ? Number(update.newValue) : update.newValue;
        const docRef = doc(db, 'students', update.studentId);
        
        const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award', 'term1IsExcellent', 'term2IsExcellent', 'yearIsExcellent', 'term1RankOverride', 'term2RankOverride', 'yearRankOverride'].includes(update.field);
        const updatePath = isTopLevelField ? update.field : (update.field.startsWith('weeklyData.') || update.field.startsWith('monthlyData.') || update.field.startsWith('term1Grades.') || update.field.startsWith('term2Grades.') || update.field.startsWith('yearGrades.')  || update.field.startsWith('term1Details.') || update.field.startsWith('term2Details.')) ? update.field : `grades.${update.field}`;
        
        batch.update(docRef, {
          [updatePath]: numValue
        });
      });
      
      await batch.commit();
    }
  };

  const handleLogin = (selectedRole: 'admin' | 'teacher' | 'subject_teacher' | 'staff' | 'parent', studentId?: string, userId?: string) => {
    setRole(selectedRole as any);
    if (studentId) {
      setParentStudentId(studentId);
    }
    if (userId) {
      setLoggedInUserId(userId);
    }
    setIsAuthenticated(true);
    setAppMode('edu_manager');

    try {
      const sessionData = JSON.stringify({
        role: selectedRole,
        studentId: studentId || '',
        userId: userId || ''
      });
      sessionStorage.setItem('edumanage_session', sessionData);
      if (localStorage.getItem('edumanage_remember_me') === 'true') {
        localStorage.setItem('edumanage_auto_session', sessionData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole('admin');
    setParentStudentId('');
    setLoggedInUserId('');
    try {
      sessionStorage.removeItem('edumanage_session');
      localStorage.removeItem('edumanage_auto_session');
    } catch (e) {
      console.error(e);
    }
  };

  // Restore authenticated session on reload
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      try {
        const rawSession = sessionStorage.getItem('edumanage_session') || 
          (localStorage.getItem('edumanage_remember_me') === 'true' ? localStorage.getItem('edumanage_auto_session') : null);
        if (rawSession) {
          const session = JSON.parse(rawSession);
          if (session.userId && users.some(u => u.id === session.userId)) {
            setRole(session.role);
            setLoggedInUserId(session.userId);
            if (session.studentId) setParentStudentId(session.studentId);
            setIsAuthenticated(true);
            setAppMode('edu_manager');
          } else if (session.role === 'parent' && session.studentId && students.some(s => s.id === session.studentId)) {
            setRole('parent');
            setParentStudentId(session.studentId);
            setIsAuthenticated(true);
            setAppMode('edu_manager');
          }
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      }
    }
  }, [loading, users, students, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800">Đang tải dữ liệu...</h2>
      </div>
    );
  }

  if (appMode === 'portal' && !settings?.disablePortal) {
    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} settings={settings} />;
  }

  if (appMode === 'tkb') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center shadow-sm z-10">
          {!settings?.disablePortal && (
          <button 
            onClick={() => setAppMode('portal')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Về Portal</span>
          </button>
          )}
          <h1 className="text-xl font-bold font-display text-slate-800 ml-6">Hệ thống Thời Khoá Biểu</h1>
        </div>
        <div className="flex-1 w-full bg-slate-100">
          {/* 
            ↓↓↓ BẠN DÁN LINK TKB CỦA BẠN VÀO THUỘC TÍNH src Ở BÊN DƯỚI NHÉ ↓↓↓ 
            Ví dụ: src="https://tkb.truongcuaban.edu.vn" 
          */}
          <iframe 
            src="https://example.com" 
            className="w-full h-full border-0"
            title="TKB System"
          />
          {/* ↑↑↑ DÁN LINK VÀO ĐOẠN TRÊN ↑↑↑ */}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login classes={classes} students={students} users={users} onLogin={handleLogin} onBack={() => setAppMode('portal')} settings={settings} />;
  }

  // Active user info
  const currentUser = users.find(u => u.id === loggedInUserId);
  const currentUserDisplayName = currentUser?.fullName || (
    role === 'admin' ? 'Ban Giám Hiệu Duy Tân' :
    role === 'teacher' ? 'Giáo viên' :
    role === 'staff' ? 'Giáo vụ' : 'Phụ huynh'
  );
  const currentUserInitial = currentUserDisplayName.charAt(0).toUpperCase() || 'T';

  // Active class info
  const activeClasses = classes.filter(c => !c.isDeleted);
  const currentClass = activeClasses.find(c => c.id === selectedClassId) || (
    role === 'parent'
      ? activeClasses.find(c => c.id === students.find(s => s.id === parentStudentId)?.classId)
      : activeClasses[0]
  );

  return (
    <div className="min-h-screen bg-[#f0fdfa]/30 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Top Navigation styled to match Hình 1.jpg - Streamlined for Mobile & Desktop */}
      <header className="bg-white border-b border-teal-100 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 z-30 shrink-0 shadow-2xs">
        {/* Left: School Logo & Title & Sổ Chủ Nhiệm Số & Year Selector */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2">
          <SchoolLogo src={settings?.portalLogo || settings?.loginLogo} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 object-contain" />
          <div className="flex flex-col min-w-0 justify-center">
            <h1 className="text-[10px] sm:text-xs font-bold tracking-wider text-teal-800 uppercase font-display truncate max-w-[130px] sm:max-w-xs md:max-w-none">
              {settings?.appName || "Trường Phổ Thông Duy Tân"}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
                SỔ CHỦ NHIỆM SỐ
              </span>
              {schoolYears && schoolYears.length > 0 && (
                <div className="relative inline-flex items-center shrink-0">
                  <select
                    value={selectedYearId}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="appearance-none bg-[#ccfbf1]/80 hover:bg-[#ccfbf1] border border-[#5eead4] text-[#0f766e] text-[10px] sm:text-xs font-bold rounded-full py-0.5 pl-2 sm:pl-2.5 pr-5 sm:pr-6 cursor-pointer outline-none transition-colors"
                  >
                    {schoolYears.map(y => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0f766e] absolute right-1 sm:right-1.5 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Tên lớp & GVCN (Desktop Only) */}
        {currentClass && (
          <div className="hidden lg:flex items-center gap-3 bg-[#f0fdfa] border border-[#5eead4] px-4 py-1.5 rounded-2xl shadow-2xs shrink-0 mx-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Lớp:</span>
              <span className="text-sm font-extrabold text-teal-800 bg-[#ccfbf1] px-2 py-0.5 rounded-lg">
                {currentClass.name}
              </span>
            </div>
            <span className="text-teal-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">GVCN:</span>
              <span className="text-sm font-bold text-slate-800">
                {currentClass.homeroomTeacher || 'Chưa phân công'}
              </span>
            </div>
          </div>
        )}

        {/* Right: Notification Bell & User Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Notification Bell */}
          <button 
            className="p-1.5 sm:p-2 text-slate-400 hover:text-teal-700 hover:bg-[#f0fdfa] rounded-xl transition-colors relative shrink-0"
            title="Thông báo"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* User Menu Button */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-[#f0fdfa] transition-all border border-transparent hover:border-teal-200"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0d9488] text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs shadow-teal-600/30 shrink-0">
                {currentUserInitial}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  {currentUserDisplayName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  {role === 'admin' && 'Ban Giám Hiệu'}
                  {role === 'teacher' && 'Giáo viên'}
                  {role === 'staff' && 'Giáo vụ'}
                  {role === 'parent' && 'Phụ huynh'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 sm:w-56 bg-white rounded-2xl shadow-xl border border-teal-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                  <div className="text-sm font-bold text-slate-800">{currentUserDisplayName}</div>
                  <div className="text-xs text-slate-500">
                    {role === 'admin' ? 'Ban Giám Hiệu' : role === 'teacher' ? 'Giáo viên' : 'Người dùng'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsChangePasswordModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-[#f0fdfa] hover:text-teal-700 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <KeyRound className="w-4 h-4 text-teal-600" />
                  <span>Đổi mật khẩu</span>
                </button>

                {!settings?.disablePortal && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                      setAppMode('portal');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-[#f0fdfa] hover:text-teal-700 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 text-teal-600" />
                    <span>Về trang Portal</span>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {isChangePasswordModalOpen && (
          <ChangePasswordModal 
            onClose={() => setIsChangePasswordModalOpen(false)}
            userRole={role as any}
            currentUser={users.find(u => u.id === loggedInUserId)}
            currentStudent={students.find(s => s.id === parentStudentId)}
          />
        )}
        {role === "admin" || role === "teacher" || role === "staff" ? (
          <TeacherView 
            role={role}
            users={users}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            students={students}
            classes={classes}
            user={users.find(u => u.id === loggedInUserId)}
            schoolYears={schoolYears}
            selectedYearId={selectedYearId}
            onYearChange={setSelectedYearId}
            selectedClassId={selectedClassId}
            onClassChange={setSelectedClassId}
            onAddComment={handleAddComment}
            onSendNotification={handleSendNotification}
            onAddStudent={handleAddStudent}
            onAddMultipleStudents={handleAddMultipleStudents}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateGrade={handleUpdateGrade}
            onUpdateMultipleGrades={handleUpdateMultipleGrades}
          />
        ) : (
          <div className="flex flex-col h-[calc(100vh-68px)]">
            <div className="flex-1 overflow-y-auto">
              <ParentView 
                student={students.find(s => s.id === parentStudentId) || students[0]} 
                allStudents={students} 
                classes={classes} 
                schoolYears={schoolYears} 
                onEditStudent={handleEditStudent}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
