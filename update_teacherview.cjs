const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const importSearch = "import TeacherSchedule from './TeacherSchedule';";
const importReplace = `import TeacherSchedule from './TeacherSchedule';
import AdminView from './AdminView';
import TeacherWeeklyPlan from './TeacherWeeklyPlan';
import TeacherLunchMenu from './TeacherLunchMenu';
import { AppSettings } from '../data';
import { ClipboardList, Utensils } from 'lucide-react';`;
c = c.replace(importSearch, importReplace);

const oldSig = `export default function TeacherView({ 
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
}) {`;

const newSig = `export default function TeacherView({ 
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
}) {`;

c = c.replace(oldSig, newSig);

const oldMenuItems = `  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'students', icon: Users, label: 'Quản lý học sinh' },
    { id: 'grades', icon: FileSpreadsheet, label: 'Quản lý điểm số' },
    { id: 'schedule', icon: CalendarIcon, label: 'Thời khóa biểu' },
  ];`;

const newMenuItems = `  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'students', icon: Users, label: 'Danh sách lớp' },
    { id: 'weekly_plan', icon: ClipboardList, label: 'Kế hoạch tuần' },
    { id: 'lunch_menu', icon: Utensils, label: 'Thực đơn ăn trưa' },
    // { id: 'grades', icon: FileSpreadsheet, label: 'Quản lý điểm số' },
    // { id: 'schedule', icon: CalendarIcon, label: 'Thời khóa biểu' },
  ];`;
  
c = c.replace(oldMenuItems, newMenuItems);

const oldSettingsBtn = `<button className="w-full flex items-center gap-4 px-3 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-medium transition-colors">`;
const newSettingsBtn = `<button onClick={() => setActiveMenu('settings')} className={\`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-colors \${activeMenu === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}\`}>`;

c = c.replace(oldSettingsBtn, newSettingsBtn);

const oldHeaderLabel = `{menuItems.find(m => m.id === activeMenu)?.label}`;
const newHeaderLabel = `{activeMenu === 'settings' ? 'Cấu hình' : menuItems.find(m => m.id === activeMenu)?.label}`;

c = c.replace(oldHeaderLabel, newHeaderLabel);

fs.writeFileSync('src/components/TeacherView.tsx', c);
