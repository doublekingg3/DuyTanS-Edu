import React, { useState, useEffect } from 'react';
import { Student, SchoolClass, UserAccount, SchoolYear, sortClasses, AppSettings } from '../data';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar as CalendarIcon, 
  Settings, 
  Building2, 
  Shield, 
  UserCheck, 
  ClipboardList, 
  Utensils,
  ChevronRight,
  ChevronDown,
  Database,
  Sparkles,
  Cloud,
  Pin
} from 'lucide-react';
import TeacherStudents from './TeacherStudents';
import TeacherAttendance from './TeacherAttendance';
import TeacherGrades from './TeacherGrades';
import TeacherSchedule from './TeacherSchedule';
import AdminView from './AdminView';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import TeacherWeeklyPlan from './TeacherWeeklyPlan';
import TeacherLunchMenu from './TeacherLunchMenu';
import { getCurrentSchoolWeek } from '../lib/schoolWeekUtils';

interface TeacherViewProps {
  role?: string;
  users?: UserAccount[];
  settings?: AppSettings;
  students: Student[];
  classes?: SchoolClass[];
  user?: UserAccount;
  schoolYears?: SchoolYear[];
  selectedYearId?: string;
  onYearChange?: (yearId: string) => void;
  selectedClassId?: string;
  onClassChange?: (classId: string) => void;
  onAddComment: (studentId: string, text: string) => void;
  onSendNotification: (studentId: string, title: string, message: string) => void;
  onAddStudent: (student: Student) => void;
  onAddMultipleStudents?: (students: Student[]) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateGrade: (studentId: string, field: string, value: string | number) => void;
  onUpdateMultipleGrades: (updates: { studentId: string, field: string, newValue: string | number | any }[]) => void;
}

