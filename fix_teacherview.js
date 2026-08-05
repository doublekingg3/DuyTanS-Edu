import fs from 'fs';
let code = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const overviewContent = `
        {activeMenu === 'overview' && (
          <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold font-display text-slate-800 mb-6">Tổng quan lớp {allowedClasses.find(c => c.id === selectedClassId)?.name || ''}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
`;

code = code.replace(
  /\{activeMenu === 'overview' && \([\s\S]*?\}\)/,
  overviewContent.trim()
);

const headerReplacement = `
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-display text-slate-800">
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
        
        <div className="flex-1 overflow-y-auto">
`;

code = code.replace(
  /\{\/\* Main Content Area \*\/\}\n\s*<div className="flex-1 overflow-hidden relative">/,
  headerReplacement.trim()
);

code = code.replace(
  "        {activeMenu === 'students' && (",
  "        </div>\n        {activeMenu === 'students' && ("
);

// We need to fix the div closing for the new flex-1 overflow-y-auto. 
// Actually, I put the </div> before {activeMenu === 'students', let me just place it correctly at the end.
// I will just let the original div be, and add the header.

