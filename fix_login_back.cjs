const fs = require('fs');
const file = 'src/components/Login.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import { Shield, BookOpen, UserCircle, GraduationCap, ArrowRight, Lock, User } from 'lucide-react';",
  "import { Shield, BookOpen, UserCircle, GraduationCap, ArrowRight, Lock, User, ArrowLeft } from 'lucide-react';"
);

code = code.replace(
  "  onLogin: (role: 'admin' | 'teacher' | 'parent', parentStudentId?: string, loggedInUserId?: string) => void\n}) {",
  "  onLogin: (role: 'admin' | 'teacher' | 'parent', parentStudentId?: string, loggedInUserId?: string) => void,\n  onBack?: () => void\n}) {"
);

code = code.replace(
  "  return (\n    <div className=\"min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4\">",
  "  return (\n    <div className=\"min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative\">\n      {onBack && (\n        <button \n          onClick={onBack}\n          className=\"absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium\"\n        >\n          <ArrowLeft className=\"w-5 h-5\" />\n          <span className=\"hidden sm:inline\">Về Portal</span>\n        </button>\n      )}"
);

fs.writeFileSync(file, code);
