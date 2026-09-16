const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

// 1. Fix login logic
const searchLogic = `    if (selectedRole === 'admin' || selectedRole === 'teacher' || selectedRole === 'staff') {
      const user = users.find(u => u.username === username && u.password === password && u.role === selectedRole);
      if (user) {
        onLogin(selectedRole, undefined, user.id);
      } else {
        setError(\`Tài khoản hoặc mật khẩu \${selectedRole} không đúng.\`);
      }
    }`;

const replaceLogic = `    if (selectedRole === 'teacher' || selectedRole === 'admin' || selectedRole === 'staff') {
      const user = users.find(u => u.username === username && u.password === password && ['admin', 'teacher', 'staff'].includes(u.role));
      if (user) {
        onLogin(user.role, undefined, user.id);
      } else {
        setError(\`Tài khoản hoặc mật khẩu không đúng.\`);
      }
    }`;
c = c.replace(searchLogic, replaceLogic);

// 2. Fix the tabs (remove Admin and Staff tabs)
const searchTabs = `            <button 
              type="button"
              onClick={() => { setSelectedRole('admin'); setError(''); }}
              className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 \${selectedRole === 'admin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedRole('teacher'); setError(''); }}
              className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 \${selectedRole === 'teacher' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              <BookOpen className="w-4 h-4" /> Giáo viên
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedRole('staff'); setError(''); }}
              className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 \${selectedRole === 'staff' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              <User className="w-4 h-4" /> Giáo vụ
            </button>`;

const replaceTabs = `            <button 
              type="button"
              onClick={() => { setSelectedRole('teacher'); setError(''); }}
              className={\`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 \${(selectedRole === 'teacher' || selectedRole === 'admin' || selectedRole === 'staff') ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              <BookOpen className="w-4 h-4" /> Giáo viên / Nhân viên
            </button>`;
c = c.replace(searchTabs, replaceTabs);

// 3. Fix initial state if it defaults to admin
c = c.replace(/useState\<'admin' \| 'teacher' \| 'parent' \| 'staff'\>\('admin'\);/g, "useState<'admin' | 'teacher' | 'parent' | 'staff'>('teacher');");

// 4. Update the "Gợi ý đăng nhập mẫu"
const searchHint = `{(selectedRole === 'admin' || selectedRole === 'teacher' || selectedRole === 'staff') && (
              <div className="text-center mt-4">
                <p className="text-xs text-slate-500">
                  Gợi ý đăng nhập mẫu:<br/>
                  Tài khoản: <strong>{selectedRole}</strong> / Mật khẩu: <strong>{selectedRole}</strong>
                </p>
              </div>
            )}`;

const replaceHint = `{(selectedRole === 'teacher' || selectedRole === 'admin' || selectedRole === 'staff') && (
              <div className="text-center mt-4">
                <p className="text-xs text-slate-500">
                  Gợi ý đăng nhập mẫu:<br/>
                  Tài khoản: <strong>admin</strong> / Mật khẩu: <strong>admin</strong>
                </p>
              </div>
            )}`;
c = c.replace(searchHint, replaceHint);

fs.writeFileSync('src/components/Login.tsx', c);
