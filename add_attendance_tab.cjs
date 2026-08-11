const fs = require('fs');
let content = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

const attendanceContent = `        {activeTab === 'attendance' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600" />
                  Hoạt động & Điểm danh
                </h3>
              </div>
              <div className="p-6">
                {!student.attendanceRecords || Object.keys(student.attendanceRecords).length === 0 ? (
                  <div className="text-center text-slate-500 py-8">Chưa có dữ liệu điểm danh.</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(student.attendanceRecords)
                      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                      .map(([date, record]) => (
                        <div key={date} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-slate-500 uppercase">{new Date(date).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                              <span className="text-lg font-bold text-indigo-600 leading-none">{new Date(date).getDate()}</span>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 mb-1">{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                              {record.reason && (
                                <div className="text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-100 italic">
                                  <span className="font-medium not-italic text-slate-700 mr-1">Lý do:</span>
                                  {record.reason}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {record.status === 'present' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-lg text-sm border border-green-200">
                                <UserCheck className="w-4 h-4" /> Có mặt
                              </span>
                            ) : record.status === 'absent' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-sm border border-red-200">
                                <UserX className="w-4 h-4" /> Vắng mặt
                              </span>
                            ) : record.status === 'leave_early' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 font-bold rounded-lg text-sm border border-orange-200">
                                Xin về
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 font-bold rounded-lg text-sm border border-yellow-200">
                                <Clock className="w-4 h-4" /> Đi trễ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}`;

content = content.replace("{activeTab === 'schedule' && (", attendanceContent + '\n\n        {activeTab === \'schedule\' && (');
fs.writeFileSync('src/components/ParentView.tsx', content);
