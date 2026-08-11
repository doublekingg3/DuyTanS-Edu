const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const quickAttendanceModalHtml = `      {quickAttendanceModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Điểm danh nhanh cả lớp
                </h3>
                <p className="text-sm text-slate-500 mt-1">Ngày: {new Date(attendanceDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <button onClick={() => setQuickAttendanceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              <div className="divide-y divide-slate-100">
                {students.map(student => {
                  const status = quickAttendanceState[student.id] || 'present';
                  return (
                    <div key={student.id} className="p-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {student.fullName.split(' ').pop()?.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 text-sm truncate">{student.fullName}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button 
                          onClick={() => setQuickAttendanceState(prev => ({...prev, [student.id]: 'present'}))}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${status === 'present' ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}\`}
                        >
                          Có mặt
                        </button>
                        <button 
                          onClick={() => setQuickAttendanceState(prev => ({...prev, [student.id]: 'late'}))}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${status === 'late' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}\`}
                        >
                          Trễ
                        </button>
                        <button 
                          onClick={() => setQuickAttendanceState(prev => ({...prev, [student.id]: 'leave_early'}))}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${status === 'leave_early' ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}\`}
                        >
                          Xin về
                        </button>
                        <button 
                          onClick={() => setQuickAttendanceState(prev => ({...prev, [student.id]: 'absent'}))}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${status === 'absent' ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}\`}
                        >
                          Vắng
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button 
                onClick={() => {
                  const newState = {};
                  students.forEach(s => newState[s.id] = 'present');
                  setQuickAttendanceState(newState);
                }} 
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
              >
                Chọn tất cả "Có mặt"
              </button>
              <div className="flex gap-3">
                <button onClick={() => setQuickAttendanceModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Hủy
                </button>
                <button onClick={handleSaveQuickAttendance} className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Lưu điểm danh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;

content = content.replace("    </div>\n  );\n}", quickAttendanceModalHtml + "\n    </div>\n  );\n}");

fs.writeFileSync('src/components/TeacherStudents.tsx', content);
