const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const emptyState = `        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Search className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Chọn học sinh để quản lý thông tin</p>
          </div>
        )}`;

const newEmptyState = `        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                <PieChartIcon className="w-6 h-6 text-indigo-600" />
                Thống kê điểm danh
              </h2>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-slate-500">Ngày:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                />
              </div>
              <div className="h-64 w-full relative">
                {(() => {
                  const presentCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'present').length;
                  const lateCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'late').length;
                  const leaveEarlyCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'leave_early').length;
                  const absentCount = students.filter(s => (s.attendanceRecords?.[attendanceDate]?.status || (attendanceDate === new Date().toISOString().split('T')[0] && attendance[s.id])) === 'absent').length;
                  const notTrackedCount = students.length - presentCount - lateCount - leaveEarlyCount - absentCount;

                  const pieData = [
                    { name: 'Có mặt', value: presentCount, color: '#22c55e' },
                    { name: 'Đi trễ', value: lateCount, color: '#eab308' },
                    { name: 'Xin về', value: leaveEarlyCount, color: '#f97316' },
                    { name: 'Vắng mặt', value: absentCount, color: '#ef4444' },
                    { name: 'Chưa ĐD', value: notTrackedCount, color: '#cbd5e1' }
                  ].filter(d => d.value > 0);

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => [\`\${value} học sinh\`, 'Số lượng']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex flex-col items-center opacity-60">
              <Search className="w-10 h-10 mb-3 text-slate-400" />
              <p className="text-base font-medium">Chọn học sinh bên trái để xem và cập nhật thông tin</p>
            </div>
          </div>
        )}`;

content = content.replace(emptyState, newEmptyState);
fs.writeFileSync('src/components/TeacherStudents.tsx', content);