export default function TeacherView({ 
  role,
  users,
  settings,
  students, 
  classes, 
  user,
  schoolYears, 
  selectedYearId: propSelectedYearId,
  onYearChange,
  selectedClassId: propSelectedClassId,
  onClassChange,
  onAddComment, 
  onSendNotification,
  onAddStudent,
  onAddMultipleStudents,
  onEditStudent,
  onDeleteStudent,
  onUpdateGrade,
  onUpdateMultipleGrades
}: TeacherViewProps) {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [internalYearId, setInternalYearId] = useState(
    schoolYears && schoolYears.length > 0 ? schoolYears[0].id : ''
  );
  
  const selectedYearId = propSelectedYearId !== undefined ? propSelectedYearId : internalYearId;

  const allowedClasses = sortClasses(classes?.filter(c => 
    !c.isDeleted &&
    (role === 'admin' || role === 'staff' || 
     user?.homeroomClasses?.includes(c.id) || 
     user?.subjectClasses?.includes(c.id) ||
     c.homeroomTeacher === user?.fullName) &&
    (!selectedYearId || c.schoolYearId === selectedYearId || !c.schoolYearId)
  ) || []);

  const [internalClassId, setInternalClassId] = useState('');
  const selectedClassId = propSelectedClassId !== undefined && propSelectedClassId !== '' 
    ? propSelectedClassId 
    : internalClassId;

  const handleClassChange = (classId: string) => {
    setInternalClassId(classId);
    onClassChange?.(classId);
  };

  const handleYearChange = (yearId: string) => {
    setInternalYearId(yearId);
    onYearChange?.(yearId);
    const newAllowed = sortClasses(classes?.filter(c => 
      !c.isDeleted &&
      (role === 'admin' || role === 'staff' || 
       user?.homeroomClasses?.includes(c.id) || 
       user?.subjectClasses?.includes(c.id) ||
       c.homeroomTeacher === user?.fullName) &&
      (!yearId || c.schoolYearId === yearId || !c.schoolYearId)
    ) || []);
    if (newAllowed.length > 0) {
      const classWithStudents = newAllowed.find(c => students.some(s => s.classId === c.id)) || newAllowed[0];
      handleClassChange(classWithStudents.id);
    }
  };

  useEffect(() => {
    if (allowedClasses.length > 0 && !allowedClasses.some(c => c.id === selectedClassId)) {
      const classWithStudents = allowedClasses.find(c => students.some(s => s.classId === c.id)) || allowedClasses[0];
      if (classWithStudents) {
        handleClassChange(classWithStudents.id);
      }
    }
  }, [selectedYearId, allowedClasses, selectedClassId, students]);

  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  const activeSchoolYear = schoolYears?.find(y => y.id === selectedYearId);
  // Compute current week for badge based on real school schedule (17/08 start)
  const currentWeekNumber = getCurrentSchoolWeek(activeSchoolYear?.name);

  // Desktop Sidebar hover & pin state
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    return localStorage.getItem('teacher_sidebar_pinned') === 'true';
  });
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isExpanded = isSidebarPinned || isSidebarHovered;

  const handleTogglePin = () => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      localStorage.setItem('teacher_sidebar_pinned', String(next));
      return next;
    });
  };

  // Sidebar Menu Items styled identically to Hình 1.jpg
  const menuItems = [
    { 
      id: "overview", 
      icon: LayoutDashboard, 
      label: "Tổng quan" 
    },
    ...(role !== 'staff' && role !== 'subject_teacher' ? [{ 
      id: "schedule", 
      icon: Clock, 
      label: "Thời khóa biểu" 
    }] : []),
    ...(role !== 'staff' ? [{ 
      id: "students", 
      icon: Users, 
      label: "Danh sách lớp",
      badge: `${filteredStudents.length} HS`,
      badgeType: 'count' as const,
      collapsedBadge: filteredStudents.length.toString(),
    }] : []),
    ...(role !== 'staff' && role !== 'subject_teacher' ? [{ 
      id: "weekly_plan", 
      icon: ClipboardList, 
      label: "Kế hoạch tuần",
      badge: `Tuần ${currentWeekNumber}`,
      badgeType: 'yellow' as const,
      collapsedBadge: `T${currentWeekNumber}`,
    }] : []),
    ...(role !== 'subject_teacher' ? [{ 
      id: "lunch_menu", 
      icon: Utensils, 
      label: "Thực đơn ăn trưa",
      badge: "Bán trú",
      badgeType: 'teal' as const,
      collapsedBadge: "BT",
    }] : []),
    ...(role !== 'staff' ? [{ 
      id: "attendance", 
      icon: UserCheck, 
      label: "Điểm danh" 
    }] : []),
    ...(role === 'admin' ? [
      { id: "admin_classes", icon: Building2, label: "Quản lý Lớp học" },
      { id: "admin_school_years", icon: CalendarIcon, label: "Quản lý Năm học" },
      { id: "admin_accounts", icon: Shield, label: "Quản lý người dùng" },
      { id: "admin_settings", icon: Settings, label: "Cấu hình hệ thống" }
    ] : [])
  ];

  const roleBadgeLabel = role === 'admin' 
    ? 'Ban Giám Hiệu' 
    : (role === 'teacher' ? 'Giáo viên' : (role === 'staff' ? 'Giáo vụ' : 'Chủ nhiệm'));

  const shortRoleLabel = role === 'admin' ? 'BGH' : 'GV';

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-68px)] overflow-hidden bg-[#f0fdfa]/30 relative">
      {/* Desktop Sidebar Spacer (reserves 76px when collapsed or 256px when pinned to prevent content shifting) */}
      <div 
        className={`hidden md:block shrink-0 transition-[width] duration-300 ease-in-out ${
          isSidebarPinned ? 'w-64' : 'w-[76px]'
        }`} 
      />

      {/* Desktop Sidebar with Auto-Collapse & Hover-Expand */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`hidden md:flex flex-col absolute top-0 bottom-0 left-0 bg-white border-r border-teal-100/80 z-30 transition-[width,box-shadow] duration-300 ease-in-out ${
          isExpanded ? 'w-64 shadow-xl' : 'w-[76px] shadow-2xs'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-3.5 py-4 flex items-center justify-between border-b border-teal-50 min-h-[58px]">
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  HỆ THỐNG QUẢN LÝ
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ccfbf1] text-[#0f766e] text-[10px] font-bold shrink-0">
                  {roleBadgeLabel}
                </span>
              </div>
              <button
                onClick={handleTogglePin}
                title={isSidebarPinned ? "Bỏ ghim (Tự động thu gọn khi rê chuột ra)" : "Ghim menu luôn mở"}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ml-1 ${
                  isSidebarPinned 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-slate-400 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 transition-transform ${isSidebarPinned ? 'rotate-45 text-teal-700' : ''}`} />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-[#ccfbf1] text-[#0f766e] text-[10px] font-extrabold text-center tracking-tight shadow-2xs">
                {shortRoleLabel}
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Menu List */}
        <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                }}
                title={!isExpanded ? item.label : undefined}
                className={`w-full flex items-center rounded-2xl transition-all duration-200 group relative ${
                  isExpanded 
                    ? 'px-3.5 py-2.5 justify-between' 
                    : 'px-2 py-2.5 justify-center'
                } ${
                  isActive 
                    ? 'bg-teal-gradient text-white font-bold shadow-sm shadow-teal-500/20' 
                    : 'text-slate-600 hover:bg-[#f0fdfa] hover:text-[#0d9488] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'}`} />
                    
                    {/* Badge when collapsed (shows e.g. T6/T7 for weekly plan, class count for students, BT for lunch) */}
                    {!isExpanded && item.collapsedBadge && (
                      <span className={`absolute -top-1.5 -right-3 px-1.5 py-0.2 text-[10px] font-black rounded-full leading-tight shadow-xs border ${
                        isActive
                          ? (item.badgeType === 'yellow' ? 'bg-amber-300 text-amber-950 border-amber-200' : 'bg-white text-teal-900 border-teal-200')
                          : (item.badgeType === 'yellow' 
                              ? 'bg-amber-400 text-amber-950 border-white' 
                              : item.badgeType === 'teal' 
                              ? 'bg-[#0f766e] text-white border-white' 
                              : 'bg-teal-600 text-white border-white')
                      }`}>
                        {item.collapsedBadge}
                      </span>
                    )}
                  </div>

                  {/* Label when expanded */}
                  {isExpanded && (
                    <span className="text-sm tracking-tight truncate whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Badge and Chevron when expanded */}
                {isExpanded && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge && !isActive && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeType === 'yellow'
                          ? 'bg-amber-100 text-amber-800'
                          : item.badgeType === 'teal'
                          ? 'bg-[#ccfbf1] text-[#0f766e]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white/90 shrink-0" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-teal-100 z-50 px-2 py-2 flex justify-start items-center overflow-x-auto snap-x snap-mandatory shadow-lg hide-scrollbar gap-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
              }}
              style={{ minWidth: '4.5rem' }} 
              className={`snap-center shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors relative ${
                isActive ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.collapsedBadge && (
                  <span className="absolute -top-1 -right-2 text-[8px] font-bold px-1 bg-amber-400 text-teal-950 rounded-full">
                    {item.collapsedBadge}
                  </span>
                )}
              </div>
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col pb-16 md:pb-0">
        {/* Context Bar for Year & Class Selector - Optimized for Mobile & Desktop */}
        <div className="bg-white px-3 sm:px-6 py-2 sm:py-3 border-b border-teal-100 z-10 shadow-2xs shrink-0">
          {/* Mobile Layout (< sm) */}
          <div className="sm:hidden flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-slate-800 tracking-tight truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0"></span>
                <span className="truncate">
                  {activeMenu === 'overview' && 'Tổng quan hệ thống'}
                  {activeMenu === 'schedule' && 'Thời khóa biểu lớp'}
                  {activeMenu === 'attendance' && 'Điểm danh học sinh'}
                  {activeMenu === 'students' && 'Danh sách lớp & Học sinh'}
                  {activeMenu === 'weekly_plan' && 'Kế hoạch tuần'}
                  {activeMenu === 'lunch_menu' && 'Thực đơn ăn trưa'}
                  {activeMenu === 'admin_classes' && 'Quản lý Lớp học'}
                  {activeMenu === 'admin_school_years' && 'Quản lý Năm học'}
                  {activeMenu === 'admin_accounts' && 'Quản lý người dùng'}
                  {activeMenu === 'admin_settings' && 'Cấu hình hệ thống'}
                </span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ccfbf1] text-[#0f766e] text-[10px] font-bold shrink-0">
                {roleBadgeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              {/* Year Select (Mobile) */}
              <div className="min-w-0">
                <select 
                  value={selectedYearId} 
                  onChange={e => handleYearChange(e.target.value)}
                  className="w-full bg-[#f0fdfa] border border-teal-200 text-teal-900 text-xs rounded-xl focus:ring-[#0d9488] focus:border-[#0d9488] px-2 py-1.5 font-medium shadow-2xs truncate"
                >
                  <option value="">Tất cả năm học</option>
                  {schoolYears?.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              {/* Class Select (Mobile) */}
              <div className="min-w-0">
                <select 
                  value={selectedClassId} 
                  onChange={e => handleClassChange(e.target.value)}
                  className="w-full bg-[#f0fdfa] border border-teal-200 text-teal-900 text-xs rounded-xl focus:ring-[#0d9488] focus:border-[#0d9488] px-2 py-1.5 font-medium shadow-2xs truncate"
                >
                  {allowedClasses.length > 0 ? (
                    allowedClasses.map(c => {
                      const studentCount = students.filter(s => s.classId === c.id).length;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} {studentCount > 0 ? `(${studentCount} HS)` : '(0 HS)'}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">{(role === 'admin' || role === 'staff') ? 'Chưa có lớp' : 'Không có lớp'}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Layout (>= sm) */}
          <div className="hidden sm:flex justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {activeMenu === 'overview' && 'Tổng quan hệ thống'}
                {activeMenu === 'schedule' && 'Thời khóa biểu lớp'}
                {activeMenu === 'attendance' && 'Điểm danh học sinh'}
                {activeMenu === 'students' && 'Danh sách lớp & Học sinh'}
                {activeMenu === 'weekly_plan' && 'Kế hoạch tuần'}
                {activeMenu === 'lunch_menu' && 'Thực đơn ăn trưa'}
                {activeMenu === 'admin_classes' && 'Quản lý Lớp học'}
                {activeMenu === 'admin_school_years' && 'Quản lý Năm học'}
                {activeMenu === 'admin_accounts' && 'Quản lý tài khoản & Phân quyền'}
                {activeMenu === 'admin_settings' && 'Cấu hình hệ thống'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* School Year Select */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Năm học:</label>
                <select 
                  value={selectedYearId} 
                  onChange={e => handleYearChange(e.target.value)}
                  className="bg-[#f0fdfa] border border-teal-200 text-teal-900 text-xs rounded-xl focus:ring-[#0d9488] focus:border-[#0d9488] px-2.5 py-1.5 font-medium shadow-2xs"
                >
                  <option value="">Tất cả năm học</option>
                  {schoolYears?.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              {/* Class Select */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Lớp:</label>
                <select 
                  value={selectedClassId} 
                  onChange={e => handleClassChange(e.target.value)}
                  className="bg-[#f0fdfa] border border-teal-200 text-teal-900 text-xs rounded-xl focus:ring-[#0d9488] focus:border-[#0d9488] px-2.5 py-1.5 font-medium shadow-2xs max-w-xs"
                >
                  {allowedClasses.length > 0 ? (
                    allowedClasses.map(c => {
                      const studentCount = students.filter(s => s.classId === c.id).length;
                      const yearName = schoolYears?.find(y => y.id === c.schoolYearId)?.name;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} {studentCount > 0 ? `(${studentCount} HS)` : '(0 HS)'} {(!selectedYearId && yearName) ? `• ${yearName}` : ''} {(role === 'admin' || role === 'staff') ? '' : (user?.homeroomClasses?.includes(c.id) || c.homeroomTeacher === user?.fullName ? '• GVCN' : '• GVBM')}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">{(role === 'admin' || role === 'staff') ? 'Chưa có lớp nào' : 'Không có lớp phân công'}</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* View Body */}
        <div className="flex-1 overflow-y-auto bg-[#f0fdfa]/30">
          {activeMenu === 'overview' && (role === 'admin' || role === 'staff') && (
            <AdminDashboard 
              classes={classes || []} 
              students={students} 
              schoolYearId={selectedYearId} 
              selectedClassId={selectedClassId}
              onSelectClass={handleClassChange}
              onNavigateToAttendance={(cId) => {
                if (cId) handleClassChange(cId);
                setActiveMenu('attendance');
              }}
            />
          )}

          {activeMenu === 'overview' && role !== 'admin' && role !== 'staff' && (
            <TeacherDashboard 
              classId={selectedClassId}
              className={allowedClasses.find(c => c.id === selectedClassId)?.name || ''}
              students={filteredStudents}
            />
          )}

          {activeMenu === 'attendance' && (
            <TeacherAttendance 
              role={role}
              students={filteredStudents}
              classId={selectedClassId}
              className={allowedClasses.find(c => c.id === selectedClassId)?.name || ''}
              onEditStudent={onEditStudent}
            />
          )}

          {activeMenu === 'schedule' && (
            <TeacherSchedule 
              classId={selectedClassId} 
              role={role}
              classes={allowedClasses}
              onClassChange={handleClassChange}
              className={allowedClasses.find(c => c.id === selectedClassId)?.name}
            />
          )}

          {activeMenu === 'students' && (
            <TeacherStudents 
              role={role}
              students={filteredStudents}
              classId={selectedClassId}
              classes={classes}
              onAddComment={onAddComment}
              onSendNotification={onSendNotification}
              onAddStudent={onAddStudent}
              onAddMultipleStudents={onAddMultipleStudents}
              onEditStudent={onEditStudent}
              onDeleteStudent={onDeleteStudent}
              schoolYears={schoolYears}
            />
          )}

          {activeMenu === 'grades' && (
            <TeacherGrades 
              students={filteredStudents} 
              className={allowedClasses.find(c => c.id === selectedClassId)?.name} 
              onUpdateGrade={onUpdateGrade} 
              onUpdateMultipleGrades={onUpdateMultipleGrades} 
            />
          )}

          {activeMenu === 'weekly_plan' && (
            <TeacherWeeklyPlan 
              classId={selectedClassId} 
              role={role} 
              className={allowedClasses.find(c => c.id === selectedClassId)?.name}
              schoolYearName={schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId || selectedYearId))?.name || 'Không xác định'}
              teacherName={user?.fullName}
            />
          )}

          {activeMenu === 'lunch_menu' && (
            <TeacherLunchMenu 
              classId={selectedClassId} 
              role={role} 
              schoolYearName={schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId || selectedYearId))?.name || 'Không xác định'} 
            />
          )}

          {activeMenu.startsWith('admin_') && (
            role === 'admin' && users && settings ? (
              <div className="p-0 h-full overflow-hidden">
                <AdminView 
                  classes={classes || []} 
                  students={students} 
                  users={users} 
                  schoolYears={schoolYears || []} 
                  settings={settings} 
                  externalActiveTab={
                    activeMenu === 'admin_classes' ? 'classes' :
                    activeMenu === 'admin_school_years' ? 'school_years' :
                    activeMenu === 'admin_accounts' ? 'accounts' :
                    'system_config'
                  }
                  onTabChange={(tab) => {
                    if (tab === 'classes') setActiveMenu('admin_classes');
                    else if (tab === 'school_years') setActiveMenu('admin_school_years');
                    else if (tab === 'accounts') setActiveMenu('admin_accounts');
                    else if (tab === 'system_config' || tab === 'settings' || tab === 'backup' || tab === 'ai_config' || tab === 'firebase') {
                      setActiveMenu('admin_settings');
                    }
                  }}
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-medium">
                <p>Không có quyền truy cập chức năng này.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
