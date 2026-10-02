import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Users, 
  Clock, 
  UserX, 
  CheckCircle, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { SchoolClass, Student } from '../data';
import { useLanguage } from '../contexts/LanguageContext';

interface ClassComparisonChartProps {
  classes: SchoolClass[];
  students: Student[];
  selectedDate: string;
  onSelectClass?: (classId: string) => void;
  onNavigateToAttendance?: (classId?: string) => void;
}

type MetricType = 'rate' | 'absent_late' | 'attendance_count';
type SortType = 'default' | 'rate_desc' | 'rate_asc' | 'absent_desc';

export default function ClassComparisonChart({
  classes,
  students,
  selectedDate,
  onSelectClass,
  onNavigateToAttendance
}: ClassComparisonChartProps) {
  const { t, isEn } = useLanguage();
  const [metric, setMetric] = useState<MetricType>('rate');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortType>('default');

  // Lấy danh sách các khối lớp hiện có
  const availableGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    classes.forEach(c => {
      const match = (c.name || '').match(/^(\d+)/);
      if (match) gradesSet.add(match[1]);
    });
    return Array.from(gradesSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [classes]);

  // Tính toán dữ liệu thống kê chi tiết từng lớp cho ngày được chọn
  const classComparisonData = useMemo(() => {
    return classes.map(c => {
      const classStudents = students.filter(s => s.classId === c.id);
      let present = 0;
      let absent = 0;
      let late = 0;
      let markedCount = 0;

      classStudents.forEach(s => {
        const record = s.attendanceRecords?.[selectedDate];
        if (record && record.status) {
          markedCount++;
          if (record.status === 'present') present++;
          else if (record.status === 'absent') absent++;
          else if (record.status === 'late' || record.status === 'leave_early') late++;
        }
      });

      const total = classStudents.length;
      const isAttendanceDone = total > 0 && markedCount > 0;
      const rate = isAttendanceDone && total > 0 
        ? Math.round((present / total) * 1000) / 10 
        : 0;

      // Nhận diện khối lớp
      const gradeMatch = (c.name || '').match(/^(\d+)/);
      const grade = gradeMatch ? gradeMatch[1] : '';

      return {
        id: c.id,
        name: c.name,
        grade,
        homeroomTeacher: c.homeroomTeacher || 'Chưa phân công',
        total,
        present,
        absent,
        late,
        rate,
        isAttendanceDone
      };
    });
  }, [classes, students, selectedDate]);

  // Lọc theo khối
  const filteredData = useMemo(() => {
    let list = classComparisonData;
    if (selectedGrade !== 'all') {
      list = list.filter(item => item.grade === selectedGrade || item.name.startsWith(selectedGrade));
    }

    // Sắp xếp
    const copy = [...list];
    if (sortOrder === 'rate_desc') {
      copy.sort((a, b) => b.rate - a.rate);
    } else if (sortOrder === 'rate_asc') {
      copy.sort((a, b) => a.rate - b.rate);
    } else if (sortOrder === 'absent_desc') {
      copy.sort((a, b) => b.absent - a.absent);
    }
    return copy;
  }, [classComparisonData, selectedGrade, sortOrder]);

  // Thống kê nhanh toàn khối / toàn trường
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return { topClass: null, mostAbsentClass: null, avgRate: 0, totalClasses: 0 };
    }

    const checkedClasses = filteredData.filter(c => c.isAttendanceDone);
    const avgRate = checkedClasses.length > 0
      ? Math.round((checkedClasses.reduce((acc, c) => acc + c.rate, 0) / checkedClasses.length) * 10) / 10
      : 0;

    const sortedByRate = [...checkedClasses].sort((a, b) => b.rate - a.rate);
    const topClass = sortedByRate.length > 0 ? sortedByRate[0] : null;

    const sortedByAbsent = [...checkedClasses].sort((a, b) => b.absent - a.absent);
    const mostAbsentClass = sortedByAbsent.length > 0 && sortedByAbsent[0].absent > 0 ? sortedByAbsent[0] : null;

    return {
      topClass,
      mostAbsentClass,
      avgRate,
      totalClasses: filteredData.length,
      checkedCount: checkedClasses.length
    };
  }, [filteredData]);

  // Định dạng ngày hiển thị dd/mm/yyyy
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return selectedDate;
  }, [selectedDate]);

  // Xác định màu sắc cột tỉ lệ chuyên cần theo %
  const getRateBarColor = (rate: number, isAttendanceDone: boolean) => {
    if (!isAttendanceDone) return '#CBD5E1'; // Xám nếu chưa điểm danh
    if (rate >= 98) return '#10B981'; // Xanh lá đậm (Xuất sắc)
    if (rate >= 95) return '#0D9488'; // Xanh Teal Duy Tân (Tốt)
    if (rate >= 90) return '#F59E0B'; // Vàng cam (Khá)
    return '#F43F5E'; // Đỏ (Cần lưu ý)
  };

  return (
    <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {t('classComparisonChart')}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {isEn ? 'Date ' : 'Ngày '}{formattedDisplayDate}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {t('classComparisonSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Segmented Metric Switcher */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setMetric('rate')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'rate'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {t('metricAttendanceRate')}
            </button>
            <button
              onClick={() => setMetric('absent_late')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'absent_late'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {isEn ? 'Absent & Late' : 'Vắng & Đi trễ'}
            </button>
            <button
              onClick={() => setMetric('attendance_count')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'attendance_count'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {isEn ? 'Present / Enrolled' : 'Có mặt / Sĩ số'}
            </button>
          </div>

          {/* Grade Filter */}
          {availableGrades.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">{isEn ? 'All Grades' : 'Tất cả các khối'}</option>
                {availableGrades.map(g => (
                  <option key={g} value={g}>{isEn ? `Grade ${g}` : `Khối ${g}`}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sắp xếp */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortType)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="default">{isEn ? 'Default Order' : 'Thứ tự mặc định'}</option>
              <option value="rate_desc">{isEn ? 'Highest Attendance' : 'Chuyên cần cao nhất'}</option>
              <option value="rate_asc">{isEn ? 'Lowest Attendance' : 'Chuyên cần thấp nhất'}</option>
              <option value="absent_desc">{isEn ? 'Most Absences' : 'Vắng nhiều nhất'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* KPI 1: Tỉ lệ trung bình */}
        <div className="bg-[#f0fdfa] rounded-2xl p-3.5 border border-[#5eead4]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">
                {isEn ? 'Average ' : 'Trung bình '}{selectedGrade === 'all' ? (isEn ? 'Whole School' : 'Toàn trường') : (isEn ? `Grade ${selectedGrade}` : `Khối ${selectedGrade}`)}
              </p>
              <p className="text-xs text-teal-600 font-medium">
                {summaryStats.checkedCount}/{summaryStats.totalClasses} {isEn ? 'classes marked attendance' : 'lớp đã hoàn tất điểm danh'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-teal-800">{summaryStats.avgRate}%</span>
          </div>
        </div>

        {/* KPI 2: Lớp dẫn đầu */}
        <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                {isEn ? 'HIGHEST ATTENDANCE CLASS' : 'Lớp chuyên cần cao nhất'}
              </p>
              <p className="text-xs text-emerald-600 font-medium">
                {summaryStats.topClass ? `${t('homeroomTeacher')}: ${summaryStats.topClass.homeroomTeacher}` : (isEn ? 'Updating' : 'Đang cập nhật')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-800 block">
              {summaryStats.topClass ? summaryStats.topClass.name : '-'}
            </span>
            <span className="text-xs font-extrabold text-emerald-600">
              {summaryStats.topClass ? `${summaryStats.topClass.rate}%` : ''}
            </span>
          </div>
        </div>

        {/* KPI 3: Lớp có HS vắng cần quan tâm */}
        <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">
                {isEn ? 'MOST ABSENT STUDENTS' : 'Lớp có nhiều HS vắng nhất'}
              </p>
              <p className="text-xs text-rose-600 font-medium">
                {summaryStats.mostAbsentClass ? `${t('homeroomTeacher')}: ${summaryStats.mostAbsentClass.homeroomTeacher}` : (isEn ? 'No absences' : 'Không có lớp vắng')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-rose-800 block">
              {summaryStats.mostAbsentClass ? summaryStats.mostAbsentClass.name : '0'}
            </span>
            <span className="text-xs font-bold text-rose-600">
              {summaryStats.mostAbsentClass ? `${summaryStats.mostAbsentClass.absent} ${isEn ? 'absent' : 'vắng'}` : (isEn ? '100% Present' : 'Đầy đủ')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full">
        <div className="h-[320px] sm:h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'rate' ? (
              <BarChart 
                data={filteredData} 
                margin={{ top: 20, right: 15, left: -10, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const classId = e.activePayload[0].payload.id;
                    onSelectClass?.(classId);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  unit="%"
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1 font-bold">
                            <span className="text-sm text-teal-300">{t('class')} {data.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${data.isAttendanceDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                              {data.isAttendanceDone ? t('attendanceDone') : t('attendanceNotDone')}
                            </span>
                          </div>
                          <p className="text-slate-300">{t('homeroomTeacher')}: <span className="text-white font-medium">{data.homeroomTeacher}</span></p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
                            <div>{t('overallAttendanceRate')}:</div>
                            <div className="font-bold text-teal-300 text-right">{data.rate}%</div>
                            <div>{t('presentCount')}:</div>
                            <div className="font-semibold text-emerald-400 text-right">{data.present} / {data.total}</div>
                            <div>{t('absentCount')}:</div>
                            <div className="font-semibold text-rose-400 text-right">{data.absent} {t('studentsCount')}</div>
                            <div>{t('lateCount')}:</div>
                            <div className="font-semibold text-amber-400 text-right">{data.late} {t('studentsCount')}</div>
                          </div>
                          <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800 text-center">
                            {isEn ? 'Click to open class attendance book' : 'Nhấp để mở sổ điểm danh lớp này'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={95} stroke="#0D9488" strokeDasharray="3 3" label={{ value: isEn ? 'Target 95%' : 'Mục tiêu 95%', fill: '#0D9488', fontSize: 10, position: 'right' }} />
                <Bar 
                  dataKey="rate" 
                  name={t('metricAttendanceRate')} 
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                >
                  {filteredData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.id}`} 
                      fill={getRateBarColor(entry.rate, entry.isAttendanceDone)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : metric === 'absent_late' ? (
              <BarChart 
                data={filteredData} 
                margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const classId = e.activePayload[0].payload.id;
                    onSelectClass?.(classId);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <RechartsTooltip
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    color: '#FFF', 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="absent" name={isEn ? "Absent Students" : "Số học sinh vắng"} fill="#F43F5E" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="late" name={isEn ? "Late Students" : "Số học sinh đi trễ"} fill="#F59E0B" radius={[4, 4, 0, 0]} cursor="pointer" />
              </BarChart>
            ) : (
              <BarChart 
                data={filteredData} 
                margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const classId = e.activePayload[0].payload.id;
                    onSelectClass?.(classId);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <RechartsTooltip
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    color: '#FFF', 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' 
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="total" name={isEn ? "Total Enrollment" : "Tổng sĩ số lớp"} fill="#94A3B8" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="present" name={isEn ? "Present Students" : "Có mặt trên lớp"} fill="#0D9488" radius={[4, 4, 0, 0]} cursor="pointer" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend Explanations */}
        {metric === 'rate' && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>≥ 98% ({isEn ? 'Excellent' : 'Xuất sắc'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-600"></span>
              <span>95% - 98% ({isEn ? 'Standard' : 'Đạt chuẩn'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>90% - 95% ({isEn ? 'Fair' : 'Khá'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>&lt; 90% ({isEn ? 'Needs Attention' : 'Cần lưu ý'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span>{isEn ? 'Not Marked Today' : 'Chưa ĐD hôm nay'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
