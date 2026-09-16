const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const search = `<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                   <LayoutDashboard className="w-8 h-8 text-emerald-600" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {allowedClasses.find(c => c.id === selectedClassId)?.name || 'Chưa chọn lớp'}
                 </h3>
                 <p className="text-slate-500">
                   {user?.homeroomClasses?.includes(selectedClassId) || allowedClasses.find(c => c.id === selectedClassId)?.homeroomTeacher === user?.fullName ? 'Giáo viên Chủ nhiệm' : 'Giáo viên Bộ môn'}
                 </p>
               </div>`;

const replace = `<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
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
               </div>`;
               
c = c.replace(search, replace);
fs.writeFileSync('src/components/TeacherView.tsx', c);
