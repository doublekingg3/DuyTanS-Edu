import React, { useMemo, useState } from 'react';
import { Users, UserX, Clock, TrendingUp, Calendar, BarChart2, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Student, SchoolClass } from '../data';

interface AdminDashboardProps {
  classes: SchoolClass[];
  students: Student[];
  schoolYearId: string;
  selectedClassId?: string;
  onSelectClass?: (classId: string) => void;
  onNavigateToAttendance?: (classId?: string) => void;
}

export default function AdminDashboard({ 
  classes, 
  students, 
  schoolYearId,
  selectedClassId,
  onSelectClass,
  onNavigateToAttendance
}: AdminDashboardProps) {
  const [selectedGrade, setSelectedGrade] = useState<'all' | '6' | '7' | '8' | '9'>('all');

  // Lấy danh sách lớp thuộc năm học đang chọn
  const currentClasses = useMemo(() => {
    return classes.filter(c => !schoolYearId || c.schoolYearId === schoolYearId);
  }, [classes, schoolYearId]);

  const currentClassIds = new Set(currentClasses.map(c => c.id));
  
  const currentStudents = useMemo(() => {
    return students.filter(s => currentClassIds.has(s.classId));
  }, [students, currentClassIds]);

  const today = new Date().toISOString().split('T')[0];

  // Thống kê điểm danh hôm nay
  const todayStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let absentP = 0;
    let absentKP = 0;
    let late = 0;
    
    currentStudents.forEach(s => {
      const record = s.attendanceRecords?.[today];
      if (record) {
        if (record.status === 'present') present++;
        else if (record.status === 'absent') {
          absent++;
          if (record.reason?.toLowerCase().includes('phép') || record.reason?.toLowerCase().includes('p')) {
            absentP++;
          } else {
            absentKP++;
          }
        }
        else if (record.status === 'late' || record.status === 'leave_early') late++;
      }
    });

    if (present === 0 && absent === 0 && late === 0 && currentStudents.length > 0) {
      present = currentStudents.length;
      absent = 0;
      absentP = 0;
      absentKP = 0;
      late = 0;
    }

    const presentPercent = currentStudents.length > 0 
      ? Math.round((present / currentStudents.length) * 100) 
      : 100;

    return { present, absent, absentP, absentKP, late, total: currentStudents.length, presentPercent };
  }, [currentStudents, today]);

  // Thống kê theo từng lớp
  const classStats = useMemo(() => {
    return currentClasses.map(c => {
      const classStudents = currentStudents.filter(s => s.classId === c.id);
      let present = 0, absent = 0, late = 0;
      
      classStudents.forEach(s => {
        const record = s.attendanceRecords?.[today];
        if (record) {
          if (record.status === 'present') present++;
          else if (record.status === 'absent') absent++;
          else if (record.status === 'late' || record.status === 'leave_early') late++;
        }
      });

      if (present === 0 && absent === 0 && late === 0 && classStudents.length > 0) {
        present = classStudents.length;
      }

      const total = classStudents.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;

      // Extract room
      let room = 'Phòng 101';
      if (c.name.startsWith('6')) room = c.name.includes('B') ? 'Phòng 203' : 'Phòng 201';
      else if (c.name.startsWith('7')) room = 'Phòng A2.01';
      else if (c.name.startsWith('8')) room = c.name.includes('E') ? 'Phòng B2.01' : 'Phòng B1.01';
      else if (c.name.startsWith('9')) room = 'Phòng 302';

      return {
        id: c.id,
        name: c.name,
        room,
        homeroomTeacher: c.homeroomTeacher || 'Chưa phân công',
        total,
        present,
        absent,
        late,
        rate
      };
    });
  }, [currentClasses, currentStudents, today]);

  // Filtered classes based on selectedGrade tab
  const filteredClassStats = useMemo(() => {
    if (selectedGrade === 'all') return classStats;
    return classStats.filter(c => c.name.startsWith(selectedGrade));
  }, [classStats, selectedGrade]);

  const totalAbsentInFilter = useMemo(() => {
    return filteredClassStats.reduce((acc, c) => acc + c.absent, 0);
  }, [filteredClassStats]);

  // Weekly data
  const weeklyData = [
    { week: 'Tuần 1', present: 98, absent: 1, late: 1 },
    { week: 'Tuần 2', present: 96, absent: 2, late: 2 },
    { week: 'Tuần 3', present: 99, absent: 1, late: 0 },
    { week: 'Tuần 4', present: 97, absent: 2, late: 1 },
    { week: 'Tuần 5 (Hiện tại)', present: todayStats.presentPercent, absent: 100 - todayStats.presentPercent, late: 0 }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f0fdfa]/40 min-h-full">
      {/* Top Banner Card */}
      <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-500 shadow-xs">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Tổng Thể Số Học Sinh Vắng Của Các Lớp
              </h2>
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                {todayStats.absent} HS vắng
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Thống kê sĩ số, số lượng học sinh có mặt, vắng mặt (có phép & không phép) và đi trễ trên toàn trường hôm nay
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Grade filter segmented control */}
          <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs font-medium text-slate-600">
            {(['all', '6', '7', '8', '9'] as const).map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGrade === grade
                    ? 'bg-white text-teal-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grade === 'all' ? 'Toàn trường' : `Khối ${grade}`}
              </button>
            ))}
          </div>

          {/* Sổ điểm danh chi tiết button */}
          <button
            onClick={() => onNavigateToAttendance?.()}
            className="bg-teal-gradient hover:opacity-95 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Sổ điểm danh chi tiết</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng sĩ số */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm shadow-teal-500/5 relative">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
            TỔNG SĨ SỐ
          </p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-800">{todayStats.total}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="text-xs text-slate-500">
            Theo dõi {currentClasses.length} lớp học
          </p>
        </div>

        {/* Card 2: Đang có mặt */}
        <div className="bg-[#f0fdfa] rounded-[20px] p-5 border border-[#5eead4]/60 shadow-sm shadow-teal-500/5 relative">
          <p className="text-xs font-bold text-teal-700 tracking-wider uppercase mb-2">
            ĐANG CÓ MẶT
          </p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-teal-700">
              {todayStats.present}
            </span>
            <span className="text-xs font-semibold text-teal-600">
              ({todayStats.presentPercent}%)
            </span>
          </div>
          <p className="text-xs text-teal-700 font-medium">
            Hiện diện trên lớp đầy đủ
          </p>
        </div>

        {/* Card 3: Tổng số HS vắng */}
        <div className="bg-white rounded-[20px] p-5 border border-rose-100 shadow-sm shadow-rose-500/5 relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-rose-600 tracking-wider uppercase">
              TỔNG SỐ HS VẮNG
            </p>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-rose-600">{todayStats.absent}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="text-xs text-rose-500 font-medium">
            {todayStats.absentP} có phép (P) • {todayStats.absentKP} không phép (KP)
          </p>
        </div>

        {/* Card 4: Đi học trễ */}
        <div className="bg-[#fffbeb]/60 rounded-[20px] p-5 border border-amber-200/80 shadow-sm relative">
          <p className="text-xs font-bold text-amber-700 tracking-wider uppercase mb-2">
            ĐI HỌC TRỄ
          </p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-amber-700">{todayStats.late}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="text-xs text-amber-700 font-medium">
            Đã ghi nhận vào sổ theo dõi
          </p>
        </div>
      </div>

      {/* Two Column Layout: Table & Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bảng thống kê chi tiết từng lớp (7 cols) */}
        <div className="xl:col-span-7 bg-white rounded-[20px] border border-teal-100 shadow-sm shadow-teal-500/5 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wide">
                BẢNG THỐNG KÊ CHI TIẾT TỪNG LỚP
              </h3>
            </div>
            <span className="text-xs text-slate-400 italic">
              Nhấp "Điểm danh" để chuyển đến lớp
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs">
                <tr>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white whitespace-nowrap">LỚP</th>
                  <th className="hidden md:table-cell px-4 py-3.5 text-white whitespace-nowrap">GVCN</th>
                  <th className="px-2 sm:px-3 py-3 sm:py-3.5 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                  <th className="px-2 sm:px-3 py-3 sm:py-3.5 text-center text-white whitespace-nowrap">CÓ MẶT</th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-center text-white whitespace-nowrap">VẮNG</th>
                  <th className="hidden lg:table-cell px-3 py-3.5 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                  <th className="hidden sm:table-cell px-3 py-3.5 text-center text-white whitespace-nowrap">CHUYÊN CẦN</th>
                  <th className="px-2.5 sm:px-4 py-3 sm:py-3.5 text-center text-white whitespace-nowrap">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredClassStats.length > 0 ? (
                  filteredClassStats.map(c => {
                    const isSelected = selectedClassId === c.id;
                    return (
                      <tr 
                        key={c.id} 
                        className={`hover:bg-[#f0fdfa]/40 transition-colors ${
                          isSelected ? 'bg-teal-50/30' : ''
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div>
                              <div className="font-bold text-slate-800 text-xs sm:text-sm">{c.name}</div>
                              <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal">{c.room}</div>
                            </div>
                            {isSelected && (
                              <span className="bg-teal-gradient text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs shrink-0">
                                Đang chọn
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3.5 text-xs text-slate-600 font-medium">
                          {c.homeroomTeacher}
                        </td>
                        <td className="px-2 sm:px-3 py-2.5 sm:py-3.5 text-center text-slate-800 font-semibold text-xs sm:text-sm">
                          {c.total}
                        </td>
                        <td className="px-2 sm:px-3 py-2.5 sm:py-3.5 text-center text-teal-700 font-bold text-xs sm:text-sm">
                          {c.present}
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3.5 text-center">
                          {c.absent > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                              {c.absent}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                              Không
                            </span>
                          )}
                        </td>
                        <td className="hidden lg:table-cell px-3 py-3.5 text-center text-slate-400">
                          {c.late > 0 ? (
                            <span className="text-amber-600 font-bold">{c.late}</span>
                          ) : (
                            '0'
                          )}
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3.5 text-center font-bold text-slate-800">
                          {c.rate}%
                        </td>
                        <td className="px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              onSelectClass?.(c.id);
                              onNavigateToAttendance?.(c.id);
                            }}
                            className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-teal-300 text-teal-700 bg-white hover:bg-teal-50 hover:border-teal-400 font-semibold text-xs transition-colors shadow-2xs"
                          >
                            Điểm danh
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      Không có lớp nào thuộc khối đang chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Biểu đồ so sánh các lớp (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-[20px] border border-teal-100 shadow-sm shadow-teal-500/5 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wide">
                  BIỂU ĐỒ SO SÁNH CÁC LỚP
                </h3>
              </div>
              <span className="text-xs text-slate-400">Có mặt vs Vắng mặt</span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={filteredClassStats} 
                  margin={{ top: 15, right: 10, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6FFFA" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11 }} 
                    allowDecimals={false}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f0fdfa' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #ccfbf1', 
                      boxShadow: '0 4px 12px rgba(13,148,136,0.1)' 
                    }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="present" name="Có mặt" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="absent" name="Vắng mặt" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="late" name="Đi trễ" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Khối đang lọc: <strong className="text-teal-700 font-semibold">{selectedGrade === 'all' ? 'Toàn trường' : `Khối ${selectedGrade}`}</strong>
            </span>
            <span>
              Tổng vắng: <strong className="text-rose-600 font-semibold">{totalAbsentInFilter} HS</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Trend Analysis Section (Retained for completeness) */}
      <div className="bg-white rounded-[20px] border border-teal-100 shadow-sm shadow-teal-500/5 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              Xu hướng Chuyên cần (5 Tuần gần nhất)
            </h3>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6FFFA" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={[80, 100]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid #ccfbf1', boxShadow: '0 4px 12px rgba(13,148,136,0.1)' }}
              />
              <Area type="monotone" dataKey="present" name="Tỷ lệ có mặt (%)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTeal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
