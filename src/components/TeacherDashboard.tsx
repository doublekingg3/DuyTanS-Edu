import React, { useMemo, useState, useEffect } from 'react';
import { Users, UserX, Clock, AlertTriangle, TrendingUp, TrendingDown, Calendar, BarChart2, ClipboardList, CheckCircle, FileText, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Student } from '../data';

interface TeacherDashboardProps {
  classId: string;
  className: string;
  students: Student[];
}

export default function TeacherDashboard({ classId, className, students }: TeacherDashboardProps) {
  const today = new Date().toISOString().split('T')[0];

  const todayStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let notMarked = 0;
    
    students.forEach(s => {
      const record = s.attendanceRecords?.[today];
      if (record) {
        if (record.status === 'present') present++;
        else if (record.status === 'absent') absent++;
        else if (record.status === 'late' || record.status === 'leave_early') late++;
      } else {
        notMarked++;
      }
    });

    return { present, absent, late, notMarked, total: students.length };
  }, [students, today]);

  // Data for weekly comparison (mock for visual)
  const weeklyData = [
    { week: 'Tuần 1', present: 95, absent: 2, late: 3 },
    { week: 'Tuần 2', present: 93, absent: 4, late: 3 },
    { week: 'Tuần 3', present: 97, absent: 1, late: 2 },
    { week: 'Tuần 4', present: 90, absent: 5, late: 5 },
    { week: 'Tuần 5 (HT)', present: todayStats.total ? (todayStats.present / todayStats.total) * 100 : 0, absent: todayStats.total ? (todayStats.absent / todayStats.total) * 100 : 0, late: todayStats.total ? (todayStats.late / todayStats.total) * 100 : 0 }
  ].map(d => ({
    week: d.week,
    'Có mặt (%)': Number(d.present.toFixed(1)),
    'Vắng (%)': Number(d.absent.toFixed(1)),
    'Đi trễ (%)': Number(d.late.toFixed(1))
  }));

  const [tasks, setTasks] = useState<string[]>([]);
  useEffect(() => {
    // Giả lập load dữ liệu realtime kế hoạch tuần theo classId
    setTasks([
      'Chào cờ đầu tuần, sinh hoạt chủ nhiệm phổ biến kế hoạch tuần',
      'Kiểm tra sĩ số, giờ giấc nề nếp và tác phong đồng phục chuẩn Duy Tân',
      `Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày (${className || ''})`
    ]);
  }, [classId, className]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50/50">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-800 tracking-tight mb-2">Tổng quan lớp {className}</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Hôm nay: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Cảnh báo nhắc nhở điểm danh */}
      {todayStats.total > 0 && todayStats.notMarked > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-800 mb-1">Nhắc nhở điểm danh</h3>
            <p className="text-amber-700 font-medium">Lớp {className} còn <span className="font-bold">{todayStats.notMarked}</span> học sinh chưa được điểm danh trong ngày hôm nay. Vui lòng hoàn tất điểm danh.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Sĩ số</p>
          <h3 className="text-4xl font-bold text-slate-800">{todayStats.total}</h3>
          <div className="mt-4 flex items-center text-sm font-medium text-slate-500">
            <span>Học sinh trong lớp</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-500 mb-1 uppercase tracking-wider">Có Mặt</p>
          <h3 className="text-4xl font-bold text-emerald-600">{todayStats.present}</h3>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{todayStats.total ? ((todayStats.present / todayStats.total) * 100).toFixed(1) : 0}% sĩ số</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserX className="w-16 h-16 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-red-500 mb-1 uppercase tracking-wider">Vắng Mặt</p>
          <h3 className="text-4xl font-bold text-red-600">{todayStats.absent}</h3>
          <div className="mt-4 flex items-center text-sm font-medium text-red-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>Học sinh</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-amber-500 mb-1 uppercase tracking-wider">Đi Trễ</p>
          <h3 className="text-4xl font-bold text-amber-600">{todayStats.late}</h3>
          <div className="mt-4 flex items-center text-sm font-medium text-amber-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>Học sinh</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Kế hoạch tuần */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-500" /> Kế hoạch tuần này
            </h3>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">Đã duyệt</span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {tasks.length > 0 ? (
              <ul className="space-y-4">
                {tasks.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-indigo-500" />
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{task}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-8">
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">Chưa có kế hoạch tuần nào được phê duyệt.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bảng so sánh giữa các tuần */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Xu hướng Điểm danh (5 Tuần)
          </h3>
          
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresentTeacher" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[80, 100]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="Có mặt (%)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresentTeacher)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div className="p-3 bg-emerald-50 rounded-xl text-center">
              <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">TB Có mặt</p>
              <p className="text-xl font-bold text-emerald-700">93.5%</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-center">
              <p className="text-xs font-semibold text-red-600 uppercase mb-1">TB Vắng</p>
              <p className="text-xl font-bold text-red-700">3.2%</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-center">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-1">TB Đi trễ</p>
              <p className="text-xl font-bold text-amber-700">3.3%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
