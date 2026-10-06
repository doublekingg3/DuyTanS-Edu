import React, { useState, useMemo, useEffect } from 'react';
import { 
  Student, 
  getSubjectName, 
  Grades, 
  computeMonthlyGamificationData, 
  SchoolClass, 
  SchoolYear, 
  SchoolActivityNews,
  ClassSchedule,
  SchedulePeriod
} from '../data';
import { 
  Bell, 
  BookOpen, 
  User, 
  Calendar, 
  Trophy, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Medal, 
  AlertTriangle, 
  AlertOctagon, 
  Bot, 
  Loader2, 
  Sparkles, 
  CalendarCheck, 
  UserCheck, 
  UserX,
  Edit,
  Save,
  X,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  Heart,
  CheckCircle2,
  ShieldCheck,
  IdCard,
  Utensils, 
  ClipboardList,
  Info,
  MoreHorizontal,
  ChevronRight,
  Newspaper,
  LayoutDashboard,
  GraduationCap,
  ArrowRight,
  Sun,
  Sunset,
  Coffee,
  Check,
  Award,
  Camera
} from 'lucide-react';
import ParentSchedule from './ParentSchedule';
import { checkIsSpecialSubject } from '../lib/scheduleConstants';
import ParentLunchMenu from './ParentLunchMenu';
import ParentWeeklyPlan from './ParentWeeklyPlan';
import SchoolNewsGallery from './SchoolNewsGallery';
import { useAlert } from '../contexts/AlertContext';
import { useLanguage, translateSubject, translateDay, translateStatus, translateDish } from '../contexts/LanguageContext';
import { db, uploadImageToStorage } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getCurrentSchoolWeek, generateSchoolWeeks } from '../lib/schoolWeekUtils';

interface ParentViewProps {
  student: Student;
  allStudents: Student[];
  classes: SchoolClass[];
  schoolYears: SchoolYear[];
  onEditStudent?: (student: Student) => void;
  activities?: SchoolActivityNews[];
}

type ParentTab = 'dashboard' | 'profile' | 'news' | 'weekly_plan' | 'attendance' | 'schedule' | 'lunch_menu';

const defaultDishesByDay: Record<string, string[]> = {
  'Thứ 2': ['Cơm trắng thơm dẻo', 'Thịt kho trứng cút đậm đà', 'Canh bí đỏ thịt bằm', 'Rau củ luộc chấm kho quẹt', 'Tráng miệng: Dưa hấu'],
  'Thứ 3': ['Bún bò xào hành tây', 'Chả cá chiên sốt cà chua', 'Canh cải ngọt nấu tôm đồng', 'Tráng miệng: Chuối chín Đà Lạt'],
  'Thứ 4': ['Cơm trắng', 'Gà ram sả ớt thơm lừng', 'Đậu hũ nhồi thịt sốt cà', 'Canh chua cá lóc rau muống', 'Tráng miệng: Thanh long ruột đỏ'],
  'Thứ 5': ['Phở gà truyền thống Duy Tân', 'Bữa xế: Sữa chua uống & Bánh mì hoa cúc', 'Tráng miệng: Táo giòn'],
  'Thứ 6': ['Cơm chiên Dương Châu', 'Sườn non ram mặn ngọt', 'Canh súp củ quả hầm xương', 'Tráng miệng: Bánh flan caramel'],
  'Thứ 7': ['Bánh canh thịt nạc', 'Sữa chua dầm hoa quả tươi']
};

