const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/import { GraduationCap, Calendar, Users, UserCircle, Shield, Loader2, LogOut, ArrowLeft } from 'lucide-react';/g, 
  "import { GraduationCap, Calendar, Users, UserCircle, Shield, Loader2, LogOut, ArrowLeft, KeyRound } from 'lucide-react';\nimport ChangePasswordModal from './components/ChangePasswordModal';");

c = c.replace(/const \[appMode, setAppMode\] = useState\<'portal' \| 'edu_manager' \| 'tkb'\>\('portal'\);/g, 
  "const [appMode, setAppMode] = useState<'portal' | 'edu_manager' | 'tkb'>('portal');\n  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);");

const headerButtons = `<button
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
            </button>`;

const newHeaderButtons = `<button
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
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="ml-2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
              title="Đổi mật khẩu"
            >
              <KeyRound className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">Đổi mật khẩu</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:inline">Đăng xuất</span>
            </button>`;

c = c.replace(headerButtons, newHeaderButtons);

const modalRender = `      {/* Main Content Area */}
      <main className="flex-1 relative">
        {isChangePasswordModalOpen && (
          <ChangePasswordModal 
            onClose={() => setIsChangePasswordModalOpen(false)}
            userRole={role as any}
            currentUser={users.find(u => u.id === loggedInUserId)}
            currentStudent={students.find(s => s.id === parentStudentId)}
          />
        )}
        {role === "admin" || role === "teacher" || role === "staff" ? (`

c = c.replace(/\{\/\* Main Content Area \*\/\}\n\s*<main className="flex-1 relative">\n\s*\{role === "admin" \|\| role === "teacher" \|\| role === "staff" \? \(/g, modalRender);

fs.writeFileSync('src/App.tsx', c);
