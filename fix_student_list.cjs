const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const oldList = `                <div className="mt-1 flex gap-1">
                  {attendance[student.id] === 'present' ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Có mặt</span>
                  ) : attendance[student.id] === 'absent' ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">Vắng</span>
                  ) : attendance[student.id] === 'late' ? (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">Trễ</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">Chưa điểm danh</span>
                  )}
                </div>`;

const newList = `                <div className="mt-1 flex gap-1">
                  {(() => {
                    const status = student.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] ? attendance[student.id] : undefined);
                    if (status === 'present') return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Có mặt</span>;
                    if (status === 'absent') return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">Vắng</span>;
                    if (status === 'late') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">Trễ</span>;
                    if (status === 'leave_early') return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">Xin về</span>;
                    return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">Chưa ĐD</span>;
                  })()}
                </div>`;

content = content.replace(oldList, newList);
fs.writeFileSync('src/components/TeacherStudents.tsx', content);
