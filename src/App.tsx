import React, { useState, useEffect } from 'react';
import { initialStudents, initialClasses, initialUsers, initialSchoolYears, Student, SchoolClass, Grades, UserAccount, SchoolYear } from './data';
import TeacherView from './components/TeacherView';
import ParentView from './components/ParentView';
import AdminView from './components/AdminView';
import Login from './components/Login';
import Portal from './components/Portal';
import { GraduationCap, Calendar, Users, UserCircle, Shield, Loader2, LogOut, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';

export default function App() {
  const [appMode, setAppMode] = useState<'portal' | 'edu_manager' | 'tkb'>('portal');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent'>('admin');
  const [loggedInUserId, setLoggedInUserId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For parent view simulation, select the first student by default
  const [parentStudentId, setParentStudentId] = useState('');

  useEffect(() => {
    const studentsRef = collection(db, 'students');
    const classesRef = collection(db, 'classes');
    const usersRef = collection(db, 'users');
    const schoolYearsRef = collection(db, 'schoolYears');
    
    let studentsLoaded = false;
    let classesLoaded = false;
    let usersLoaded = false;
    let schoolYearsLoaded = false;
    
    const checkLoading = () => {
      if (studentsLoaded && classesLoaded && usersLoaded && schoolYearsLoaded) {
        setLoading(false);
      }
    };

    const unsubscribeStudents = onSnapshot(studentsRef, async (snapshot) => {
      if (snapshot.empty) {
        setStudents([]);
        studentsLoaded = true;
        checkLoading();
      } else {
        const loadedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        // Sort by STT to maintain order
        loadedStudents.sort((a, b) => a.stt - b.stt);
        setStudents(loadedStudents);
        if (loadedStudents.length > 0 && !parentStudentId) {
          setParentStudentId(loadedStudents[0].id);
        }
        studentsLoaded = true;
        checkLoading();
      }
    });

    const unsubscribeClasses = onSnapshot(classesRef, async (snapshot) => {
      if (snapshot.empty) {
        setClasses([]);
        classesLoaded = true;
        checkLoading();
      } else {
        const loadedClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolClass));
        setClasses(loadedClasses);
        classesLoaded = true;
        checkLoading();
      }
    });

    const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialUsers.forEach(u => {
          const docRef = doc(usersRef, u.id);
          batch.set(docRef, u);
        });
        await batch.commit();
      } else {
        const loadedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
        setUsers(loadedUsers);
        usersLoaded = true;
        checkLoading();
      }
    });

    
    const unsubscribeSchoolYears = onSnapshot(schoolYearsRef, async (snapshot) => {
      if (snapshot.empty) {
        setSchoolYears([]);
        schoolYearsLoaded = true;
        checkLoading();
      } else {
        const loadedYears = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
        setSchoolYears(loadedYears);
        schoolYearsLoaded = true;
        checkLoading();
      }
    });


    return () => {
      unsubscribeSchoolYears();
      unsubscribeStudents();
      unsubscribeClasses();
      unsubscribeUsers();
    };
  }, []);

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
    
    const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award'].includes(field);
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
        
        const isTopLevelField = ['academicPerformance', 'conduct', 'cp', 'kp', 'award'].includes(update.field);
        const updatePath = isTopLevelField ? update.field : (update.field.startsWith('weeklyData.') || update.field.startsWith('monthlyData.') || update.field.startsWith('term1Grades.') || update.field.startsWith('term2Grades.') || update.field.startsWith('yearGrades.')  || update.field.startsWith('term1Details.') || update.field.startsWith('term2Details.')) ? update.field : `grades.${update.field}`;
        
        batch.update(docRef, {
          [updatePath]: numValue
        });
      });
      
      await batch.commit();
    }
  };

  const handleLogin = (selectedRole: 'admin' | 'teacher' | 'parent', studentId?: string, userId?: string) => {
    setRole(selectedRole);
    if (studentId) {
      setParentStudentId(studentId);
    }
    if (userId) {
      setLoggedInUserId(userId);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole('admin');
    setParentStudentId('');
    setLoggedInUserId('');
  };

  if (appMode === 'portal') {
    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} onSelectTkb={() => setAppMode('tkb')} />;
  }

  if (appMode === 'tkb') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center shadow-sm z-10">
          <button 
            onClick={() => setAppMode('portal')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Về Portal</span>
          </button>
          <h1 className="text-xl font-bold font-display text-slate-800 ml-6">Hệ thống Thời Khoá Biểu</h1>
        </div>
        <div className="flex-1 w-full bg-slate-100">
          {/* 
            ↓↓↓ BẠN DÁN LINK TKB CỦA BẠN VÀO THUỘC TÍNH src Ở BÊN DƯỚI NHÉ ↓↓↓ 
            Ví dụ: src="https://tkb.truongcuaban.edu.vn" 
          */}
          <iframe 
            src="https://tkb-081225.vercel.app/" 
            className="w-full h-full border-0"
            title="TKB System"
          />
          {/* ↑↑↑ DÁN LINK VÀO ĐOẠN TRÊN ↑↑↑ */}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800">Đang tải dữ liệu...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login classes={classes} students={students} users={users} onLogin={handleLogin} onBack={() => setAppMode('portal')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">EduManage Pro</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              {role === 'admin' && 'Ban Giám Hiệu'}
              {role === 'teacher' && 'Giáo viên'}
              {role === 'parent' && 'Phụ huynh'}
            </span>
            <button
              onClick={() => {
                handleLogout();
                setAppMode('portal');
              }}
              className="ml-2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
              title="Trở về"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Về Portal</span>
            </button>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {role === 'admin' ? (
          <AdminView classes={classes} students={students} users={users} schoolYears={schoolYears} />
        ) : role === 'teacher' ? (
          <TeacherView 
            students={students}
            classes={classes}
            user={users.find(u => u.id === loggedInUserId)}
            schoolYears={schoolYears}
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
          <div className="flex flex-col h-[calc(100vh-64px)]">
            <div className="flex-1 overflow-y-auto">
              <ParentView student={students.find(s => s.id === parentStudentId) || students[0]} allStudents={students} classes={classes} schoolYears={schoolYears} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
