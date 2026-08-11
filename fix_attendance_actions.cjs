const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const actionsHtml = `              {/* Attendance Actions */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Điểm danh
                  </span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                    title="Chọn ngày để điểm danh bù"
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => markAttendance(selectedStudent.id, 'present')} className={\`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'present' ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-500 hover:text-green-600'}\`} title="Có mặt"><UserCheck className="w-4 h-4"/> Có mặt</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'late')} className={\`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'late' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-yellow-500 hover:text-yellow-600'}\`} title="Đi trễ"><Clock className="w-4 h-4"/> Đi trễ</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'leave_early')} className={\`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'leave_early' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-600'}\`} title="Xin về"><LogOut className="w-4 h-4"/> Xin về</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'absent')} className={\`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[selectedStudent.id])) === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-600'}\`} title="Vắng mặt"><UserX className="w-4 h-4"/> Vắng</button>
                </div>
              </div>`;

const oldActionsHtml = `              {/* Attendance Actions */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Điểm danh hôm nay
                </span>
                <div className="flex gap-2">
                  <button onClick={() => markAttendance(selectedStudent.id, 'present')} className={\`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[new Date().toISOString().split('T')[0]]?.status || attendance[selectedStudent.id]) === 'present' ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-500 hover:text-green-600'}\`} title="Có mặt"><UserCheck className="w-4 h-4"/> Có mặt</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'late')} className={\`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[new Date().toISOString().split('T')[0]]?.status || attendance[selectedStudent.id]) === 'late' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-yellow-500 hover:text-yellow-600'}\`} title="Đi trễ"><Clock className="w-4 h-4"/> Đi trễ</button>
                  <button onClick={() => markAttendance(selectedStudent.id, 'absent')} className={\`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all \${(selectedStudent.attendanceRecords?.[new Date().toISOString().split('T')[0]]?.status || attendance[selectedStudent.id]) === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-600'}\`} title="Vắng mặt"><UserX className="w-4 h-4"/> Vắng</button>
                </div>
              </div>`;

content = content.replace(oldActionsHtml, actionsHtml);
fs.writeFileSync('src/components/TeacherStudents.tsx', content);
