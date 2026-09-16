import React, { useState } from 'react';
import { Student, SchoolClass, UserAccount, SchoolYear, ClassSchedule, SchedulePeriod } from '../data';
import { LayoutDashboard, Users, FileSpreadsheet, Calendar as CalendarIcon, Settings, Building2, Shield, BarChart2 } from 'lucide-react';
import TeacherStudents from './TeacherStudents';
import TeacherGrades from './TeacherGrades';
import TeacherSchedule from './TeacherSchedule';
import AdminView from './AdminView';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import TeacherWeeklyPlan from './TeacherWeeklyPlan';
import TeacherLunchMenu from './TeacherLunchMenu';
import { AppSettings } from '../data';
import { ClipboardList, Utensils } from 'lucide-react';

export default function TeacherView({ 
  role,
  users,
  settings,
  students, 
  classes, 
  user,
  schoolYears, 
  onAddComment, 
  onSendNotification,
  onAddStudent,
  onAddMultipleStudents,
  onEditStudent,
  onDeleteStudent,
  onUpdateGrade,
  onUpdateMultipleGrades
}: { 
  role?: string,
  users?: UserAccount[],
  settings?: AppSettings,
  students: Student[],
  classes?: SchoolClass[],
  user?: UserAccount,
  schoolYears?: SchoolYear[],
  onAddComment: (studentId: string, text: string) => void,
  onSendNotification: (studentId: string, title: string, message: string) => void,
  onAddStudent: (student: Student) => void,
  onAddMultipleStudents?: (students: Student[]) => void,
  onEditStudent: (student: Student) => void,
  onDeleteStudent: (studentId: string) => void,
  onUpdateGrade: (studentId: string, field: string, value: string | number) => void,
  onUpdateMultipleGrades: (updates: { studentId: string, field: string, newValue: string | number | any }[]) => void
}) {
const [activeMenu, setActiveMenu] = useState('overview');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Compute classes available to this teacher
  const [selectedYearId, setSelectedYearId] = useState(schoolYears && schoolYears.length > 0 ? schoolYears[schoolYears.length - 1].id : '');
  
  const allowedClasses = classes?.filter(c => 
    (role === 'admin' || role === 'staff' || 
     user?.homeroomClasses?.includes(c.id) || 
     user?.subjectClasses?.includes(c.id) ||
     c.homeroomTeacher === user?.fullName) &&
    (!selectedYearId || c.schoolYearId === selectedYearId || (!c.schoolYearId && selectedYearId === (schoolYears && schoolYears.length > 0 ? schoolYears[schoolYears.length - 1].id : '')))
  ) || [];

  const [selectedClassId, setSelectedClassId] = useState(allowedClasses[0]?.id || '');

  React.useEffect(() => {
    if (allowedClasses.length > 0 && !allowedClasses.find(c => c.id === selectedClassId)) {
      setSelectedClassId(allowedClasses[0].id);
    }
  }, [selectedYearId, classes, user]);

  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  const adminMenuItems = role === 'admin' ? [
    { id: "admin_classes", icon: Building2, label: "Quản lý Lớp học" },
    { id: "admin_school_years", icon: CalendarIcon, label: "Quản lý Năm học" },
    { id: "admin_accounts", icon: Shield, label: "Tài khoản & Quyền" },
        { id: "admin_settings", icon: Settings, label: "Cấu hình hệ thống" },
  ] : [];

  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' ? [{ id: "schedule", icon: CalendarIcon, label: "Thời khoá biểu" }] : []),
    ...(role !== 'staff' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),
    { id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" },
    ...adminMenuItems
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      {/* Sidebar - Hover to expand */}
      <div className="relative h-full flex-shrink-0 z-20" style={{ width: '64px' }}>
        <div 
          className={`absolute top-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col whitespace-nowrap overflow-hidden ${isSidebarHovered ? 'w-64 shadow-xl' : 'w-[64px]'}`}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          <div className="flex-1 py-6 space-y-2 px-3">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'}`}
                  title={!isSidebarHovered ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`transition-opacity duration-300 ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-display text-slate-800">
              {activeMenu === 'settings' ? 'Cấu hình' : menuItems.find(m => m.id === activeMenu)?.label}
            </h2>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-500 hidden sm:block">Năm học:</label>
                <select 
                  value={selectedYearId} 
                  onChange={e => setSelectedYearId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                >
                  <option value="">Tất cả</option>
                  {schoolYears?.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-500">Lớp:</label>
                <select 
                  value={selectedClassId} 
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                >
                  {allowedClasses.length > 0 ? (
                    allowedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {(role === 'admin' || role === 'staff') ? '' : (user?.homeroomClasses?.includes(c.id) || c.homeroomTeacher === user?.fullName ? '(GVCN)' : '(GVBM)')}
                      </option>
                    ))
                  ) : (
                    <option value="">{(role === 'admin' || role === 'staff') ? 'Chưa có lớp nào' : 'Không có lớp phân công'}</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
        {activeMenu === 'overview' && (role === 'admin' || role === 'staff') && (
          <AdminDashboard classes={classes} students={students} schoolYearId={selectedYearId} />
        )}
        {activeMenu === 'overview' && role !== 'admin' && role !== 'staff' && (
          <TeacherDashboard 
            classId={selectedClassId}
            className={allowedClasses.find(c => c.id === selectedClassId)?.name || ''}
            students={filteredStudents}
          />
        )}
        {activeMenu === 'schedule' && (
          <TeacherSchedule classId={selectedClassId} />
        )}
        {activeMenu === 'students' && (
          <TeacherStudents 
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
          />
        )}
        {activeMenu === 'lunch_menu' && (
          <TeacherLunchMenu classId={selectedClassId} role={role} schoolYearName={schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId || selectedYearId))?.name || 'Không xác định'} />
        )}
        {activeMenu.startsWith('admin_') && (
          role === 'admin' && users && settings ? (
             <div className="p-6 h-full overflow-auto">
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
                                        undefined
                  }
                />
             </div>
          ) : (
             <div className="p-8"><p>Không có quyền truy cập.</p></div>
          )
        )}
        </div>
      </div>
    </div>
  );
}
