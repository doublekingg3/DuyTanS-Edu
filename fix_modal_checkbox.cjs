const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const tableHeader = `<thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">STT</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200">Họ và Tên</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200 text-center">Có mặt</th>
                    <th className="px-6 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200 w-1/3">Ghi chú (nếu vắng/trễ)</th>
                  </tr>
                </thead>`;

c = c.replace(/<thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">[\s\S]*?<\/thead>/, tableHeader);

const radioGroup = `<div className="flex items-center gap-4">
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
                          </div>`;

const singleCheckbox = `<div className="flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={record?.status === 'present'}
                                onChange={(e) => setQuickAttendanceRecords(prev => ({...prev, [student.id]: {...prev[student.id], status: e.target.checked ? 'present' : 'absent'}}))}
                                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 transition-colors"
                              />
                            </label>
                          </div>`;

c = c.replace(radioGroup, singleCheckbox);

// "Có nút bấm ok"
// Change "Lưu điểm danh" to "OK" to match literal instructions exactly
c = c.replace(/>\s*Lưu điểm danh\s*<\/button>/g, '>OK</button>');

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
