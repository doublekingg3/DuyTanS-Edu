import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  Check, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Download, 
  Award, 
  Sparkles, 
  BarChart2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { Student, SchoolClass, sortClasses } from '../data';
import { 
  getAdminDailyStats, 
  getAdminWeeklyStats, 
  getAdminMonthlyStats, 
  getTeacherClassDailyList, 
  getTeacherClassWeeklyList, 
  getTeacherClassMonthlyList,
  formatDayVN,
  ClassDailyStat,
  ClassPeriodStat,
  TeacherDayRow,
  TeacherWeekRow,
  TeacherMonthRow
} from '../lib/attendanceStatsUtils';
import { generateSchoolWeeks, getCurrentSchoolWeek } from '../lib/schoolWeekUtils';
import { useAlert } from '../contexts/AlertContext';

interface AttendanceRateTableProps {
  mode: 'admin' | 'teacher';
  classes: SchoolClass[];
  students: Student[];
  schoolYearName?: string;
  currentClassId?: string;
  currentClassName?: string;
  onNavigateToAttendance?: (classId?: string) => void;
  onSelectClass?: (classId: string) => void;
}

export default function AttendanceRateTable({
  mode,
  classes,
  students,
  schoolYearName,
  currentClassId,
  currentClassName,
  onNavigateToAttendance,
  onSelectClass
}: AttendanceRateTableProps) {
  const { showAlert } = useAlert();

  // Tab thời gian: 'day' | 'week' | 'month'
  const [timeView, setTimeView] = useState<'day' | 'week' | 'month'>('day');

  // Quản lý Ngày được chọn
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Quản lý Tuần được chọn (1 -> 42)
  const currentWeekNumber = useMemo(() => getCurrentSchoolWeek(schoolYearName), [schoolYearName]);
  const [selectedWeek, setSelectedWeek] = useState<number>(() => currentWeekNumber);

  // Quản lý Tháng được chọn
  const currentMonthNumber = useMemo(() => new Date().getMonth() + 1, []);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => currentMonthNumber);

  // Lọc theo khối dành cho Admin
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>('');

  // Sắp xếp bảng
  const [sortField, setSortField] = useState<string>('rate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Danh sách các tuần học
  const schoolWeeks = useMemo(() => generateSchoolWeeks(schoolYearName, 42), [schoolYearName]);

  // Lọc danh sách học sinh thuộc lớp đang chọn (dành cho Teacher)
  const targetClassStudents = useMemo(() => {
    if (mode === 'teacher') {
      if (currentClassId) {
        return students.filter(s => s.classId === currentClassId && !s.isDeleted);
      }
      return students.filter(s => !s.isDeleted);
    }
    return students.filter(s => !s.isDeleted);
  }, [mode, currentClassId, students]);

  // Các khối học có trong trường (Admin)
  const availableGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    classes.filter(c => !c.isDeleted).forEach(c => {
      const match = (c.name || '').match(/^(\d+)/);
      if (match) gradesSet.add(match[1]);
    });
    const parsed = Array.from(gradesSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return parsed.length > 0 ? parsed : ['10', '11', '12'];
  }, [classes]);

  // ----------------------------------------------------------------------
  // DỮ LIỆU DÀNH CHO ADMIN
  // ----------------------------------------------------------------------
  // 1. Thống kê theo ngày (Admin)
  const adminDaily = useMemo(() => {
    return getAdminDailyStats(classes, students, selectedDate);
  }, [classes, students, selectedDate]);

  // Lọc theo khối và từ khóa tìm kiếm (Admin Daily)
  const filteredAdminDailyStats = useMemo(() => {
    let list = adminDaily.classStats;
    if (selectedGrade !== 'all') {
      list = list.filter(c => {
        const match = (c.className || '').match(/^(\d+)/);
        return match ? match[1] === selectedGrade : c.className.startsWith(selectedGrade);
      });
    }
    if (adminSearchTerm.trim()) {
      const q = adminSearchTerm.toLowerCase().trim();
      list = list.filter(c => 
        c.className.toLowerCase().includes(q) || 
        c.homeroomTeacher.toLowerCase().includes(q)
      );
    }
    return list;
  }, [adminDaily.classStats, selectedGrade, adminSearchTerm]);

  // 2. Thống kê theo tuần (Admin)
  const adminWeekly = useMemo(() => {
    return getAdminWeeklyStats(classes, students, selectedWeek, schoolYearName);
  }, [classes, students, selectedWeek, schoolYearName]);

  const filteredAdminWeeklyStats = useMemo(() => {
    let list = adminWeekly.classPeriodStats;
    if (selectedGrade !== 'all') {
      list = list.filter(c => {
        const match = (c.className || '').match(/^(\d+)/);
        return match ? match[1] === selectedGrade : c.className.startsWith(selectedGrade);
      });
    }
    if (adminSearchTerm.trim()) {
      const q = adminSearchTerm.toLowerCase().trim();
      list = list.filter(c => 
        c.className.toLowerCase().includes(q) || 
        c.homeroomTeacher.toLowerCase().includes(q)
      );
    }
    return list;
  }, [adminWeekly.classPeriodStats, selectedGrade, adminSearchTerm]);

  // 3. Thống kê theo tháng (Admin)
  const adminMonthly = useMemo(() => {
    const curYear = new Date().getFullYear();
    const effectiveYear = selectedMonth >= 8 ? curYear : curYear + 1;
    return getAdminMonthlyStats(classes, students, selectedMonth, effectiveYear);
  }, [classes, students, selectedMonth]);

  const filteredAdminMonthlyStats = useMemo(() => {
    let list = adminMonthly.classPeriodStats;
    if (selectedGrade !== 'all') {
      list = list.filter(c => {
        const match = (c.className || '').match(/^(\d+)/);
        return match ? match[1] === selectedGrade : c.className.startsWith(selectedGrade);
      });
    }
    if (adminSearchTerm.trim()) {
      const q = adminSearchTerm.toLowerCase().trim();
      list = list.filter(c => 
        c.className.toLowerCase().includes(q) || 
        c.homeroomTeacher.toLowerCase().includes(q)
      );
    }
    return list;
  }, [adminMonthly.classPeriodStats, selectedGrade, adminSearchTerm]);

  // ----------------------------------------------------------------------
  // DỮ LIỆU DÀNH CHO GIÁO VIÊN CHỦ NHIỆM (TEACHER)
  // ----------------------------------------------------------------------
  // 1. Thống kê theo ngày của lớp chủ nhiệm
  const teacherDailyList = useMemo<TeacherDayRow[]>(() => {
    return getTeacherClassDailyList(targetClassStudents, selectedDate);
  }, [targetClassStudents, selectedDate]);

  // 2. Thống kê theo tuần của lớp chủ nhiệm
  const teacherWeeklyList = useMemo<TeacherWeekRow[]>(() => {
    return getTeacherClassWeeklyList(targetClassStudents, schoolYearName, 6);
  }, [targetClassStudents, schoolYearName]);

  // 3. Thống kê theo tháng của lớp chủ nhiệm
  const teacherMonthlyList = useMemo<TeacherMonthRow[]>(() => {
    const curYear = new Date().getFullYear();
    return getTeacherClassMonthlyList(targetClassStudents, curYear);
  }, [targetClassStudents]);

  // Quick navigation helpers for days
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // Helper render badge tỷ lệ %
  const renderRateBadge = (rate: number, isDone: boolean = true) => {
    if (!isDone) {
      return (
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
          Chưa điểm danh
        </span>
      );
    }
    let colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    let barColor = 'bg-rose-500';
    if (rate >= 98) {
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold';
      barColor = 'bg-emerald-500';
    } else if (rate >= 95) {
      colorClass = 'bg-teal-50 text-teal-800 border-teal-200 font-bold';
      barColor = 'bg-teal-500';
    } else if (rate >= 90) {
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      barColor = 'bg-amber-500';
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-12 sm:w-16 bg-slate-100 rounded-full h-2 overflow-hidden shrink-0 hidden sm:block">
          <div 
            className={`h-full rounded-full ${barColor}`} 
            style={{ width: `${Math.min(rate, 100)}%` }} 
          />
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-md border ${colorClass}`}>
          {rate}%
        </span>
      </div>
    );
  };

  // Xuất Excel cho bảng thống kê hiện tại
  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      if (mode === 'admin') {
        if (timeView === 'day') {
          const headers = ['STT', 'Lớp', 'GVCN', 'Sĩ Số', 'Có Mặt', 'Vắng (Có phép)', 'Vắng (Không phép)', 'Đi Trễ', 'Tỉ Lệ Chuyên Cần (%)', 'Trạng Thái'];
          const data = filteredAdminDailyStats.map((c, i) => [
            i + 1,
            c.className,
            c.homeroomTeacher,
            c.total,
            c.isAttendanceDone ? c.present : 0,
            c.isAttendanceDone ? c.absentP : 0,
            c.isAttendanceDone ? c.absentKP : 0,
            c.isAttendanceDone ? c.late : 0,
            c.isAttendanceDone ? `${c.rate}%` : 'Chưa điểm danh',
            c.isAttendanceDone ? 'Đã điểm danh' : 'Chưa điểm danh'
          ]);
          const ws = XLSX.utils.aoa_to_sheet([
            [`BÁO CÁO THỐNG KÊ & ĐỐI CHIẾU CHUYÊN CẦN TOÀN TRƯỜNG NGÀY ${selectedDate.split('-').reverse().join('/')}`],
            [`Tổng sĩ số: ${adminDaily.summary.totalStudents} | Có mặt: ${adminDaily.summary.totalPresent} (${adminDaily.summary.overallRate}%) | Vắng: ${adminDaily.summary.totalAbsentP + adminDaily.summary.totalAbsentKP}`],
            [],
            headers,
            ...data
          ]);
          XLSX.utils.book_append_sheet(wb, ws, 'Chuyen_Can_Theo_Ngay');
          XLSX.writeFile(wb, `Chuyen_Can_Toan_Truong_${selectedDate}.xlsx`);
        } else if (timeView === 'week') {
          const headers = ['Hạng', 'Lớp', 'GVCN', 'Sĩ Số', 'Số Buổi ĐD', 'Tổng Có Mặt', 'Tổng Vắng (Có phép)', 'Tổng Vắng (Không phép)', 'Tổng Đi Trễ', 'Tỉ Lệ Tuần (%)', 'Xếp Loại Thi Đua'];
          const data = filteredAdminWeeklyStats.map(c => [
            c.rank || 1,
            c.className,
            c.homeroomTeacher,
            c.total,
            c.recordedDays,
            c.totalPresent,
            c.totalAbsentP,
            c.totalAbsentKP,
            c.totalLate,
            `${c.rate}%`,
            c.assessment
          ]);
          const ws = XLSX.utils.aoa_to_sheet([
            [`BÁO CÁO THỐNG KÊ & ĐỐI CHIẾU CHUYÊN CẦN TUẦN ${selectedWeek} (${adminWeekly.summary.dateRange})`],
            [`Tỷ lệ chuyên cần trung bình toàn trường: ${adminWeekly.summary.overallAverageRate}% | Lớp dẫn đầu: ${adminWeekly.summary.topClass}`],
            [],
            headers,
            ...data
          ]);
          XLSX.utils.book_append_sheet(wb, ws, 'Chuyen_Can_Theo_Tuan');
          XLSX.writeFile(wb, `Chuyen_Can_Toan_Truong_Tuan_${selectedWeek}.xlsx`);
        } else {
          const headers = ['Hạng', 'Lớp', 'GVCN', 'Sĩ Số', 'Số Buổi ĐD', 'Tổng Có Mặt', 'Tổng Vắng (Có phép)', 'Tổng Vắng (Không phép)', 'Tổng Đi Trễ', 'Tỉ Lệ Tháng (%)', 'Đánh Giá'];
          const data = filteredAdminMonthlyStats.map(c => [
            c.rank || 1,
            c.className,
            c.homeroomTeacher,
            c.total,
            c.recordedDays,
            c.totalPresent,
            c.totalAbsentP,
            c.totalAbsentKP,
            c.totalLate,
            `${c.rate}%`,
            c.assessment
          ]);
          const ws = XLSX.utils.aoa_to_sheet([
            [`BÁO CÁO THỐNG KÊ & ĐỐI CHIẾU CHUYÊN CẦN THÁNG ${selectedMonth}`],
            [`Tỷ lệ trung bình toàn trường: ${adminMonthly.summary.overallAverageRate}% | Lớp xuất sắc: ${adminMonthly.summary.topClass}`],
            [],
            headers,
            ...data
          ]);
          XLSX.utils.book_append_sheet(wb, ws, 'Chuyen_Can_Theo_Thang');
          XLSX.writeFile(wb, `Chuyen_Can_Toan_Truong_Thang_${selectedMonth}.xlsx`);
        }
      } else {
        // Teacher mode
        const currentName = currentClassName || 'Lop_Chu_Nhiem';
        if (timeView === 'day') {
          const headers = ['Ngày Học', 'Sĩ Số', 'Có Mặt', 'Vắng Có Phép', 'Vắng Không Phép', 'Đi Trễ', 'Tỉ Lệ (%)', 'Danh Sách Học Sinh Vắng', 'Trạng Thái'];
          const data = teacherDailyList.map(r => [
            r.dayLabel,
            r.total,
            r.isDone ? r.present : 0,
            r.isDone ? r.absentP : 0,
            r.isDone ? r.absentKP : 0,
            r.isDone ? r.late : 0,
            r.isDone ? `${r.rate}%` : 'Chưa điểm danh',
            r.absentStudents.map(s => `${s.fullName} (${s.reason})`).join(', ') || 'Không có',
            r.isDone ? 'Đã điểm danh' : 'Chưa điểm danh'
          ]);
          const ws = XLSX.utils.aoa_to_sheet([
            [`BÁO CÁO CHUYÊN CẦN THEO NGÀY - LỚP ${currentName.toUpperCase()}`],
            [],
            headers,
            ...data
          ]);
          XLSX.utils.book_append_sheet(wb, ws, 'Chuyen_Can_Cac_Ngay');
          XLSX.writeFile(wb, `Chuyen_Can_${currentName}_Theo_Ngay.xlsx`);
        } else if (timeView === 'week') {
          const headers = ['Tuần Học', 'Khoảng Thời Gian', 'Sĩ Số', 'Số Buổi ĐD', 'Tổng Lượt Có Mặt', 'Vắng Có Phép', 'Vắng Không Phép', 'Đi Trễ', 'Tỉ Lệ Tuần (%)', 'Đánh Giá Thi Đua'];
          const data = teacherWeeklyList.map(w => [
            w.weekName,
            w.dateRangeDisplay,
            w.total,
            w.recordedDays,
            w.presentCount,
            w.absentPCount,
            w.absentKPCount,
            w.lateCount,
            `${w.rate}%`,
            w.evaluation
          ]);
          const ws = XLSX.utils.aoa_to_sheet([
            [`BÁO CÁO TỔNG HỢP CHUYÊN CẦN THEO TUẦN - LỚP ${currentName.toUpperCase()}`],
            [],
            headers,
            ...data
          ]);
          XLSX.utils.book_append_sheet(wb, ws, 'Chuyen_Can_Cac_Tuan');
          XLSX.writeFile(wb, `Chuyen_Can_${currentName}_Theo_Tuan.xlsx`);
        } else {
          const headers = ['Tháng Học', 'Sĩ Số', 'Số Buổi ĐD', 'Tổng Lượt Có Mặt', 'Vắng Có Phép', 'Vắng Không Phép', 'Đi Trễ', 'Tỉ Lệ Tháng (%)', 'Đánh Giá Nề Nếp'];
          const data = teacherMonthlyList.map(m => [
            m.monthName,
            m.total,
            m.recordedDays,
            m.presentCount,
            m.absentPCount,
            m.absentKPCount,
            m.lateCount,
            `${m.rate}%`,
            m.evaluation
          ]);
          const ws = XLSX.utils.aoa_to_sheet([
            [`BÁO CÁO TỔNG HỢP CHUYÊN CẦN THEO THÁNG - LỚP ${currentName.toUpperCase()}`],
            [],
            headers,
            ...data
          ]);
          XLSX.utils.book_append_sheet(wb, ws, 'Chuyen_Can_Cac_Thang');
          XLSX.writeFile(wb, `Chuyen_Can_${currentName}_Theo_Thang.xlsx`);
        }
      }

      showAlert('Xuất báo cáo Excel thống kê chuyên cần thành công!', 'success');
    } catch (e) {
      console.error(e);
      showAlert('Lỗi khi xuất file Excel báo cáo.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-[22px] border border-teal-100 shadow-sm shadow-teal-500/5 overflow-hidden flex flex-col">
      {/* HEADER SECTION */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 via-emerald-50/30 to-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span>
                  {mode === 'admin' 
                    ? 'BẢNG THỐNG KÊ & ĐỐI CHIẾU TỈ LỆ CHUYÊN CẦN' 
                    : `BẢNG THỐNG KÊ CHUYÊN CẦN LỚP ${currentClassName || 'CHỦ NHIỆM'}`}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800 border border-teal-200">
                  {mode === 'admin' ? 'So sánh đối chiếu tổng thể' : 'Nắm tình hình nề nếp lớp'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'admin'
                  ? 'Theo dõi, xếp hạng và so sánh tỉ lệ chuyên cần giữa các khối lớp theo Ngày, Tuần, Tháng'
                  : 'Nắm chi tiết lịch sử chuyên cần, các ngày vắng và các tuần thi đua của lớp'}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS: 3 Segmented Tabs (Ngày / Tuần / Tháng) & Export Excel */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* 3 Tabs */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeView('day')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                timeView === 'day'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Theo Ngày</span>
            </button>

            <button
              onClick={() => setTimeView('week')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                timeView === 'week'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Theo Tuần</span>
            </button>

            <button
              onClick={() => setTimeView('month')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                timeView === 'month'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Theo Tháng</span>
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-teal-50 border border-teal-200 text-teal-700 hover:text-teal-800 rounded-xl font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            title="Xuất bảng thống kê chuyên cần ra file Excel"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* FILTER & PERIOD SELECTOR STRIP */}
      <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* VIEW 1: THEO NGÀY CONTROLS */}
        {timeView === 'day' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Chọn ngày:</span>
            </span>

            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={() => handleShiftDate(-1)}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                title="Lùi 1 ngày"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none px-1 cursor-pointer"
              />
              <button
                onClick={() => handleShiftDate(1)}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                title="Tới 1 ngày"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
          </div>
        )}

        {/* VIEW 2: THEO TUẦN CONTROLS */}
        {timeView === 'week' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Chọn tuần học:</span>
            </span>

            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              {schoolWeeks.slice(0, 36).map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}: {w.startFormatted} - {w.endFormatted} {w.isCurrent ? ' (Tuần hiện tại)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedWeek(currentWeekNumber)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition-colors cursor-pointer"
            >
              Tuần hiện tại ({currentWeekNumber})
            </button>
          </div>
        )}

        {/* VIEW 3: THEO THÁNG CONTROLS */}
        {timeView === 'month' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Chọn tháng:</span>
            </span>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              {[8, 9, 10, 11, 12, 1, 2, 3, 4, 5].map(m => (
                <option key={m} value={m}>
                  Tháng {String(m).padStart(2, '0')} {m === currentMonthNumber ? '(Tháng hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* EXTRA FILTERS DÀNH CHO ADMIN (Lọc khối & Tìm kiếm) */}
        {mode === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Grade filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-0.5 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium">Khối:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toàn trường</option>
                {availableGrades.map(g => (
                  <option key={g} value={g}>Khối {g}</option>
                ))}
              </select>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <input
                type="text"
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
                placeholder="Tìm lớp / GVCN..."
                className="w-32 sm:w-44 bg-white border border-slate-300 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>
          </div>
        )}
      </div>

      {/* QUICK SUMMARY CARDS STRIP */}
      {mode === 'admin' ? (
        <div className="px-4 py-3 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
          {timeView === 'day' ? (
            <>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Sĩ số toàn trường</span>
                <span className="text-base font-extrabold text-slate-800">{adminDaily.summary.totalStudents} HS</span>
              </div>
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-600 font-semibold block uppercase">Có mặt hôm nay</span>
                <span className="text-base font-extrabold text-emerald-700">{adminDaily.summary.totalPresent} ({adminDaily.summary.overallRate}%)</span>
              </div>
              <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200">
                <span className="text-[11px] text-rose-600 font-semibold block uppercase">Tổng HS Vắng</span>
                <span className="text-base font-extrabold text-rose-700">{adminDaily.summary.totalAbsentP + adminDaily.summary.totalAbsentKP} HS</span>
                <span className="text-[10px] text-rose-600 ml-1">({adminDaily.summary.totalAbsentP} P • {adminDaily.summary.totalAbsentKP} KP)</span>
              </div>
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-700 font-semibold block uppercase">Tiến độ điểm danh</span>
                <span className="text-base font-extrabold text-amber-800">{adminDaily.summary.checkedClassesCount}/{adminDaily.summary.totalClasses} lớp</span>
              </div>
            </>
          ) : timeView === 'week' ? (
            <>
              <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="text-[11px] text-teal-700 font-semibold block uppercase">Chuyên cần TB tuần</span>
                <span className="text-base font-extrabold text-teal-800">{adminWeekly.summary.overallAverageRate}%</span>
              </div>
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-700 font-semibold block uppercase">Lớp dẫn đầu tuần</span>
                <span className="text-base font-extrabold text-amber-800 truncate block">{adminWeekly.summary.topClass}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Khoảng ngày tuần</span>
                <span className="text-xs font-bold text-slate-800">{adminWeekly.summary.dateRange}</span>
              </div>
              <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200">
                <span className="text-[11px] text-purple-700 font-semibold block uppercase">Tổng lớp đối chiếu</span>
                <span className="text-base font-extrabold text-purple-800">{adminWeekly.summary.totalClasses} lớp</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="text-[11px] text-teal-700 font-semibold block uppercase">Chuyên cần TB tháng</span>
                <span className="text-base font-extrabold text-teal-800">{adminMonthly.summary.overallAverageRate}%</span>
              </div>
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 font-semibold block uppercase">Lớp xuất sắc nhất</span>
                <span className="text-base font-extrabold text-emerald-800 truncate block">{adminMonthly.summary.topClass}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Kỳ thống kê</span>
                <span className="text-xs font-bold text-slate-800">{adminMonthly.summary.monthName}</span>
              </div>
              <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <span className="text-[11px] text-indigo-700 font-semibold block uppercase">Xếp loại toàn trường</span>
                <span className="text-xs font-extrabold text-indigo-800">Đạt chuẩn thi đua</span>
              </div>
            </>
          )}
        </div>
      ) : (
        /* TEACHER QUICK SUMMARY STRIP */
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Sĩ số lớp: <strong className="text-slate-800">{targetClassStudents.length} học sinh</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              {timeView === 'day' && `Thống kê ngày: ${selectedDate.split('-').reverse().join('/')}`}
              {timeView === 'week' && `Thống kê Tuần ${selectedWeek} (${schoolWeeks.find(w => w.id === selectedWeek)?.startFormatted} - ${schoolWeeks.find(w => w.id === selectedWeek)?.endFormatted})`}
              {timeView === 'month' && `Thống kê Tháng ${selectedMonth}`}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            {timeView === 'day' && 'Chi tiết các ngày học trong tuần'}
            {timeView === 'week' && 'Bảng theo dõi các tuần học'}
            {timeView === 'month' && 'Bảng tổng kết chuyên cần các tháng'}
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TABLE SECTION */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        
        {/* ================================================================ */}
        {/* 1. ADMIN - THEO NGÀY (So sánh đối chiếu toàn bộ các lớp trong ngày) */}
        {/* ================================================================ */}
        {mode === 'admin' && timeView === 'day' && (
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs sticky top-0 z-10 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-center w-12 text-teal-100">STT</th>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">LỚP</th>
                <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-white whitespace-nowrap">GVCN</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">CÓ MẶT</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (P)</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (KP)</th>
                <th className="hidden lg:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                <th className="px-3 sm:px-4 py-3 text-center text-white whitespace-nowrap">TỈ LỆ CHUYÊN CẦN</th>
                <th className="hidden sm:table-cell px-3 py-3 text-center text-white whitespace-nowrap">ĐÁNH GIÁ</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAdminDailyStats.length > 0 ? (
                filteredAdminDailyStats.map((c, idx) => (
                  <tr key={c.classId} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-3 sm:px-4 py-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{c.className}</td>
                    <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-slate-600 text-xs">{c.homeroomTeacher}</td>
                    <td className="px-2 sm:px-3 py-3 text-center font-bold text-slate-800">{c.total}</td>
                    <td className="px-2 sm:px-3 py-3 text-center text-xs sm:text-sm">
                      {c.isAttendanceDone ? (
                        <span className="font-bold text-emerald-700">{c.present}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center">
                      {c.isAttendanceDone && c.absentP > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 text-xs">
                          {c.absentP}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center">
                      {c.isAttendanceDone && c.absentKP > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-xs">
                          {c.absentKP}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-2 sm:px-3 py-3 text-center text-slate-500">
                      {c.isAttendanceDone && c.late > 0 ? (
                        <span className="font-bold text-amber-600">{c.late}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      {renderRateBadge(c.rate, c.isAttendanceDone)}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3 text-center">
                      {!c.isAttendanceDone ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Chờ ĐD
                        </span>
                      ) : c.rate >= 98 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Xuất sắc
                        </span>
                      ) : c.rate >= 95 ? (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          Tốt
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Cần lưu ý
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectClass?.(c.classId);
                          onNavigateToAttendance?.(c.classId);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-white hover:bg-teal-600 border border-teal-300 rounded-lg transition-colors cursor-pointer"
                      >
                        {c.isAttendanceDone ? 'Xem sổ ĐD' : 'Điểm danh'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-slate-400 italic">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ================================================================ */}
        {/* 2. ADMIN - THEO TUẦN (So sánh đối chiếu toàn bộ các lớp trong tuần) */}
        {/* ================================================================ */}
        {mode === 'admin' && timeView === 'week' && (
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs sticky top-0 z-10 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-center w-14 text-teal-100">HẠNG</th>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">LỚP</th>
                <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-white whitespace-nowrap">GVCN</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SỐ BUỔI ĐD</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">LƯỢT HIỆN DIỆN</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (P)</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (KP)</th>
                <th className="hidden lg:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                <th className="px-3 sm:px-4 py-3 text-center text-white whitespace-nowrap">TỈ LỆ TUẦN</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">XẾP LOẠI THI ĐUA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAdminWeeklyStats.length > 0 ? (
                filteredAdminWeeklyStats.map(c => (
                  <tr key={c.classId} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        c.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        c.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        c.rank === 3 ? 'bg-amber-50 text-amber-800' :
                        'text-slate-400'
                      }`}>
                        {c.rank}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{c.className}</td>
                    <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-slate-600 text-xs">{c.homeroomTeacher}</td>
                    <td className="px-2 sm:px-3 py-3 text-center font-bold text-slate-800">{c.total}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-slate-500">{c.recordedDays} buổi</td>
                    <td className="px-2 sm:px-3 py-3 text-center font-bold text-emerald-700">{c.totalPresent}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-teal-700 font-semibold">{c.totalAbsentP}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-rose-700 font-semibold">{c.totalAbsentKP}</td>
                    <td className="hidden lg:table-cell px-2 sm:px-3 py-3 text-center text-amber-700 font-semibold">{c.totalLate}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      {renderRateBadge(c.rate)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        c.rate >= 98 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        c.rate >= 95 ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {c.rank === 1 && <Award className="w-3 h-3 text-amber-600" />}
                        <span>{c.assessment}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-slate-400 italic">
                    Không có số liệu chuyên cần tuần này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ================================================================ */}
        {/* 3. ADMIN - THEO THÁNG (So sánh đối chiếu toàn bộ các lớp trong tháng) */}
        {/* ================================================================ */}
        {mode === 'admin' && timeView === 'month' && (
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs sticky top-0 z-10 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-center w-14 text-teal-100">HẠNG</th>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">LỚP</th>
                <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-white whitespace-nowrap">GVCN</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SỐ NGÀY ĐD</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">TỔNG CÓ MẶT</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG CÓ PHÉP</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG K.PHÉP</th>
                <th className="hidden lg:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                <th className="px-3 sm:px-4 py-3 text-center text-white whitespace-nowrap">TỈ LỆ THÁNG</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">ĐÁNH GIÁ NỀ NẾP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAdminMonthlyStats.length > 0 ? (
                filteredAdminMonthlyStats.map(c => (
                  <tr key={c.classId} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        c.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        c.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        c.rank === 3 ? 'bg-amber-50 text-amber-800' :
                        'text-slate-400'
                      }`}>
                        {c.rank}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{c.className}</td>
                    <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-slate-600 text-xs">{c.homeroomTeacher}</td>
                    <td className="px-2 sm:px-3 py-3 text-center font-bold text-slate-800">{c.total}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-slate-500">{c.recordedDays} ngày</td>
                    <td className="px-2 sm:px-3 py-3 text-center font-bold text-emerald-700">{c.totalPresent}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-teal-700 font-semibold">{c.totalAbsentP}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-rose-700 font-semibold">{c.totalAbsentKP}</td>
                    <td className="hidden lg:table-cell px-2 sm:px-3 py-3 text-center text-amber-700 font-semibold">{c.totalLate}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      {renderRateBadge(c.rate)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        c.rate >= 98 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        c.rate >= 95 ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {c.assessment}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-slate-400 italic">
                    Không có số liệu tháng này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* ================================================================ */}
        {/* 4. TEACHER - THEO NGÀY (Bảng chi tiết từng ngày học của lớp chủ nhiệm) */}
        {/* ================================================================ */}
        {mode === 'teacher' && timeView === 'day' && (
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs sticky top-0 z-10 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">NGÀY HỌC</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">CÓ MẶT</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (P)</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (KP)</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                <th className="px-3 sm:px-4 py-3 text-center text-white whitespace-nowrap">TỈ LỆ NGÀY</th>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">HỌC SINH VẮNG TRONG NGÀY</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {teacherDailyList.map(r => (
                <tr 
                  key={r.date} 
                  className={`hover:bg-teal-50/40 transition-colors ${r.isToday ? 'bg-teal-50/30' : ''}`}
                >
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{r.dayLabel}</span>
                      {r.isToday && (
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                          Hôm nay
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-center font-bold text-slate-800">{r.total}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-xs sm:text-sm">
                    {r.isDone ? (
                      <span className="font-bold text-emerald-700">{r.present}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-center">
                    {r.isDone && r.absentP > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 text-xs">
                        {r.absentP}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-center">
                    {r.isDone && r.absentKP > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-xs">
                        {r.absentKP}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-slate-500">
                    {r.isDone && r.late > 0 ? (
                      <span className="font-bold text-amber-600">{r.late}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {renderRateBadge(r.rate, r.isDone)}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs">
                    {r.absentStudents.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {r.absentStudents.map((s, idx) => (
                          <span 
                            key={idx}
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                              s.isExcused 
                                ? 'bg-teal-50 text-teal-800 border-teal-200' 
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                            title={`Lý do: ${s.reason}`}
                          >
                            {s.fullName} ({s.isExcused ? 'P' : 'KP'})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Không có vắng</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    {r.isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Đã ĐD
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedDate(r.date);
                          onNavigateToAttendance?.(currentClassId);
                        }}
                        className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        Điểm danh
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ================================================================ */}
        {/* 5. TEACHER - THEO TUẦN (Bảng theo dõi các tuần học của lớp chủ nhiệm) */}
        {/* ================================================================ */}
        {mode === 'teacher' && timeView === 'week' && (
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs sticky top-0 z-10 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">TUẦN HỌC</th>
                <th className="px-3 py-3 text-white whitespace-nowrap">KHOẢNG THỜI GIAN</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">BUỔI ĐD</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">LƯỢT HIỆN DIỆN</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (P)</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG (KP)</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                <th className="px-3 sm:px-4 py-3 text-center text-white whitespace-nowrap">TỈ LỆ TUẦN</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">THI ĐUA TUẦN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {teacherWeeklyList.map(w => (
                <tr 
                  key={w.weekId} 
                  className={`hover:bg-teal-50/40 transition-colors ${w.isCurrent ? 'bg-teal-50/30' : ''}`}
                >
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{w.weekName}</span>
                      {w.isCurrent && (
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                          Hiện tại
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600 text-xs">{w.dateRangeDisplay}</td>
                  <td className="px-2 sm:px-3 py-3 text-center font-bold text-slate-800">{w.total}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-slate-500">{w.recordedDays} buổi</td>
                  <td className="px-2 sm:px-3 py-3 text-center font-bold text-emerald-700">{w.presentCount}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-teal-700 font-semibold">{w.absentPCount}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-rose-700 font-semibold">{w.absentKPCount}</td>
                  <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-amber-700">{w.lateCount}</td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {renderRateBadge(w.rate)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      w.evaluation === 'Xuất sắc' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      w.evaluation === 'Tốt' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {w.evaluation === 'Xuất sắc' && <Sparkles className="w-3 h-3 text-emerald-600" />}
                      <span>{w.evaluation}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ================================================================ */}
        {/* 6. TEACHER - THEO THÁNG (Bảng tổng kết chuyên cần các tháng của lớp) */}
        {/* ================================================================ */}
        {mode === 'teacher' && timeView === 'month' && (
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider shadow-xs sticky top-0 z-10 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">THÁNG HỌC</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SĨ SỐ</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">SỐ NGÀY ĐD</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">TỔNG LƯỢT CÓ MẶT</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG CÓ PHÉP</th>
                <th className="px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">VẮNG K.PHÉP</th>
                <th className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-white whitespace-nowrap">ĐI TRỄ</th>
                <th className="px-3 sm:px-4 py-3 text-center text-white whitespace-nowrap">TỈ LỆ THÁNG</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">ĐÁNH GIÁ NỀ NẾP</th>
                <th className="px-3 py-3 text-white whitespace-nowrap">CẦN LƯU Ý (NGHỈ NHIỀU)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {teacherMonthlyList.map(m => (
                <tr 
                  key={m.monthIndex} 
                  className={`hover:bg-teal-50/40 transition-colors ${m.isCurrent ? 'bg-teal-50/30' : ''}`}
                >
                  <td className="px-3 sm:px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                    {m.monthName}
                    {m.isCurrent && (
                      <span className="ml-1.5 text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                        Tháng này
                      </span>
                    )}
                  </td>
                  <td className="px-2 sm:px-3 py-3 text-center font-bold text-slate-800">{m.total}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-slate-500">{m.recordedDays} ngày</td>
                  <td className="px-2 sm:px-3 py-3 text-center font-bold text-emerald-700">{m.presentCount}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-teal-700 font-semibold">{m.absentPCount}</td>
                  <td className="px-2 sm:px-3 py-3 text-center text-rose-700 font-semibold">{m.absentKPCount}</td>
                  <td className="hidden sm:table-cell px-2 sm:px-3 py-3 text-center text-amber-700">{m.lateCount}</td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {renderRateBadge(m.rate)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      m.evaluation === 'Xuất sắc' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      m.evaluation === 'Tốt' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {m.evaluation}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {m.frequentAbsentStudents.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {m.frequentAbsentStudents.map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                            {s.name} ({s.count}b)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-700 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Không có HS vắng nhiều
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
