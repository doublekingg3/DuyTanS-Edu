import React, { useState } from 'react';
import { Student, SchoolClass, UserAccount, SchoolYear } from '../data';
import { LayoutDashboard, Users, FileSpreadsheet, Calendar as CalendarIcon, Settings } from 'lucide-react';
import TeacherStudents from './TeacherStudents';
import TeacherGrades from './TeacherGrades';

export default function TeacherView({ 
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
    (user?.homeroomClasses?.includes(c.id) || 
    user?.subjectClasses?.includes(c.id) ||
    c.homeroomTeacher === user?.fullName) && // fallback for old data
    (!selectedYearId || c.schoolYearId === selectedYearId)
  ) || [];

  const [selectedClassId, setSelectedClassId] = useState(allowedClasses[0]?.id || '');

  React.useEffect(() => {
    if (allowedClasses.length > 0 && !allowedClasses.find(c => c.id === selectedClassId)) {
      setSelectedClassId(allowedClasses[0].id);
    }
  }, [selectedYearId, classes, user]);

  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  const menuItems = [

    { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'students', icon: Users, label: 'Quản lý học sinh' },
    { id: 'grades', icon: FileSpreadsheet, label: 'Quản lý điểm số' },
    { id: 'schedule', icon: CalendarIcon, label: 'Thời khóa biểu' },
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
          <div className="p-4 border-t border-slate-100">
            <button className="w-full flex items-center gap-4 px-3 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium transition-colors">
              <Settings className="w-5 h-5 flex-shrink-0 text-slate-400" />
              <span className={`transition-opacity duration-300 ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
                Cấu hình
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-display text-slate-800">
              {menuItems.find(m => m.id === activeMenu)?.label}
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
                        {c.name} {user?.homeroomClasses?.includes(c.id) || c.homeroomTeacher === user?.fullName ? '(GVCN)' : '(GVBM)'}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có lớp phân công</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
        {activeMenu === 'overview' && (
          <div className="p-8 h-full">
            <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">Tổng quan lớp {allowedClasses.find(c => c.id === selectedClassId)?.name || ''}</h2>
            <p className="text-slate-500 mb-6 font-medium">Năm học: {schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId))?.name || 'Không xác định'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                   <Users className="w-8 h-8 text-indigo-600" />
                 </div>
                 <h3 className="text-3xl font-bold text-slate-800 mb-1">{filteredStudents.length}</h3>
                 <p className="text-slate-500 font-medium">Học sinh trong lớp</p>
               </div>
               
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                   <LayoutDashboard className="w-8 h-8 text-emerald-600" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {allowedClasses.find(c => c.id === selectedClassId)?.name || 'Chưa chọn lớp'}
                 </h3>
                 <p className="text-slate-500">
                   {user?.homeroomClasses?.includes(selectedClassId) || allowedClasses.find(c => c.id === selectedClassId)?.homeroomTeacher === user?.fullName ? 'Giáo viên Chủ nhiệm' : 'Giáo viên Bộ môn'}
                 </p>
               </div>
            </div>
          </div>
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
        {activeMenu === 'schedule' && (
          <div className="p-8 h-full flex items-center justify-center text-slate-400 flex-col">
            <CalendarIcon className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Tính năng Thời khóa biểu đang được cập nhật</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
