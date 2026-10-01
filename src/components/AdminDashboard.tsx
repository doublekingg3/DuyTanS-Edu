import React, { useMemo, useState, useEffect } from 'react';
import { Users, UserX, Clock, Calendar, BookOpen, CheckCircle, Check, AlertCircle } from 'lucide-react';
import { Student, SchoolClass, sortClasses } from '../data';
import AbsentLateDetailTable from './AbsentLateDetailTable';
import AttendanceRateTable from './AttendanceRateTable';

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
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Lấy danh sách lớp thuộc năm học đang chọn, lọc bỏ lớp đã xóa và sắp xếp chuẩn theo quản lý lớp học
  const currentClasses = useMemo(() => {
    const active = classes.filter(c => !c.isDeleted && (!schoolYearId || c.schoolYearId === schoolYearId));
    return sortClasses(active);
  }, [classes, schoolYearId]);

  // Tự động nhận diện các khối lớp hiện có trong năm học (ví dụ: Khối 10, 11 hoặc Khối 6, 7, 8, 9)
  const availableGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    currentClasses.forEach(c => {
      const match = (c.name || '').match(/^(\d+)/);
      if (match) gradesSet.add(match[1]);
    });
    const parsed = Array.from(gradesSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return parsed.length > 0 ? parsed : ['6', '7', '8', '9'];
  }, [currentClasses]);

  useEffect(() => {
    if (selectedGrade !== 'all' && !availableGrades.includes(selectedGrade)) {
      setSelectedGrade('all');
    }
  }, [availableGrades, selectedGrade]);

  const currentClassIds = new Set(currentClasses.map(c => c.id));
  
  const currentStudents = useMemo(() => {
    return students.filter(s => currentClassIds.has(s.classId));
  }, [students, currentClassIds]);

  // Thống kê theo từng lớp (kế thừa thứ tự đã sắp xếp của currentClasses)
  const classStats = useMemo(() => {
    return currentClasses.map(c => {
      const classStudents = currentStudents.filter(s => s.classId === c.id);
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
      // Lớp đã điểm danh nếu có dữ liệu điểm danh được giáo viên lưu lại
      const isAttendanceDone = total > 0 && markedCount > 0;
      const rate = isAttendanceDone && total > 0 
        ? Math.round((present / total) * 100) 
        : 0;

      return {
        id: c.id,
        name: c.name,
        homeroomTeacher: c.homeroomTeacher || 'Chưa phân công',
        total,
        present,
        absent,
        late,
        rate,
        isAttendanceDone,
        markedCount
      };
    });
  }, [currentClasses, currentStudents, selectedDate]);

  // Thống kê điểm danh toàn trường / theo khối đang chọn theo ngày đang chọn
  const todayStats = useMemo(() => {
    // Lọc lớp theo khối đang chọn (hoặc toàn trường nếu 'all')
    const targetClasses = selectedGrade === 'all' 
      ? currentClasses 
      : currentClasses.filter(c => {
          const match = (c.name || '').match(/^(\d+)/);
          return match ? match[1] === selectedGrade : c.name.startsWith(selectedGrade);
        });

    const targetClassIds = new Set(targetClasses.map(c => c.id));
    const targetStudents = currentStudents.filter(s => targetClassIds.has(s.classId));

    let present = 0;
    let absent = 0;
    let absentP = 0;
    let absentKP = 0;
    let late = 0;
    let totalCheckedStudents = 0;
    let checkedClassesCount = 0;
    let uncheckedClassesCount = 0;

    classStats.forEach(c => {
      if (!targetClassIds.has(c.id)) return;

      if (c.isAttendanceDone) {
        checkedClassesCount++;
        totalCheckedStudents += c.total;
        present += c.present;
        absent += c.absent;
        late += c.late;

        // Tính chi tiết vắng có phép / không phép
        const cStudents = currentStudents.filter(s => s.classId === c.id);
        cStudents.forEach(s => {
          const record = s.attendanceRecords?.[selectedDate];
          if (record?.status === 'absent') {
            const reason = (record.reason || '').toLowerCase();
            if (reason.includes('phép') || reason.includes('p') || reason.includes('ốm') || reason.includes('xin')) {
              absentP++;
            } else {
              absentKP++;
            }
          }
        });
      } else {
        uncheckedClassesCount++;
      }
    });

    // Tỉ lệ % đang có mặt lấy số có mặt chia cho tổng sĩ số theo đúng yêu cầu
    const totalStudents = targetStudents.length;
    const rawRate = totalStudents > 0 ? (present / totalStudents) * 100 : 0;
    const presentPercent = Math.round(rawRate * 10) / 10;

    return { 
      present, 
      absent, 
      absentP, 
      absentKP, 
      late, 
      total: totalStudents, 
      totalCheckedStudents,
      checkedClassesCount,
      uncheckedClassesCount,
      totalClasses: targetClasses.length,
      presentPercent 
    };
  }, [classStats, currentStudents, currentClasses, selectedDate, selectedGrade]);

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
          <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs font-medium text-slate-600 overflow-x-auto max-w-full">
            {['all', ...availableGrades].map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
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
            {todayStats.checkedClassesCount} lớp đã ĐD • {todayStats.uncheckedClassesCount} lớp chưa ĐD ({currentClasses.length} lớp)
          </p>
        </div>

        {/* Card 2: Đang có mặt */}
        <div className="bg-[#f0fdfa] rounded-[20px] p-5 border border-[#5eead4]/60 shadow-sm shadow-teal-500/5 relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-teal-700 tracking-wider uppercase">
              ĐANG CÓ MẶT
            </p>
            {todayStats.uncheckedClassesCount > 0 ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {todayStats.checkedClassesCount}/{todayStats.totalClasses} lớp đã ĐD
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Đầy đủ {todayStats.totalClasses} lớp
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-teal-700">
              {todayStats.present}
            </span>
            <span className="text-sm font-extrabold text-teal-600">
              ({todayStats.presentPercent}%)
            </span>
            <span className="text-[11px] text-slate-400 font-normal ml-0.5">
              / {todayStats.total} tổng sĩ số
            </span>
          </div>
          <p className="text-xs text-teal-700 font-medium">
            {todayStats.uncheckedClassesCount > 0 
              ? `${todayStats.present}/${todayStats.total} HS có mặt (${todayStats.checkedClassesCount}/${todayStats.totalClasses} lớp đã ĐD)`
              : 'Hiện diện đầy đủ trên lớp học'}
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

      {/* Thông báo nếu còn lớp chưa điểm danh */}
      {todayStats.uncheckedClassesCount > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Có {todayStats.uncheckedClassesCount} lớp chưa hoàn thành điểm danh ngày {selectedDate.split('-').reverse().join('/')}
              </p>
              <p className="text-xs text-amber-700">
                Số học sinh "Đang có mặt" ({todayStats.present} HS) hiện tổng hợp từ {todayStats.checkedClassesCount} lớp đã điểm danh (đạt {todayStats.presentPercent}%). Các lớp chưa ĐD có nút sáng xanh bên dưới.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white text-amber-800 rounded-lg border border-amber-200 shadow-2xs shrink-0">
            {todayStats.checkedClassesCount}/{todayStats.totalClasses} lớp hoàn thành
          </span>
        </div>
      )}

      {/* Detail Table of Absent & Late Students for Selected Date */}
      <AbsentLateDetailTable
        students={currentStudents}
        classes={currentClasses}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNavigateToAttendance={(classId) => {
          onSelectClass?.(classId);
          onNavigateToAttendance?.(classId);
        }}
        title={`DANH SÁCH CHI TIẾT HỌC SINH VẮNG, ĐI TRỄ NGÀY ${selectedDate.split('-').reverse().join('/')}`}
        description="Thống kê chi tiết các trường hợp vắng có phép, vắng không phép và đi trễ trên toàn trường kèm SĐT liên hệ phụ huynh"
      />

      {/* BẢNG THỐNG KÊ & ĐỐI CHIẾU TỈ LỆ CHUYÊN CẦN (THEO NGÀY, TUẦN, THÁNG) */}
      <AttendanceRateTable
        mode="admin"
        classes={currentClasses}
        students={currentStudents}
        schoolYearName={schoolYearId}
        onSelectClass={onSelectClass}
        onNavigateToAttendance={onNavigateToAttendance}
      />
    </div>
  );
}
