import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Update initial state of userFormData
code = code.replace(
  "  const [userFormData, setUserFormData] = useState({",
  "  const [userFormData, setUserFormData] = useState<{username: string, password: string, fullName: string, role: 'admin'|'teacher', homeroomClasses: string[], subjectClasses: string[]}>({"
);

code = code.replace(
  "    role: 'teacher' as 'admin' | 'teacher'",
  "    role: 'teacher' as 'admin' | 'teacher',\n    homeroomClasses: [],\n    subjectClasses: []"
);

// Update all setUserFormData calls
code = code.replace(
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher' });",
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', homeroomClasses: [], subjectClasses: [] });"
);
code = code.replace(
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher' });",
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', homeroomClasses: [], subjectClasses: [] });"
);
code = code.replace(
  "setUserFormData({ username: u.username, password: '', fullName: u.fullName, role: u.role });",
  "setUserFormData({ username: u.username, password: '', fullName: u.fullName, role: u.role, homeroomClasses: u.homeroomClasses || [], subjectClasses: u.subjectClasses || [] });"
);

// 2. Update handleSaveUser to include these fields
const saveUserData = `
    const userData: any = {
      id: userId,
      username: userFormData.username,
      fullName: userFormData.fullName,
      role: userFormData.role,
      homeroomClasses: userFormData.role === 'teacher' ? userFormData.homeroomClasses : [],
      subjectClasses: userFormData.role === 'teacher' ? userFormData.subjectClasses : []
    };
`;
code = code.replace(
  /const userData: any = \{[\s\S]*?role: userFormData.role\n\s*\};/,
  saveUserData.trim()
);

// 3. Add UI for these fields inside the modal when role === 'teacher'
const newUI = `
              </div>
              {userFormData.role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lớp Chủ nhiệm (GVCN)</label>
                    <select
                      multiple
                      value={userFormData.homeroomClasses}
                      onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setUserFormData({...userFormData, homeroomClasses: values});
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều lớp</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lớp Bộ môn (GVBM)</label>
                    <select
                      multiple
                      value={userFormData.subjectClasses}
                      onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setUserFormData({...userFormData, subjectClasses: values});
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều lớp</p>
                  </div>
                </>
              )}
            </div>
`;
code = code.replace(
  /\s*<\/div>\n\s*<\/div>\n\s*<div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">/,
  newUI + '\n                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">'
);

fs.writeFileSync('src/components/AdminView.tsx', code);