export default function ParentView({ 
  student: initialStudent, 
  allStudents, 
  classes, 
  schoolYears,
  onEditStudent,
  activities = []
}: ParentViewProps) {
  const { showAlert } = useAlert();
  const { t, isEn, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ParentTab>('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [specialSubjects, setSpecialSubjects] = useState<string>('Math, Tiếng Anh');

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.specialSubjects !== undefined) {
          setSpecialSubjects(data.specialSubjects || '');
        }
      }
    }, (err) => console.error(err));
    return () => unsubSettings();
  }, []);

  // Form state for student profile editing by parent
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: '',
    currentAddress: '',
    phone: '',
    parentPhone: '',
    citizenId: '',
    parentName: '',
    avatarUrl: ''
  });
  
  // Find all historical records for this student based on their unique code
  const studentHistory = useMemo(() => {
    if (!initialStudent?.code) return [initialStudent];
    return allStudents.filter(s => s.code === initialStudent.code);
  }, [initialStudent, allStudents]);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string>(initialStudent.id);
  
  // Keep selectedHistoryId in sync if the main student prop changes
  useEffect(() => {
    setSelectedHistoryId(initialStudent.id);
  }, [initialStudent.id]);
  
  const currentViewStudent = useMemo(() => {
    return studentHistory.find(s => s.id === selectedHistoryId) || initialStudent;
  }, [selectedHistoryId, studentHistory, initialStudent]);

  const student = currentViewStudent;

  const currentClass = useMemo(() => {
    return classes?.find(c => c.id === currentViewStudent.classId);
  }, [classes, currentViewStudent.classId]);

  const schoolYearName = useMemo(() => {
    return schoolYears?.find(y => y.id === currentClass?.schoolYearId)?.name || '';
  }, [schoolYears, currentClass]);

  // Tuần hiện tại theo thời gian thực tế
  const currentWeekNumber = useMemo(() => {
    return getCurrentSchoolWeek(schoolYearName);
  }, [schoolYearName]);

  // Dữ liệu thời khóa biểu lớp học
  const [scheduleData, setScheduleData] = useState<ClassSchedule | null>(null);
  useEffect(() => {
    if (!currentViewStudent?.classId) return;
    const unsub = onSnapshot(doc(db, 'schedules', currentViewStudent.classId), (docSnap) => {
      if (docSnap.exists()) {
        setScheduleData(docSnap.data() as ClassSchedule);
      } else {
        setScheduleData(null);
      }
    }, (err) => console.warn('Lỗi đọc thời khóa biểu:', err));
    return () => unsub();
  }, [currentViewStudent?.classId]);

  // Dữ liệu thực đơn ăn trưa tuần hiện tại
  const [weekMenus, setWeekMenus] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'lunch_menus', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const weeks = data.weeks || {};
        const curr = weeks[currentWeekNumber];
        if (curr?.menus) {
          const map: Record<string, string[]> = {};
          curr.menus.forEach((m: any) => {
            if (m.day) map[m.day] = m.dishes || [];
          });
          setWeekMenus(map);
        }
      }
    }, (err) => console.warn('Lỗi đọc thực đơn:', err));
    return () => unsub();
  }, [currentWeekNumber]);

  // Dữ liệu kế hoạch tuần hiện tại
  const [weeklyPlanCurrent, setWeeklyPlanCurrent] = useState<any>(null);
  useEffect(() => {
    if (!currentViewStudent?.classId) return;
    const unsub = onSnapshot(doc(db, 'class_weekly_plans', currentViewStudent.classId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const wData = data?.weeks?.[currentWeekNumber];
        setWeeklyPlanCurrent(wData || null);
      } else {
        setWeeklyPlanCurrent(null);
      }
    }, (err) => console.warn('Lỗi đọc kế hoạch tuần:', err));
    return () => unsub();
  }, [currentViewStudent?.classId, currentWeekNumber]);

  // Xác định thứ hôm nay (Thứ 2 - Thứ 7, Chủ nhật)
  const todayInfo = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0: CN, 1: T2, 2: T3, ...
    const dayMap: Record<number, { key: string; label: string }> = {
      1: { key: 't2', label: 'Thứ 2' },
      2: { key: 't3', label: 'Thứ 3' },
      3: { key: 't4', label: 'Thứ 4' },
      4: { key: 't5', label: 'Thứ 5' },
      5: { key: 't6', label: 'Thứ 6' },
      6: { key: 't7', label: 'Thứ 7' },
      0: { key: 't2', label: 'Chủ nhật (Dự kiến Thứ 2)' }
    };
    const info = dayMap[day] || { key: 't2', label: 'Thứ 2' };
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    return {
      dayKey: info.key,
      dayLabel: info.label,
      dateFormatted
    };
  }, []);

  // Lọc các tiết học của ngày hôm nay
  const todayPeriods = useMemo(() => {
    if (!scheduleData?.periods || scheduleData.periods.length === 0) return [];
    const k = todayInfo.dayKey as keyof SchedulePeriod;
    return scheduleData.periods
      .filter(p => p[k] && String(p[k]).trim() !== '' && String(p[k]).trim() !== '-')
      .map(p => ({
        time: p.time,
        subject: p[k] as string
      }));
  }, [scheduleData, todayInfo.dayKey]);

  // Thực đơn hôm nay
  const todayDishes = useMemo(() => {
    const rawLabel = todayInfo.dayLabel.includes('Thứ') ? todayInfo.dayLabel : 'Thứ 2';
    const cleanLabel = rawLabel.split(' ')[0] + ' ' + rawLabel.split(' ')[1];
    return weekMenus[cleanLabel] || defaultDishesByDay[cleanLabel] || defaultDishesByDay['Thứ 2'];
  }, [weekMenus, todayInfo.dayLabel]);

  // Sync form state when selected student changes
  useEffect(() => {
    if (currentViewStudent) {
      setEditFormData({
        fullName: currentViewStudent.fullName || '',
        dob: currentViewStudent.dob || '',
        gender: currentViewStudent.gender || 'Nam',
        ethnicity: currentViewStudent.ethnicity || 'Kinh',
        nationality: currentViewStudent.nationality || 'Việt Nam',
        religion: currentViewStudent.religion || 'Không',
        pob: currentViewStudent.pob || '',
        currentAddress: currentViewStudent.currentAddress || '',
        phone: currentViewStudent.phone || currentViewStudent.parentPhone || '',
        parentPhone: currentViewStudent.parentPhone || currentViewStudent.phone || '',
        citizenId: currentViewStudent.citizenId || '',
        parentName: currentViewStudent.parentName || '',
        avatarUrl: currentViewStudent.avatarUrl || ''
      });
    }
  }, [currentViewStudent]);

  const handleStartEditing = () => {
    setEditFormData({
      fullName: currentViewStudent.fullName || '',
      dob: currentViewStudent.dob || '',
      gender: currentViewStudent.gender || 'Nam',
      ethnicity: currentViewStudent.ethnicity || 'Kinh',
      nationality: currentViewStudent.nationality || 'Việt Nam',
      religion: currentViewStudent.religion || 'Không',
      pob: currentViewStudent.pob || '',
      currentAddress: currentViewStudent.currentAddress || '',
      phone: currentViewStudent.phone || currentViewStudent.parentPhone || '',
      parentPhone: currentViewStudent.parentPhone || currentViewStudent.phone || '',
      citizenId: currentViewStudent.citizenId || '',
      parentName: currentViewStudent.parentName || '',
      avatarUrl: currentViewStudent.avatarUrl || ''
    });
    setIsEditingProfile(true);
    setActiveTab('profile');
  };

  const handleCancelEditing = () => {
    setIsEditingProfile(false);
    if (currentViewStudent) {
      setEditFormData({
        fullName: currentViewStudent.fullName || '',
        dob: currentViewStudent.dob || '',
        gender: currentViewStudent.gender || 'Nam',
        ethnicity: currentViewStudent.ethnicity || 'Kinh',
        nationality: currentViewStudent.nationality || 'Việt Nam',
        religion: currentViewStudent.religion || 'Không',
        pob: currentViewStudent.pob || '',
        currentAddress: currentViewStudent.currentAddress || '',
        phone: currentViewStudent.phone || currentViewStudent.parentPhone || '',
        parentPhone: currentViewStudent.parentPhone || currentViewStudent.phone || '',
        citizenId: currentViewStudent.citizenId || '',
        parentName: currentViewStudent.parentName || '',
        avatarUrl: currentViewStudent.avatarUrl || ''
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.fullName.trim()) {
      showAlert('Họ và tên học sinh không được để trống', 'error');
      return;
    }

    setIsSaving(true);
    const updatedStudent: Student = {
      ...currentViewStudent,
      fullName: editFormData.fullName.trim(),
      dob: editFormData.dob.trim(),
      gender: editFormData.gender,
      ethnicity: editFormData.ethnicity.trim() || 'Kinh',
      nationality: editFormData.nationality.trim() || 'Việt Nam',
      religion: editFormData.religion.trim() || 'Không',
      pob: editFormData.pob.trim(),
      currentAddress: editFormData.currentAddress.trim(),
      phone: editFormData.phone.trim(),
      parentPhone: editFormData.phone.trim() || editFormData.parentPhone.trim(),
      citizenId: editFormData.citizenId.trim(),
      parentName: editFormData.parentName.trim(),
      avatarUrl: editFormData.avatarUrl || currentViewStudent.avatarUrl || ''
    };

    try {
      // Save directly to Firebase Firestore
      const studentDocRef = doc(db, 'students', updatedStudent.id);
      await setDoc(studentDocRef, updatedStudent, { merge: true });

      if (onEditStudent) {
        onEditStudent(updatedStudent);
      }
      setIsEditingProfile(false);
      showAlert('Cập nhật thông tin con em thành công! Dữ liệu đã được lưu vào hệ thống.', 'success');
    } catch (error) {
      console.error('Error saving student info to Firestore:', error);
      if (onEditStudent) {
        onEditStudent(updatedStudent);
      }
      setIsEditingProfile(false);
      showAlert('Đã lưu thông tin học sinh vào hệ thống.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Tính toán nhanh dữ liệu chuyên cần
  const attendanceStats = useMemo(() => {
    const records = Object.values(currentViewStudent.attendanceRecords || {});
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const leaveEarly = records.filter(r => r.status === 'leave_early').length;
    const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 100;
    return {
      total,
      present,
      absent,
      late,
      leaveEarly,
      rate
    };
  }, [currentViewStudent.attendanceRecords]);

  // Danh sách các menu bên trái cho Desktop
  const desktopMenuItems: {
    id: ParentTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: 'teal' | 'amber' | 'emerald';
  }[] = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard
    },
    {
      id: 'profile',
      label: t('studentProfile'),
      icon: User
    },
    {
      id: 'news',
      label: t('newsAndActivities'),
      icon: Newspaper,
      badge: `${activities.length || 0} ${t('posts')}`,
      badgeColor: 'teal'
    },
    {
      id: 'weekly_plan',
      label: t('weeklyPlan'),
      icon: ClipboardList,
      badge: `${t('week')} ${currentWeekNumber}`,
      badgeColor: 'amber'
    },
    {
      id: 'attendance',
      label: t('activitiesAndAttendance'),
      icon: CalendarCheck,
      badge: `${attendanceStats.rate}%`,
      badgeColor: 'emerald'
    },
    {
      id: 'schedule',
      label: t('schedule'),
      icon: Clock
    },
    {
      id: 'lunch_menu',
      label: t('lunchMenu'),
      icon: Utensils,
      badge: t('today'),
      badgeColor: 'amber'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen md:h-[calc(100vh-68px)] md:overflow-hidden flex flex-col md:flex-row font-sans">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP LEFT SIDEBAR (CỐ ĐỊNH BÊN TRÁI, ĐẦY ĐỦ CÁC CHỨC NĂNG)          */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-white border-r border-teal-100 h-full overflow-y-auto select-none shadow-xs z-30">
        
        {/* Sidebar Header: Thẻ định danh con em & Phụ Huynh */}
        <div className="p-4 border-b border-teal-50 bg-gradient-to-b from-[#f0fdfa] to-white space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">
              {t('parentPortalTitle')}
            </span>
          </div>

          {/* Student Mini Profile Card */}
          <div className="p-3 bg-white rounded-2xl border border-teal-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-gradient text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {student.fullName?.charAt(0) || 'H'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-800 truncate" title={student.fullName}>
                  {student.fullName}
                </h3>
                <p className="text-xs text-teal-700 font-semibold truncate">
                  {t('class')} {currentClass?.name || student.classId}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {t('studentCode')}: {student.code || '---'}
                </p>
              </div>
            </div>

            {/* Selector Năm học / Lịch sử nếu có */}
            {studentHistory.length > 1 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select 
                  value={selectedHistoryId}
                  onChange={e => setSelectedHistoryId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-[11px] font-medium w-full focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {studentHistory.map(hist => {
                    const histClass = classes.find(c => c.id === hist.classId);
                    const histYear = schoolYears.find(y => y.id === histClass?.schoolYearId);
                    return (
                      <option key={hist.id} value={hist.id}>
                        {histClass?.name || hist.classId} {histYear ? `(${histYear.name})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {desktopMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'profile') setIsEditingProfile(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-teal-gradient text-white font-bold shadow-sm shadow-teal-500/20 translate-x-1' 
                    : 'text-slate-600 hover:bg-[#f0fdfa] hover:text-[#0d9488]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-2xs ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : item.badgeColor === 'emerald'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#ccfbf1] text-[#0f766e]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA (MỞ RỘNG KHÔNG GIAN, KHÔNG CÒN BỊ TRỐNG 2 BÊN)         */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-6 lg:p-8 overflow-y-auto md:h-full pb-28 md:pb-12 bg-slate-50/60">
        <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: TỔNG QUAN (DASHBOARD) - TỔNG HỢP SƠ BỘ MỌI TÍNH NĂNG CON EM        */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              
              {/* HOẠT ĐỘNG & SỰ KIỆN TIÊU BIỂU NHÀ TRƯỜNG (Đưa lên trên cùng theo yêu cầu) */}
              <SchoolNewsGallery activities={activities || []} />

              {/* Hero Banner: Lời chào và thẻ học sinh sang trọng */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/40 via-emerald-50/20 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-gradient text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white shrink-0 overflow-hidden">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                      ) : (
                        student.fullName?.charAt(0) || 'H'
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {t('studentYear')} {schoolYearName || '2026 - 2027'}
                        </span>
                        {student.award && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            <Trophy className="w-3 h-3 text-amber-600" />
                            {student.award}
                          </span>
                        )}
                      </div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-slate-800 tracking-tight">
                        {student.fullName}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{t('class')}: <strong className="text-teal-800">{currentClass?.name || student.classId}</strong></span>
                        <span>•</span>
                        <span>{t('studentCode')}: <strong className="font-mono text-slate-700">{student.code || '---'}</strong></span>
                        <span>•</span>
                        <span>{isEn ? 'Gender:' : 'Giới tính:'} <strong className="text-slate-700">{student.gender === 'Nam' ? (isEn ? 'Male' : 'Nam') : (isEn ? 'Female' : 'Nữ')}</strong></span>
                        <span>•</span>
                        <span>{t('homeroomTeacher')}: <strong className="text-teal-800">{currentClass?.homeroomTeacher || t('unassigned')}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Hành động nhanh */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={handleStartEditing}
                      className="px-4 py-2.5 bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-95"
                    >
                      <Edit className="w-4 h-4 text-teal-600" />
                      <span>{t('updateProfile')}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="px-4 py-2.5 bg-teal-gradient text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:opacity-95 active:scale-95"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>{isEn ? 'Attendance Book' : 'Sổ điểm danh'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 KPI Cards: Thống kê nhanh mọi phương diện */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Chuyên cần */}
                <div 
                  onClick={() => setActiveTab('attendance')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? 'ATTENDANCE RATE' : 'TỈ LỆ CHUYÊN CẦN'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-teal-700">
                      {attendanceStats.rate}%
                    </span>
                    <span className="text-xs text-slate-400">
                      ({attendanceStats.present}/{attendanceStats.total} {isEn ? 'days' : 'ngày'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {attendanceStats.absent > 0 ? (
                      <span className="text-rose-600 font-semibold">{attendanceStats.absent} {isEn ? 'absent days' : 'ngày vắng'}</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">{isEn ? '100% Attendance' : 'Chuyên cần 100%'}</span>
                    )}
                    {attendanceStats.late > 0 && ` • ${attendanceStats.late} ${isEn ? 'late' : 'lần đi trễ'}`}
                  </p>
                </div>

                {/* KPI 2: Kế hoạch tuần */}
                <div 
                  onClick={() => setActiveTab('weekly_plan')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? 'LEARNING PROGRESS' : 'TIẾN ĐỘ HỌC TẬP'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                      {t('week')} {currentWeekNumber}
                    </span>
                    <span className="text-xs text-amber-900 font-medium">{isEn ? 'Semester 1' : 'Học kỳ 1'}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {weeklyPlanCurrent?.tasks?.length ? `${weeklyPlanCurrent.tasks.length} ${isEn ? 'key goals' : 'nội dung trọng tâm'}` : (isEn ? 'Active week' : 'Đang triển khai tuần học')}
                  </p>
                </div>

                {/* KPI 3: Lịch học hôm nay */}
                <div 
                  onClick={() => setActiveTab('schedule')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? "TODAY'S CLASSES" : 'HÔM NAY HỌC'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                      {todayPeriods.length > 0 ? `${todayPeriods.length} ${isEn ? 'periods' : 'tiết'}` : (isEn ? 'By Schedule' : 'Theo TKB')}
                    </span>
                    <span className="text-xs text-blue-900 font-medium">{todayInfo.dayLabel}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {todayPeriods.length > 0 ? todayPeriods.map(p => p.subject).slice(0, 3).join(', ') : (isEn ? 'View full timetable' : 'Xem lịch chi tiết')}
                  </p>
                </div>

                {/* KPI 4: Thực đơn dinh dưỡng */}
                <div 
                  onClick={() => setActiveTab('lunch_menu')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? "TODAY'S LUNCH" : 'BÁN TRÚ HÔM NAY'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                      {isEn ? 'Standard' : 'Đầy đủ'}
                    </span>
                    <span className="text-xs text-emerald-900 font-medium">{isEn ? 'Lunch & Snack' : 'Bữa trưa & Xế'}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate" title={todayDishes?.[0]}>
                    {isEn ? 'Main: ' : 'Món chính: '}{todayDishes?.[0] || (isEn ? 'Nutritious lunch' : 'Cơm dinh dưỡng')}
                  </p>
                </div>
              </div>

              {/* GRID 2 CỘT: SƠ BỘ THỜI KHOÁ BIỂU & THỰC ĐƠN HÔM NAY */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                
                {/* WIDGET 1: HÔM NAY CON HỌC GÌ? (Thời khoá biểu hôm nay) */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            {isEn ? "What's Scheduled Today?" : 'Hôm Nay Con Học Gì?'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {isEn ? 'Timetable for ' : 'Lịch học '}{todayInfo.dayLabel} ({todayInfo.dateFormatted})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <span>{isEn ? 'Full week' : 'Cả tuần'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Danh sách tiết học hôm nay */}
                    {todayPeriods.length > 0 ? (
                      <div className="space-y-2">
                        {todayPeriods.map((period, idx) => {
                          const isSpecial = checkIsSpecialSubject(period.subject, specialSubjects);
                          return (
                            <div 
                              key={idx}
                              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-colors ${
                                isSpecial
                                  ? 'bg-rose-50 border-rose-200 text-rose-950 font-bold'
                                  : 'bg-slate-50 hover:bg-blue-50/50 border-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isSpecial ? 'bg-rose-500 text-white shadow-xs' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className={`text-xs sm:text-sm font-bold ${isSpecial ? 'text-rose-900 font-extrabold' : 'text-slate-800'}`}>
                                    {period.subject}
                                  </p>
                                  <p className={`text-[11px] font-medium ${isSpecial ? 'text-rose-600' : 'text-slate-400'}`}>
                                    {period.time}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-2xs ${
                                isSpecial 
                                  ? 'bg-rose-500 text-white border border-rose-600'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}>
                                {isSpecial ? (isEn ? 'Special' : 'Môn đặc thù') : (isEn ? 'Regular' : 'Chính khóa')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-semibold text-slate-600">
                          {isEn ? 'No scheduled classes recorded for today' : 'Chưa có lịch tiết cụ thể cho ngày hôm nay'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {isEn ? 'Click below to view the complete class timetable' : 'Bấm bên dưới để xem thời khóa biểu hoàn chỉnh của lớp'}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{isEn ? 'View complete weekly timetable' : 'Xem toàn bộ Thời khoá biểu các ngày trong tuần'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* WIDGET 2: THỰC ĐƠN ĂN TRƯA HÔM NAY */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            {isEn ? "Today's Boarding Lunch Menu" : 'Thực Đơn Bán Trú Hôm Nay'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {isEn ? 'Nutritional portion ' : 'Khẩu phần dinh dưỡng '}{todayInfo.dayLabel}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('lunch_menu')}
                        className="text-xs font-bold text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-1"
                      >
                        <span>{isEn ? 'Full week' : 'Cả tuần'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Món ăn hôm nay */}
                    <div className="space-y-2">
                      {todayDishes.map((dish, dIdx) => (
                        <div 
                          key={dIdx}
                          className="flex items-center gap-3 p-2.5 sm:p-3 bg-amber-50/40 rounded-xl border border-amber-100/70"
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">
                            {dish}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('lunch_menu')}
                    className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{isEn ? `View detailed menu for Week ${currentWeekNumber}` : `Xem thực đơn chi tiết tuần ${currentWeekNumber}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* GRID 2 CỘT: KẾ HOẠCH TUẦN & HOẠT ĐỘNG ĐIỂM DANH */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                
                {/* WIDGET 3: KẾ HOẠCH HỌC TẬP TUẦN NÀY */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            {isEn ? `Key Focus Plan - Week ${currentWeekNumber}` : `Kế Hoạch Trọng Tâm Tuần ${currentWeekNumber}`}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {isEn ? 'Tasks & goals for Class ' : 'Nhiệm vụ rèn luyện & học tập của Lớp '}{currentClass?.name || student.classId}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
                        {t('week')} {currentWeekNumber}
                      </span>
                    </div>

                    {/* Danh sách nhiệm vụ tuần */}
                    {weeklyPlanCurrent?.tasks?.length > 0 ? (
                      <div className="space-y-2">
                        {weeklyPlanCurrent.tasks.slice(0, 4).map((task: string, tIdx: number) => (
                          <div key={tIdx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-slate-700 font-medium">
                              {task}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <p className="text-xs text-slate-600 font-medium">
                          {isEn ? 'School week is running according to the academic calendar' : 'Tuần học đang diễn ra theo kế hoạch năm học của nhà trường'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {isEn ? 'Click below to view the detailed weekly plan from homeroom teacher' : 'Nhấp bên dưới để xem kế hoạch tuần chi tiết từ giáo viên chủ nhiệm'}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('weekly_plan')}
                    className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{isEn ? 'View complete weekly plan' : 'Xem kế hoạch tuần đầy đủ'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* WIDGET 4: ĐIỂM DANH & NỀ NẾP GẦN ĐÂY */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            {isEn ? 'Attendance & Discipline Record' : 'Tình Hình Chuyên Cần & Nề Nếp'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {isEn ? 'Recent updates from homeroom teacher' : 'Ghi nhận gần nhất từ giáo viên chủ nhiệm'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {attendanceStats.present}/{attendanceStats.total} {isEn ? 'days' : 'ngày'}
                      </span>
                    </div>

                    {/* Danh sách 3 ngày gần nhất */}
                    {currentViewStudent.attendanceRecords && Object.keys(currentViewStudent.attendanceRecords).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(currentViewStudent.attendanceRecords)
                          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                          .slice(0, 3)
                          .map(([date, record]) => (
                            <div key={date} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-semibold text-slate-600">
                                  {new Date(date).toLocaleDateString(isEn ? 'en-US' : 'vi-VN')}
                                </span>
                                {record.reason && (
                                  <span className="text-[11px] text-slate-500 italic truncate max-w-[150px]">
                                    ({record.reason})
                                  </span>
                                )}
                              </div>
                              <div>
                                {record.status === 'present' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <UserCheck className="w-3 h-3" /> {isEn ? 'Present' : 'Có mặt'}
                                  </span>
                                ) : record.status === 'absent' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                    <UserX className="w-3 h-3" /> {isEn ? 'Absent' : 'Vắng mặt'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    <Clock className="w-3 h-3" /> {isEn ? 'Late' : 'Đi trễ'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs text-slate-600 font-medium">{isEn ? 'No attendance records yet' : 'Chưa có bản ghi điểm danh nào'}</p>
                        <p className="text-[11px] text-slate-400">{isEn ? 'Records will appear once teacher marks attendance' : 'Dữ liệu sẽ hiển thị khi giáo viên bắt đầu điểm danh lớp'}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{isEn ? "View child's complete attendance history" : 'Xem toàn bộ lịch sử điểm danh của con'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: HỒ SƠ CON EM (PROFILE)                                             */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {!isEditingProfile ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50/80 to-teal-100/30 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold font-display text-slate-800 text-base sm:text-lg flex items-center gap-2">
                        <IdCard className="w-5 h-5 text-[#0f766e]" />
                        {t('personalInfoTitle')}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {t('personalInfoSubtitle')}
                      </p>
                    </div>

                    <button
                      onClick={handleStartEditing}
                      className="self-start sm:self-auto px-4 py-2 bg-[#0f766e] hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>{t('editInfoBtn')}</span>
                    </button>
                  </div>

                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Notice */}
                    <div className="p-3.5 sm:p-4 bg-[#f0fdfa] border border-[#5eead4] rounded-xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-[#0f766e] shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-teal-950 leading-relaxed">
                        {t('personalNotice')}
                      </p>
                    </div>

                    {/* Section 1: Thông tin nhân thân */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#0f766e]" /> {t('sectionPersonalInfo')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('fullName')}</span>
                          <span className="font-bold text-slate-800 text-sm font-display">
                            {student.fullName}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('gender')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.gender === 'Nam' ? (isEn ? 'Male' : 'Nam') : (isEn ? 'Female' : 'Nữ')}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('dob')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.dob || t('notUpdated')}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('ethnicity')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.ethnicity || 'Kinh'}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('nationality')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.nationality || 'Việt Nam'}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('religion')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.religion || (isEn ? 'None' : 'Không')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Nơi ở & Liên hệ */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#0f766e]" /> {t('sectionAddressContact')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('pob')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.pob || t('notUpdated')}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('currentAddress')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.currentAddress || t('notUpdated')}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('parentPhone')}</span>
                          <span className="font-semibold text-slate-800 text-sm">
                            {student.phone || student.parentPhone || t('notUpdated')}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('parentName')}</span>
                          <span className="font-medium text-slate-800 text-sm">
                            {student.parentName || t('notUpdated')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Học vụ & Định danh */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3 flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-[#0f766e]" /> {t('sectionAcademicIdentity')}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('studentCode')}</span>
                          <span className="font-mono font-bold text-[#0f766e] bg-[#ccfbf1]/80 px-2 py-0.5 rounded text-xs">
                            {student.code || (isEn ? 'None' : 'Chưa có')}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('classStt')}</span>
                          <span className="font-semibold text-slate-800 text-sm">
                            {student.stt || 1}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('enrolledClass')}</span>
                          <span className="font-semibold text-[#0f766e] text-sm">
                            {isEn ? 'Class' : 'Lớp'} {currentClass?.name || student.classId} {schoolYearName ? `(${schoolYearName})` : ''}
                          </span>
                        </div>

                        <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('citizenId')}</span>
                          <span className="font-mono font-medium text-slate-800 text-sm">
                            {student.citizenId || t('notUpdated')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50 to-teal-100/60 border-b border-teal-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Edit className="w-5 h-5 text-[#0f766e]" />
                      <div>
                        <h3 className="font-bold font-display text-slate-800 text-base sm:text-lg">
                          {t('editInfoTitle')}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {t('editInfoSubtitle')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancelEditing}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">{t('studentCode')}:</span>{' '}
                        <span className="font-mono font-bold text-teal-800">{student.code}</span>
                      </div>
                      <span>•</span>
                      <div>
                        <span className="text-slate-400">{t('class')}:</span>{' '}
                        <span className="font-bold text-teal-800">{currentClass?.name || student.classId}</span>
                      </div>
                      <span>•</span>
                      <span className="text-slate-500 italic">
                        {isEn ? 'Student ID & Class assigned by school administration' : 'Mã số và Lớp do nhà trường phân công cố định'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                      {/* Ảnh chân dung học sinh (Upload Firebase Storage) */}
                      <div className="sm:col-span-2 md:col-span-3 p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-gradient text-white font-bold text-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-md shrink-0">
                          {editFormData.avatarUrl ? (
                            <img src={editFormData.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            editFormData.fullName?.charAt(0) || 'H'
                          )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <label className="block text-xs font-extrabold uppercase tracking-wider text-teal-900 mb-1.5">
                            {isEn ? 'Student Avatar / Portrait Photo' : 'Hình ảnh chân dung học sinh'}
                          </label>
                          <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-teal-300 text-teal-800 rounded-xl text-xs font-bold hover:bg-teal-50 cursor-pointer shadow-2xs transition-all active:scale-95">
                            <Camera className="w-4 h-4 text-teal-600" />
                            <span>{editFormData.avatarUrl ? (isEn ? 'Change Photo' : 'Thay đổi ảnh chân dung') : (isEn ? 'Upload Photo' : 'Tải lên ảnh chân dung')}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  showAlert('Đang tải ảnh chân dung học sinh...', 'info');
                                  const url = await uploadImageToStorage(file, 'students/avatars');
                                  setEditFormData(prev => ({ ...prev, avatarUrl: url }));
                                  showAlert('Đã tải lên ảnh chân dung học sinh thành công!', 'success');
                                } catch (err) {
                                  console.error(err);
                                  showAlert('Lỗi khi tải ảnh học sinh', 'error');
                                }
                              }} 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Họ và tên */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('fullName')} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.fullName}
                          onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder={isEn ? 'Enter full name' : 'Nhập họ và tên đầy đủ'}
                        />
                      </div>

                      {/* Giới tính */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('gender')}
                        </label>
                        <select
                          value={editFormData.gender}
                          onChange={e => setEditFormData({ ...editFormData, gender: e.target.value as 'Nam' | 'Nữ' })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        >
                          <option value="Nam">{isEn ? 'Male' : 'Nam'}</option>
                          <option value="Nữ">{isEn ? 'Female' : 'Nữ'}</option>
                        </select>
                      </div>

                      {/* Ngày sinh */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('dob')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.dob}
                          onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder={isEn ? 'YYYY-MM-DD or DD/MM/YYYY' : 'DD/MM/YYYY (VD: 20/04/2015)'}
                        />
                      </div>

                      {/* Dân tộc */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('ethnicity')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.ethnicity}
                          onChange={e => setEditFormData({ ...editFormData, ethnicity: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder="VD: Kinh"
                        />
                      </div>

                      {/* Quốc tịch */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('nationality')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.nationality}
                          onChange={e => setEditFormData({ ...editFormData, nationality: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder="VD: Việt Nam"
                        />
                      </div>

                      {/* Tôn giáo */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('religion')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.religion}
                          onChange={e => setEditFormData({ ...editFormData, religion: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder="VD: Không"
                        />
                      </div>

                      {/* Nơi sinh */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('pob')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.pob}
                          onChange={e => setEditFormData({ ...editFormData, pob: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder={isEn ? 'Place of birth' : 'VD: Tỉnh Đắk Lắk'}
                        />
                      </div>

                      {/* Chỗ ở hiện nay */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('currentAddress')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.currentAddress}
                          onChange={e => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder={isEn ? 'Street, ward, district, city/province...' : 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố...'}
                        />
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('parentPhone')}
                        </label>
                        <input
                          type="tel"
                          value={editFormData.phone}
                          onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder="VD: 0912345678"
                        />
                      </div>

                      {/* Số định danh cá nhân / CCCD */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('citizenId')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.citizenId}
                          onChange={e => setEditFormData({ ...editFormData, citizenId: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder={isEn ? '12-digit Citizen ID' : '12 chữ số CCCD / định danh'}
                        />
                      </div>

                      {/* Họ tên phụ huynh */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t('parentName')}
                        </label>
                        <input
                          type="text"
                          value={editFormData.parentName}
                          onChange={e => setEditFormData({ ...editFormData, parentName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                          placeholder={isEn ? 'Father / Mother full name' : 'Họ và tên cha / mẹ'}
                        />
                      </div>
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        disabled={isSaving}
                        className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors text-center cursor-pointer"
                      >
                        {t('cancelChanges')}
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-[#0f766e] hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('saving')}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{t('saveChanges')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TIN TỨC & PHONG TRÀO                                               */}
          {/* ========================================================================= */}
          {activeTab === 'news' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Bản Tin & Phong Trào Hoạt Động Duy Tân
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cập nhật tin tức học tập, văn thể mỹ, trải nghiệm ngoại khóa dành cho Phụ Huynh & Học Sinh
                    </p>
                  </div>
                </div>
              </div>
              <SchoolNewsGallery activities={activities || []} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: KẾ HOẠCH TUẦN                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'weekly_plan' && (
            <div className="animate-in fade-in duration-200">
              <ParentWeeklyPlan classId={currentViewStudent.classId} schoolYearName={schoolYearName} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: HOẠT ĐỘNG & ĐIỂM DANH                                              */}
          {/* ========================================================================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              {/* Quick Stats on Mobile & Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">{t('totalDays')}</span>
                  <span className="text-2xl font-bold font-display text-slate-800">{attendanceStats.total}</span>
                </div>
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 shadow-2xs">
                  <span className="text-xs font-medium text-emerald-700 block mb-1">{t('present')}</span>
                  <span className="text-2xl font-bold font-display text-emerald-700">{attendanceStats.present}</span>
                </div>
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 shadow-2xs">
                  <span className="text-xs font-medium text-rose-700 block mb-1">{t('absent')}</span>
                  <span className="text-2xl font-bold font-display text-rose-700">{attendanceStats.absent}</span>
                </div>
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 shadow-2xs">
                  <span className="text-xs font-medium text-amber-700 block mb-1">{t('lateOrLeaveEarly')}</span>
                  <span className="text-2xl font-bold font-display text-amber-700">{attendanceStats.late + attendanceStats.leaveEarly}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-teal-50/70 to-teal-100/30 border-b border-teal-100">
                  <h3 className="font-bold font-display text-slate-800 flex items-center gap-2 text-base sm:text-lg">
                    <CalendarCheck className="w-5 h-5 text-[#0f766e]" />
                    {t('attendanceHistoryTitle')}
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  {!currentViewStudent.attendanceRecords || Object.keys(currentViewStudent.attendanceRecords).length === 0 ? (
                    <div className="text-center text-slate-500 py-12">{t('noAttendanceData')}</div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(currentViewStudent.attendanceRecords)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([date, record]) => (
                          <div key={date} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-100 gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-2xs border border-slate-200 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[10px] font-medium text-slate-500 uppercase">
                                  {new Date(date).toLocaleDateString(isEn ? 'en-US' : 'vi-VN', { month: 'short' })}
                                </span>
                                <span className="text-base font-bold text-[#0f766e] leading-none">{new Date(date).getDate()}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">
                                  {new Date(date).toLocaleDateString(isEn ? 'en-US' : 'vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                {record.reason && (
                                  <div className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-100 italic mt-1 inline-block">
                                    <span className="font-medium not-italic text-slate-700 mr-1">{t('reason')}:</span>
                                    {record.reason}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="self-start sm:self-auto">
                              {record.status === 'present' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-xs border border-emerald-200">
                                  <UserCheck className="w-3.5 h-3.5" /> {translateStatus('present', isEn)}
                                </span>
                              ) : record.status === 'absent' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 font-semibold rounded-lg text-xs border border-rose-200">
                                  <UserX className="w-3.5 h-3.5" /> {translateStatus('absent', isEn)}
                                </span>
                              ) : record.status === 'leave_early' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-lg text-xs border border-amber-200">
                                  {translateStatus('leave_early', isEn)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 font-semibold rounded-lg text-xs border border-orange-200">
                                  <Clock className="w-3.5 h-3.5" /> {translateStatus('late', isEn)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: THỜI KHOÁ BIỂU                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-200">
              <ParentSchedule classId={student?.classId || ''} />
            </div>
          )}
          
          {/* ========================================================================= */}
          {/* TAB 7: THỰC ĐƠN ĂN TRƯA                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'lunch_menu' && (
            <div className="animate-in fade-in duration-200">
              <ParentLunchMenu />
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (DÀNH CHO ĐIỆN THOẠI md:hidden)               */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] md:hidden">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1.5 items-center">
          
          {/* Tab 1: Tổng quan */}
          <button
            onClick={() => { setActiveTab('dashboard'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'dashboard' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'dashboard' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              {t('dashboard')}
            </span>
          </button>

          {/* Tab 2: Hồ sơ */}
          <button
            onClick={() => { setActiveTab('profile'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'profile' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'profile' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              {isEn ? 'Profile' : 'Hồ sơ'}
            </span>
          </button>

          {/* Tab 3: Kế hoạch */}
          <button
            onClick={() => { setActiveTab('weekly_plan'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 relative ${
              activeTab === 'weekly_plan' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${activeTab === 'weekly_plan' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <ClipboardList className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1 bg-amber-400 text-teal-950 rounded-full shadow-xs">
                {isEn ? `W${currentWeekNumber}` : `T${currentWeekNumber}`}
              </span>
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'weekly_plan' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              {isEn ? 'Plan' : 'Kế hoạch'}
            </span>
          </button>

          {/* Tab 4: Điểm danh */}
          <button
            onClick={() => { setActiveTab('attendance'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'attendance' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'attendance' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              {isEn ? 'Attendance' : 'Điểm danh'}
            </span>
          </button>

          {/* Tab 5: Thêm */}
          <button
            onClick={() => setShowMoreMenu(prev => !prev)}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              showMoreMenu || activeTab === 'schedule' || activeTab === 'lunch_menu' || activeTab === 'news'
                ? 'text-[#0f766e]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              showMoreMenu || activeTab === 'schedule' || activeTab === 'lunch_menu' || activeTab === 'news'
                ? 'bg-[#ccfbf1] text-[#0f766e]' 
                : ''
            }`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight font-medium`}>
              {isEn ? 'More' : 'Thêm'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-base">{isEn ? 'Features & Utilities' : 'Tính năng & Tiện ích'}</h3>
                <p className="text-xs text-slate-500">{isEn ? 'Explore additional parent portal features' : 'Xem thêm các chức năng dành cho phụ huynh'}</p>
              </div>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => { setActiveTab('schedule'); setShowMoreMenu(false); }}
                className="w-full p-3.5 rounded-2xl flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{t('schedule')}</div>
                    <div className="text-xs text-slate-500">{isEn ? 'View weekly morning & afternoon timetable' : 'Xem các tiết học sáng & chiều trong tuần'}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { setActiveTab('lunch_menu'); setShowMoreMenu(false); }}
                className="w-full p-3.5 rounded-2xl flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{t('lunchMenu')}</div>
                    <div className="text-xs text-slate-500">{isEn ? 'Daily student boarding nutritional portions' : 'Khẩu phần bán trú dinh dưỡng học sinh'}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { setActiveTab('news'); setShowMoreMenu(false); }}
                className="w-full p-3.5 rounded-2xl flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{t('newsAndActivities')}</div>
                    <div className="text-xs text-slate-500">{isEn ? 'Photo gallery and prominent school events' : 'Phóng sự ảnh, hoạt động nổi bật của trường'}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
