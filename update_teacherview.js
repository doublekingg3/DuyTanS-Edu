import fs from 'fs';
let code = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

// Update import to include SchoolClass and UserAccount
code = code.replace(
  "import { Student } from '../data';",
  "import { Student, SchoolClass, UserAccount } from '../data';"
);

// Add props
code = code.replace(
  "  students,\n  onAddComment,",
  "  students,\n  classes,\n  user,\n  onAddComment,"
);

// Add prop types
code = code.replace(
  "  students: Student[],\n  onAddComment",
  "  students: Student[],\n  classes?: SchoolClass[],\n  user?: UserAccount,\n  onAddComment"
);

// Before returning, compute allowed classes
const addStateLogic = `
  const [activeMenu, setActiveMenu] = useState('overview');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Compute classes available to this teacher
  const allowedClasses = classes?.filter(c => 
    user?.homeroomClasses?.includes(c.id) || 
    user?.subjectClasses?.includes(c.id) ||
    c.homeroomTeacher === user?.fullName // fallback for old data
  ) || [];

  const [selectedClassId, setSelectedClassId] = useState(allowedClasses[0]?.id || '');

  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  const menuItems = [
`;

code = code.replace(
  "  const [activeMenu, setActiveMenu] = useState('students');\n  const [isSidebarHovered, setIsSidebarHovered] = useState(false);\n\n  const menuItems = [",
  addStateLogic.trim() + "\n"
);

// Replace the `<TeacherStudents ... />` props to use filteredStudents
code = code.replace(
  "<TeacherStudents \n            students={students}",
  "<TeacherStudents \n            students={filteredStudents}"
);

// Same for TeacherGrades
code = code.replace(
  "<TeacherGrades students={students}",
  "<TeacherGrades students={filteredStudents}"
);

// Add Class Selector UI to the header of the TeacherView main content area
const headerReplacement = `
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold font-display text-slate-800">
              {menuItems.find(m => m.id === activeMenu)?.label}
            </h2>
            <div className="h-6 w-px bg-slate-200"></div>
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
`;

code = code.replace(
  /\{\/\* Main Content \*\/\}\n\s*<div className="flex-1 overflow-auto">\n\s*<div className="p-8">/g,
  headerReplacement + '\n        <div className="p-8">\n'
);

// Replace overview content to just show "Chọn tab Quản lý học sinh hoặc Quản lý điểm số"
const overviewContent = `
        {activeMenu === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-1">{filteredStudents.length}</h3>
              <p className="text-slate-500">Học sinh trong lớp</p>
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
        )}
`;

code = code.replace(
  /\{activeMenu === 'overview' && \([\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">[\s\S]*?\}\)/,
  overviewContent.trim()
);


fs.writeFileSync('src/components/TeacherView.tsx', code);
