const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

c = c.replace(/selectedRole === 'admin' \|\| selectedRole === 'teacher'/g, "selectedRole === 'admin' || selectedRole === 'teacher' || selectedRole === 'staff'");

c = c.replace(/<BookOpen className="w-4 h-4" \/> Giáo viên\n            <\/button>\n            <button/g, 
`<BookOpen className="w-4 h-4" /> Giáo viên
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedRole('staff'); setError(''); }}
              className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 \${selectedRole === 'staff' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              <User className="w-4 h-4" /> Giáo vụ
            </button>
            <button`);

c = c.replace(/onLogin: \(role: 'admin' \| 'teacher' \| 'parent'/g, "onLogin: (role: 'admin' | 'teacher' | 'parent' | 'staff'");
c = c.replace(/useState\<'admin' \| 'teacher' \| 'parent'\>\('admin'\)/g, "useState<'admin' | 'teacher' | 'parent' | 'staff'>('admin')");

fs.writeFileSync('src/components/Login.tsx', c);
