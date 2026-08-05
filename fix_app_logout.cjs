const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import { GraduationCap, Users, UserCircle, Shield, Loader2, LogOut } from 'lucide-react';",
  "import { GraduationCap, Users, UserCircle, Shield, Loader2, LogOut, ArrowLeft } from 'lucide-react';"
);

const targetLogout = `            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Đăng xuất</span>
            </button>`;

const replaceLogout = `            <button
              onClick={() => {
                handleLogout();
                setAppMode('portal');
              }}
              className="ml-2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
              title="Về Portal"
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

code = code.replace(targetLogout, replaceLogout);
fs.writeFileSync(file, code);
