import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  UserX, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart2, 
  ClipboardList, 
  CheckCircle, 
  FileText, 
  Bell,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BookOpen,
  Check,
  Edit2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Student, SchoolClass, sortClasses } from '../data';
import AbsentLateDetailTable from './AbsentLateDetailTable';
import AttendanceRateTable from './AttendanceRateTable';

interface TeacherDashboardProps {
  classId: string;
  className: string;
  students: Student[];
  allStudents?: Student[];
  classes?: SchoolClass[];
  onSelectClass?: (classId: string) => void;
  onNavigateToAttendance?: (classId?: string) => void;
}

interface ClassRow {
  id: string;
  name: string;
  homeroomTeacher: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
  isAttendanceDone: boolean;
}

export default function TeacherDashboard({ 
  classId, 
  className, 
  students, 
  allStudents = [],
  classes = [],
  onSelectClass,
  onNavigateToAttendance
}: TeacherDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sortField, setSortField] = useState<'name' | 'total' | 'present' | 'absent' | 'late' | 'rate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Active classes for this teacher
  const teacherClasses = useMemo(() => {
    if (classes && classes.length > 0) {
      return sortClasses(classes.filter(c => !c.isDeleted));
    }
    return [];
  }, [classes]);

  // Students belonging to all teacher's classes
  const teacherStudents = useMemo(() => {
    if (teacherClasses.length > 0 && allStudents.length > 0) {
      const classIdSet = new Set(teacherClasses.map(c => c.id));
      return allStudents.filter(s => classIdSet.has(s.classId));
    }
    return students;
  }, [teacherClasses, allStudents, students]);

  // Today / Selected Date statistics for active selected class
  const classStatsForSelected = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let notMarked = 0;
    let markedCount = 0;
    
    students.forEach(s => {
      const record = s.attendanceRecords?.[selectedDate];
      if (record && record.status) {
        markedCount++;
        if (record.status === 'present') present++;
        else if (record.status === 'absent') absent++;
        else if (record.status === 'late' || record.status === 'leave_early') late++;
      } else {
        notMarked++;
      }
    });

    const isDone = students.length > 0 && markedCount > 0;
    const rate = isDone && students.length > 0 ? Math.round((present / students.length) * 100) : 0;

    return { present, absent, late, notMarked, total: students.length, isDone, rate };
  }, [students, selectedDate]);

  // Class statistics for "BẢNG THỐNG KÊ CHI TIẾT TỪNG LỚP" (across teacher's classes)
  const classRows = useMemo<ClassRow[]>(() => {
    const listClasses = teacherClasses.length > 0 
      ? teacherClasses 
      : [{ id: classId, name: className || 'Lớp của bạn', homeroomTeacher: '' } as SchoolClass];

    return listClasses.map(c => {
      const classStudents = teacherStudents.filter(s => s.classId === c.id);
      let present = 0, absent = 0, late = 0;
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
      const rate = isAttendanceDone && total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: c.id,
        name: c.name,
        homeroomTeacher: c.homeroomTeacher || 'Chưa phân công',
        total,
        present,
        absent,
        late,
        rate,
        isAttendanceDone
      };
    });
  }, [teacherClasses, classId, className, teacherStudents, selectedDate]);

  // Sorted class rows
  const sortedClassRows = useMemo<ClassRow[]>(() => {
    const list = [...classRows];
    if (sortField === 'name') {
      const sorted = sortClasses<ClassRow>(list);
      return sortDirection === 'asc' ? sorted : sorted.reverse();
    }
    return list.sort((a, b) => {
      const numA = (a as any)[sortField] ?? 0;
      const numB = (b as any)[sortField] ?? 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [classRows, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Data for weekly comparison
  const weeklyData = [
    { week: 'Tuần 1', present: 95, absent: 2, late: 3 },
    { week: 'Tuần 2', present: 93, absent: 4, late: 3 },
    { week: 'Tuần 3', present: 97, absent: 1, late: 2 },
    { week: 'Tuần 4', present: 90, absent: 5, late: 5 },
    { 
      week: 'Tuần 5 (Hiện tại)', 
      present: classStatsForSelected.total ? (classStatsForSelected.present / classStatsForSelected.total) * 100 : 96, 
      absent: classStatsForSelected.total ? (classStatsForSelected.absent / classStatsForSelected.total) * 100 : 2, 
      late: classStatsForSelected.total ? (classStatsForSelected.late / classStatsForSelected.total) * 100 : 2 
    }
  ].map(d => ({
    week: d.week,
    'Có mặt (%)': Number(d.present.toFixed(1)),
    'Vắng (%)': Number(d.absent.toFixed(1)),
    'Đi trễ (%)': Number(d.late.toFixed(1))
  }));

  const [tasks, setTasks] = useState<string[]>([]);
  useEffect(() => {
    setTasks([
      'Chào cờ đầu tuần, sinh hoạt chủ nhiệm phổ biến kế hoạch tuần',
      'Kiểm tra sĩ số, giờ giấc nề nếp và tác phong đồng phục chuẩn Duy Tân',
      `Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày (${className || ''})`
    ]);
  }, [classId, className]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f0fdfa]/40 min-h-full">
      {/* Top Banner */}
      <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 tracking-tight">
              Tổng quan nề nếp & Chuyên cần: {className || 'Các lớp phụ trách'}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {teacherClasses.length > 1 ? `${teacherClasses.length} lớp phụ trách` : 'Lớp chủ nhiệm'}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Ngày theo dõi: <b>{selectedDate.split('-').reverse().join('/')}</b></span>
          </p>
        </div>

        {onNavigateToAttendance && (
          <button
            onClick={() => onNavigateToAttendance(classId)}
            className="bg-teal-gradient hover:opacity-95 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Mở sổ điểm danh lớp {className}</span>
          </button>
        )}
      </div>

      {/* Cảnh báo nhắc nhở điểm danh */}
      {classStatsForSelected.total > 0 && classStatsForSelected.notMarked > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-2xs">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-800 mb-0.5">Nhắc nhở điểm danh chuyên cần</h3>
            <p className="text-xs sm:text-sm text-amber-700 font-medium">
              Lớp <b>{className}</b> còn <b>{classStatsForSelected.notMarked}</b> học sinh chưa được ghi nhận trạng thái điểm danh trong ngày hôm nay. Vui lòng hoàn tất điểm danh đúng giờ.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-14 h-14 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">SĨ SỐ LỚP</p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-slate-800">{classStatsForSelected.total}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="text-xs text-slate-500">Lớp {className}</p>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-emerald-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-14 h-14 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-emerald-500 tracking-wider uppercase">CÓ MẶT</p>
            {!classStatsForSelected.isDone && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Chưa ĐD
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {classStatsForSelected.isDone ? classStatsForSelected.present : 0}
            </span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <div className="flex items-center text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>
              {classStatsForSelected.isDone 
                ? `${classStatsForSelected.total ? ((classStatsForSelected.present / classStatsForSelected.total) * 100).toFixed(1) : 100}% sĩ số`
                : 'Lớp chưa thực hiện điểm danh hôm nay'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-rose-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <UserX className="w-14 h-14 text-rose-600" />
          </div>
          <p className="text-xs font-bold text-rose-500 tracking-wider uppercase mb-1">VẮNG MẶT</p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-rose-600">{classStatsForSelected.absent}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="text-xs text-rose-600 font-medium flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            <span>{classStatsForSelected.absent > 0 ? 'Cần theo dõi sát' : 'Không có học sinh vắng'}</span>
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-amber-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-14 h-14 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-amber-500 tracking-wider uppercase mb-1">ĐI TRỄ / VỀ SỚM</p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-amber-600">{classStatsForSelected.late}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="text-xs text-amber-600 font-medium">
            <span>{classStatsForSelected.late > 0 ? 'Có vi phạm giờ giấc' : 'Đúng giờ 100%'}</span>
          </p>
        </div>
      </div>

      {/* BẢNG THỐNG KÊ TỈ LỆ CHUYÊN CẦN LỚP CHỦ NHIỆM (THEO NGÀY, TUẦN, THÁNG) */}
      <AttendanceRateTable
        mode="teacher"
        currentClassId={classId}
        currentClassName={className}
        students={students}
        classes={teacherClasses.length > 0 ? teacherClasses : classes}
        onNavigateToAttendance={onNavigateToAttendance}
        onSelectClass={onSelectClass}
      />

      {/* BẢNG THỐNG KÊ CHI TIẾT CÁC LỚP PHỤ TRÁCH (Hiển thị khi phụ trách nhiều hơn 1 lớp) */}
      {teacherClasses.length > 1 && (
        <div className="bg-white rounded-[20px] border border-teal-100 shadow-sm shadow-teal-500/5 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wide">
                ĐỐI CHIẾU CÁC LỚP BỘ MÔN / PHỤ TRÁCH HÔM NAY
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {sortedClassRows.length} lớp
              </span>
            </div>
            <span className="text-xs text-slate-400 italic">
              Cuộn dọc để xem thêm • Nhấp "Điểm danh" để mở lớp
            </span>
          </div>

          <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs select-none sticky top-0 z-10">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-3 sm:px-4 py-3 text-white whitespace-nowrap cursor-pointer hover:bg-teal-800 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>LỚP</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-teal-200" /> : <ArrowDown className="w-3.5 h-3.5 text-teal-200" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-teal-300/60" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('total')}
                    className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap cursor-pointer hover:bg-teal-800 transition-colors"
                  >
                    <span>SĨ SỐ</span>
                  </th>
                  <th 
                    onClick={() => handleSort('present')}
                    className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap cursor-pointer hover:bg-teal-800 transition-colors"
                  >
                    <span>CÓ MẶT</span>
                  </th>
                  <th 
                    onClick={() => handleSort('absent')}
                    className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap cursor-pointer hover:bg-teal-800 transition-colors"
                  >
                    <span>VẮNG</span>
                  </th>
                  <th 
                    onClick={() => handleSort('late')}
                    className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap cursor-pointer hover:bg-teal-800 transition-colors"
                  >
                    <span>ĐI TRỄ</span>
                  </th>
                  <th 
                    onClick={() => handleSort('rate')}
                    className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap cursor-pointer hover:bg-teal-800 transition-colors"
                  >
                    <span>CHUYÊN CẦN</span>
                  </th>
                  <th className="px-3 py-3 text-center text-white whitespace-nowrap">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sortedClassRows.map(c => {
                  const isSelected = classId === c.id;
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-[#f0fdfa]/40 transition-colors ${isSelected ? 'bg-teal-50/40' : ''}`}
                    >
                      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{c.name}</span>
                          {isSelected && (
                            <span className="bg-teal-gradient text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                              Đang chọn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center font-semibold text-slate-800">
                        {c.total}
                      </td>
                      <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-xs sm:text-sm">
                        {c.isAttendanceDone ? (
                          <span className="font-bold text-teal-700">{c.present}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                        {c.isAttendanceDone ? (
                          c.absent > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                              {c.absent}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">0</span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-3 py-2.5 sm:py-3 text-center text-slate-500">
                        {c.isAttendanceDone ? (c.late > 0 ? <span className="text-amber-600 font-bold">{c.late}</span> : '0') : '-'}
                      </td>
                      <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                        {c.isAttendanceDone ? (
                          <span className="font-bold text-slate-800">{c.rate}%</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Chưa ĐD
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 sm:py-3 text-center whitespace-nowrap">
                        {c.isAttendanceDone ? (
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã điểm danh</span>
                            </span>
                            <button
                              onClick={() => {
                                onSelectClass?.(c.id);
                                onNavigateToAttendance?.(c.id);
                              }}
                              className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Xem lại hoặc chỉnh sửa điểm danh lớp này"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectClass?.(c.id);
                              onNavigateToAttendance?.(c.id);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-teal-500 text-white bg-teal-600 hover:bg-teal-700 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            <span>Điểm danh</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Table of Absent & Late Students for Selected Date */}
      <AbsentLateDetailTable
        students={teacherStudents}
        classes={teacherClasses.length > 0 ? teacherClasses : [{ id: classId, name: className } as SchoolClass]}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNavigateToAttendance={(cId) => {
          onSelectClass?.(cId);
          onNavigateToAttendance?.(cId);
        }}
        title={`DANH SÁCH CHI TIẾT HỌC SINH VẮNG, ĐI TRỄ NGÀY ${selectedDate.split('-').reverse().join('/')}`}
        description={`Danh sách học sinh vắng (có phép/không phép), đi trễ các lớp phụ trách (${className || 'Lớp của bạn'}) kèm SĐT liên hệ phụ huynh`}
      />

      {/* Biểu đồ xu hướng chuyên cần (Đưa xuống dưới cùng theo yêu cầu) */}
      <div className="bg-white border border-teal-100 rounded-[20px] shadow-sm shadow-teal-500/5 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Biểu đồ xu hướng chuyên cần (5 Tuần gần nhất)
          </h3>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-emerald-50 rounded-xl text-center border border-emerald-100">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase mr-1.5">TB Có mặt:</span>
              <span className="text-sm font-bold text-emerald-700">94.2%</span>
            </div>
            <div className="px-3 py-1 bg-rose-50 rounded-xl text-center border border-rose-100">
              <span className="text-[10px] font-semibold text-rose-600 uppercase mr-1.5">TB Vắng:</span>
              <span className="text-sm font-bold text-rose-700">2.8%</span>
            </div>
            <div className="px-3 py-1 bg-amber-50 rounded-xl text-center border border-amber-100">
              <span className="text-[10px] font-semibold text-amber-600 uppercase mr-1.5">TB Đi trễ:</span>
              <span className="text-sm font-bold text-amber-700">3.0%</span>
            </div>
          </div>
        </div>
        
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresentTeacher" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dy={5} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={[80, 100]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="Có mặt (%)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresentTeacher)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kế hoạch tuần */}
      <div className="bg-white border border-teal-100 rounded-[20px] shadow-sm shadow-teal-500/5 p-5">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-teal-600" /> Kế hoạch hoạt động tuần này ({className})
          </h3>
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            Đã duyệt
          </span>
        </div>
        <ul className="space-y-3">
          {tasks.map((task, idx) => (
            <li key={idx} className="flex items-start gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{task}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
