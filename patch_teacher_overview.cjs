const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(
  /import AdminDashboard from '\.\/AdminDashboard';/,
  "import AdminDashboard from './AdminDashboard';\nimport TeacherDashboard from './TeacherDashboard';"
);

const overviewSearch = `{activeMenu === 'overview' && role !== 'admin' && role !== 'staff' && (
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
                   <ClipboardList className="w-8 h-8 text-emerald-600" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Điểm danh hôm nay
                 </h3>
                 <p className="text-slate-500">
                   {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      const totalStudents = filteredStudents.length;
                      if (totalStudents === 0) return 'Không có dữ liệu';
                      const attended = filteredStudents.filter(s => s.attendanceRecords?.[today]?.status).length;
                      if (attended === 0) return 'Chưa điểm danh';
                      if (attended < totalStudents) return \`Đã điểm danh \${attended}/\${totalStudents}\`;
                      return 'Đã điểm danh xong';
                   })()}
                 </p>
               </div>
            </div>
          </div>
        )}`;

const overviewReplace = `{activeMenu === 'overview' && role !== 'admin' && role !== 'staff' && (
          <TeacherDashboard 
            classId={selectedClassId}
            className={allowedClasses.find(c => c.id === selectedClassId)?.name || ''}
            students={filteredStudents}
          />
        )}`;

c = c.replace(overviewSearch, overviewReplace);
fs.writeFileSync('src/components/TeacherView.tsx', c);
