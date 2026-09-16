const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

// 1. Remove the fallback to 'present' in the main table radio buttons
c = c.replace(/checked=\{statusVal === 'present' \|\| !statusVal\}/g, "checked={statusVal === 'present'}");

// 2. Add state for quick attendance modal
const stateRegex = /const \[attendanceDate, setAttendanceDate\] = useState<string>\(new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);/g;
const stateReplacement = `const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isQuickAttendanceModalOpen, setIsQuickAttendanceModalOpen] = useState(false);
  const [quickAttendanceRecords, setQuickAttendanceRecords] = useState<Record<string, {status: 'present' | 'absent' | 'late' | 'leave_early', reason: string}>>({});`;

c = c.replace(stateRegex, stateReplacement);

// 3. Add the quick attendance button next to the date picker
const datePickerRegex = /<input\s*type="date"\s*className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700 shadow-sm"\s*value=\{attendanceDate\}\s*onChange=\{\(e\) => setAttendanceDate\(e\.target\.value\)\}\s*\/>/;
const datePickerReplacement = `<input 
              type="date" 
              className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700 shadow-sm"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
            <button
              onClick={() => {
                const initial: Record<string, any> = {};
                filteredStudents.forEach(s => {
                  const existing = s.attendanceRecords?.[attendanceDate];
                  initial[s.id] = {
                    status: existing?.status || 'present',
                    reason: existing?.reason || ''
                  };
                });
                setQuickAttendanceRecords(initial);
                setIsQuickAttendanceModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Điểm danh nhanh
            </button>`;
c = c.replace(datePickerRegex, datePickerReplacement);

// 4. Add the modal at the end of the return statement
const modalCode = `
      {/* Quick Attendance Modal */}
      {isQuickAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Điểm danh nhanh - {new Date(attendanceDate).toLocaleDateString('vi-VN')}</h3>
              <button onClick={() => setIsQuickAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">STT</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">Họ và Tên</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">Trạng thái</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200 w-1/3">Lý do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const record = quickAttendanceRecords[student.id];
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-slate-500">{idx + 1}</td>
                        <td className="px-6 py-3 font-medium text-slate-800">{student.fullName}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={\`quick-status-\${student.id}\`}
                                checked={record?.status === 'present'}
                                onChange={() => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], status: 'present'}}))}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
                              />
                              <span className="text-sm text-slate-700">Có mặt</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={\`quick-status-\${student.id}\`}
                                checked={record?.status === 'absent'}
                                onChange={() => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], status: 'absent'}}))}
                                className="w-4 h-4 text-red-600 focus:ring-red-600"
                              />
                              <span className="text-sm text-slate-700">Vắng</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={\`quick-status-\${student.id}\`}
                                checked={record?.status === 'late'}
                                onChange={() => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], status: 'late'}}))}
                                className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-sm text-slate-700">Trễ</span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <input 
                            type="text" 
                            placeholder="Nhập lý do..."
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={record?.reason || ''}
                            onChange={(e) => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], reason: e.target.value}}))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsQuickAttendanceModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  try {
                    const batch = writeBatch(db);
                    filteredStudents.forEach(student => {
                      const record = quickAttendanceRecords[student.id];
                      if (record) {
                        const studentRef = doc(db, 'students', student.id);
                        const currentRecords = student.attendanceRecords || {};
                        const updatedRecords = {
                          ...currentRecords,
                          [attendanceDate]: { 
                            status: record.status, 
                            time: new Date().toISOString(), 
                            reason: record.reason 
                          }
                        };
                        batch.set(studentRef, { attendanceRecords: updatedRecords }, { merge: true });
                      }
                    });
                    await batch.commit();
                    showAlert('Điểm danh thành công!', 'success');
                    setIsQuickAttendanceModalOpen(false);
                  } catch (e) {
                    console.error(e);
                    showAlert('Lỗi khi lưu điểm danh', 'error');
                  }
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Lưu điểm danh
              </button>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace(/    <\/div>\n  \);\n\}\n/g, modalCode + "\n    </div>\n  );\n}\n");

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
