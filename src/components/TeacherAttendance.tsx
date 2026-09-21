import React, { useState, useMemo } from 'react';
import { Student } from '../data';
import { 
  Calendar, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Check, 
  Users, 
  Percent,
  FileSpreadsheet,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
  Edit2
} from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

interface TeacherAttendanceProps {
  role?: string;
  students: Student[];
  classId: string;
  className?: string;
  onEditStudent: (student: Student) => void;
}

const getLocalDateISO = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const QUICK_REASONS = {
  absent: ['Có phép', 'Nghỉ ốm', 'Không phép', 'Việc gia đình'],
  late: ['Kẹt xe', 'Xe hỏng', 'Ngủ quên', 'Lý do khác'],
  leave_early: ['PH đón sớm', 'Bị mệt', 'Khám bệnh', 'Việc gấp']
};

export default function TeacherAttendance({
  role,
  students,
  classId,
  className = '',
  onEditStudent
}: TeacherAttendanceProps) {
  const { showAlert } = useAlert();
  const [attendanceDate, setAttendanceDate] = useState(() => getLocalDateISO());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'leave_early' | 'unmarked'>('all');
  const [editingReasonStudentId, setEditingReasonStudentId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  // Sắp xếp học sinh theo STT
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => (a.stt || 0) - (b.stt || 0));
  }, [students]);

  // Thống kê điểm danh cho ngày được chọn
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let absentWithPermission = 0;
    let absentNoPermission = 0;
    let late = 0;
    let leaveEarly = 0;
    let unmarked = 0;

    sortedStudents.forEach(s => {
      const record = s.attendanceRecords?.[attendanceDate];
      if (!record || !record.status) {
        unmarked++;
      } else if (record.status === 'present') {
        present++;
      } else if (record.status === 'absent') {
        absent++;
        const reason = record.reason?.toLowerCase() || '';
        if (reason.includes('phép') || reason.includes('p') || reason.includes('om') || reason.includes('ốm')) {
          absentWithPermission++;
        } else {
          absentNoPermission++;
        }
      } else if (record.status === 'late') {
        late++;
      } else if (record.status === 'leave_early') {
        leaveEarly++;
      }
    });

    const total = sortedStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      absentWithPermission,
      absentNoPermission,
      late,
      leaveEarly,
      unmarked,
      rate
    };
  }, [sortedStudents, attendanceDate]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    return sortedStudents.filter(student => {
      const matchSearch = 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchSearch) return false;

      const record = student.attendanceRecords?.[attendanceDate];
      const status = record?.status;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'unmarked') return !status;
      return status === statusFilter;
    });
  }, [sortedStudents, searchTerm, statusFilter, attendanceDate]);

  // Cập nhật trạng thái điểm danh
  const handleStatusChange = (student: Student, newStatus: 'present' | 'absent' | 'late' | 'leave_early') => {
    const currentRecords = student.attendanceRecords || {};
    const existingForDate = currentRecords[attendanceDate];
    
    const updatedStudent: Student = {
      ...student,
      attendanceRecords: {
        ...currentRecords,
        [attendanceDate]: {
          status: newStatus,
          reason: newStatus === 'present' ? '' : (existingForDate?.reason || ''),
          time: new Date().toLocaleTimeString('vi-VN')
        }
      }
    };

    onEditStudent(updatedStudent);
  };

  // Cập nhật lý do
  const handleSaveReason = (student: Student, reason: string) => {
    const currentRecords = student.attendanceRecords || {};
    const existingForDate = currentRecords[attendanceDate] || { status: 'absent', time: new Date().toLocaleTimeString('vi-VN') };

    const updatedStudent: Student = {
      ...student,
      attendanceRecords: {
        ...currentRecords,
        [attendanceDate]: {
          ...existingForDate,
          reason: reason.trim()
        }
      }
    };

    onEditStudent(updatedStudent);
    setEditingReasonStudentId(null);
  };

  // Thay đổi ngày (lùi / tiến)
  const changeDateByDays = (delta: number) => {
    const [y, m, d] = attendanceDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    setAttendanceDate(getLocalDateISO(date));
  };

  const handleSetToday = () => {
    setAttendanceDate(getLocalDateISO());
  };

  const isToday = attendanceDate === getLocalDateISO();

  // Điểm danh nhanh: Đánh dấu tất cả có mặt
  const handleMarkAllPresent = () => {
    if (sortedStudents.length === 0) {
      showAlert('Lớp chưa có học sinh để điểm danh', 'error');
      return;
    }

    const timeStr = new Date().toLocaleTimeString('vi-VN');
    sortedStudents.forEach(student => {
      const currentRecords = student.attendanceRecords || {};
      const updatedStudent: Student = {
        ...student,
        attendanceRecords: {
          ...currentRecords,
          [attendanceDate]: {
            status: 'present',
            reason: '',
            time: timeStr
          }
        }
      };
      onEditStudent(updatedStudent);
    });

    showAlert(`Đã điểm danh Có mặt cho toàn bộ ${sortedStudents.length} học sinh ngày ${formattedDisplayDate}`, 'success');
  };

  // Xuất báo cáo điểm danh ra Excel
  const handleExportAttendance = async () => {
    try {
      if (sortedStudents.length === 0) {
        showAlert('Không có dữ liệu học sinh để xuất.', 'error');
        return;
      }
      const XLSX = await import('xlsx');
      const formattedDate = formattedDisplayDate;
      
      const data = sortedStudents.map((s, idx) => {
        const record = s.attendanceRecords?.[attendanceDate];
        let statusText = 'Chưa điểm danh';
        if (record?.status === 'present') statusText = 'Có mặt';
        else if (record?.status === 'absent') statusText = 'Vắng mặt';
        else if (record?.status === 'late') statusText = 'Đi trễ';
        else if (record?.status === 'leave_early') statusText = 'Về sớm';

        return {
          'STT': idx + 1,
          'Mã HS': s.code,
          'Họ và tên': s.fullName,
          'Ngày điểm danh': formattedDate,
          'Trạng thái': statusText,
          'Lý do': record?.reason || ''
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 30 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Diem_Danh');
      
      const fileName = `DiemDanh_${className || 'Lop'}_${attendanceDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showAlert('Xuất báo cáo điểm danh thành công!', 'success');
    } catch (e) {
      console.error(e);
      showAlert('Lỗi khi xuất báo cáo điểm danh', 'error');
    }
  };

  const formattedDisplayDate = useMemo(() => {
    try {
      const [y, m, d] = attendanceDate.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return attendanceDate;
    }
  }, [attendanceDate]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative p-3 sm:p-4 md:p-6 pb-28 md:pb-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 tracking-tight">
              Điểm danh {className ? `- Lớp ${className}` : ''}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              {isToday ? 'Hôm nay' : `Ngày ${formattedDisplayDate}`}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Quản lý chuyên cần • Chạm nhanh để điểm danh trực tiếp
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Quick Date Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Ngày hôm trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center px-2">
              <Calendar className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Ngày tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={handleSetToday}
                className="ml-1 px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg transition-colors"
                title="Về ngày hôm nay"
              >
                Hôm nay
              </button>
            )}
          </div>

          {/* Mark All Present Button */}
          <button
            onClick={handleMarkAllPresent}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            title="Đánh dấu tất cả học sinh có mặt hôm nay"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Tất cả có mặt</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportAttendance}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Xuất bảng điểm danh ngày này ra Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* MOBILE-ONLY: Compact Progress & Summary Strip (< md) */}
      <div className="md:hidden bg-white rounded-2xl border border-slate-200 p-3 mb-3 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Sĩ số: <strong className="text-slate-800">{stats.total}</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-teal-700">Tỷ lệ: {stats.rate}%</span>
          </div>
          {stats.unmarked > 0 ? (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Còn {stats.unmarked} chưa ĐD
            </span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3" /> Đã xong
            </span>
          )}
        </div>

        {/* Mini segmented stat bar */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div 
            onClick={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}
            className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'present' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            <div className="text-xs font-bold leading-tight">{stats.present}</div>
            <div className="text-[10px] opacity-80 leading-tight">Có mặt</div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'absent' ? 'all' : 'absent')}
            className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'absent' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-800'
            }`}
          >
            <div className="text-xs font-bold leading-tight">{stats.absent}</div>
            <div className="text-[10px] opacity-80 leading-tight">Vắng</div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'late' ? 'all' : 'late')}
            className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'late' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-50 text-amber-800'
            }`}
          >
            <div className="text-xs font-bold leading-tight">{stats.late}</div>
            <div className="text-[10px] opacity-80 leading-tight">Trễ</div>
          </div>

          <div 
            onClick={() => setStatusFilter(statusFilter === 'leave_early' ? 'all' : 'leave_early')}
            className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'leave_early' ? 'bg-indigo-600 text-white font-bold' : 'bg-indigo-50 text-indigo-800'
            }`}
          >
            <div className="text-xs font-bold leading-tight">{stats.leaveEarly}</div>
            <div className="text-[10px] opacity-80 leading-tight">Về sớm</div>
          </div>
        </div>
      </div>

      {/* DESKTOP KPI Cards (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Sĩ số lớp</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Học sinh</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Có mặt</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.present}</div>
          <span className="text-[11px] text-emerald-600/80 font-medium">Đúng giờ</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-red-100 bg-red-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-semibold">Vắng mặt</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
          <span className="text-[11px] text-red-600/80 font-medium">
            {stats.absentWithPermission} có phép • {stats.absentNoPermission} ko phép
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-semibold">Đi trễ</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{stats.late}</div>
          <span className="text-[11px] text-amber-600/80 font-medium">Cần nhắc nhở</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-semibold">Về sớm</span>
            <AlertCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">{stats.leaveEarly}</div>
          <span className="text-[11px] text-indigo-600/80 font-medium">Đã xin phép</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-teal-100 bg-teal-50/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-700 mb-1">
            <span className="text-xs font-semibold">Tỷ lệ chuyên cần</span>
            <Percent className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-800">{stats.rate}%</div>
          <span className="text-[11px] text-teal-600/80 font-medium">
            {stats.unmarked > 0 ? `Còn ${stats.unmarked} chưa DD` : 'Đã hoàn thành'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs hide-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({sortedStudents.length})
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === 'present' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Có mặt ({stats.present})
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === 'absent' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Vắng mặt ({stats.absent})
          </button>
          <button
            onClick={() => setStatusFilter('late')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === 'late' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đi trễ ({stats.late})
          </button>
          {stats.unmarked > 0 && (
            <button
              onClick={() => setStatusFilter('unmarked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === 'unmarked' ? 'bg-slate-800 text-white shadow-2xs' : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold'
              }`}
            >
              Chưa ĐD ({stats.unmarked})
            </button>
          )}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm tên hoặc mã HS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>
      </div>

      {/* MOBILE VIEW (< md): Touch-Friendly Card List */}
      <div className="md:hidden space-y-2.5">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Không tìm thấy học sinh nào</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm theo tên khác</p>
          </div>
        ) : (
          filteredStudents.map((student, idx) => {
            const record = student.attendanceRecords?.[attendanceDate];
            const currentStatus = record?.status;
            const currentReason = record?.reason || '';
            const isEditingReason = editingReasonStudentId === student.id;

            return (
              <div 
                key={student.id}
                className={`bg-white rounded-2xl border p-3 transition-all shadow-2xs ${
                  currentStatus === 'present'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : currentStatus === 'absent'
                    ? 'border-red-200 bg-red-50/15'
                    : currentStatus === 'late'
                    ? 'border-amber-200 bg-amber-50/15'
                    : currentStatus === 'leave_early'
                    ? 'border-indigo-200 bg-indigo-50/15'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Card Header: STT, Student Name, Gender, Code */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {student.stt || idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 text-sm leading-tight">
                        {student.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{student.code}</span>
                        <span>•</span>
                        <span className={`px-1 py-0.2 rounded text-[10px] font-medium ${
                          student.gender === 'Nữ' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {student.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {currentStatus === 'present' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Có mặt
                      </span>
                    )}
                    {currentStatus === 'absent' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                        ✕ Vắng
                      </span>
                    )}
                    {currentStatus === 'late' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        ⏱ Đi trễ
                      </span>
                    )}
                    {currentStatus === 'leave_early' && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Về sớm
                      </span>
                    )}
                    {!currentStatus && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Chưa ĐD
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Large Touch Buttons (Có mặt, Vắng, Trễ, Về sớm) */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student, 'present')}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/60'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Có mặt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student, 'absent')}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      currentStatus === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200/60'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Vắng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student, 'late')}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/60'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Trễ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student, 'leave_early')}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      currentStatus === 'leave_early'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/60'
                    }`}
                  >
                    <span>Về sớm</span>
                  </button>
                </div>

                {/* Reason Section (When absent, late, or leave_early, or existing note) */}
                {currentStatus && currentStatus !== 'present' && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {/* Quick 1-tap reason tag chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh:</span>
                      {(QUICK_REASONS[currentStatus] || []).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleSaveReason(student, tag)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors ${
                            currentReason === tag
                              ? 'bg-teal-700 text-white border-teal-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-teal-50'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Inline edit reason */}
                    {isEditingReason ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          autoFocus
                          value={reasonInput}
                          onChange={(e) => setReasonInput(e.target.value)}
                          placeholder="Nhập lý do cụ thể..."
                          className="px-2.5 py-1 text-xs border border-teal-400 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveReason(student, reasonInput);
                            else if (e.key === 'Escape') setEditingReasonStudentId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveReason(student, reasonInput)}
                          className="px-2.5 py-1 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 shrink-0"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReasonStudentId(null)}
                          className="px-2 py-1 text-slate-500 text-xs rounded-lg hover:bg-slate-100 shrink-0"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setEditingReasonStudentId(student.id);
                          setReasonInput(currentReason);
                        }}
                        className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        <span className={`text-xs ${currentReason ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
                          {currentReason ? `Lý do: ${currentReason}` : 'Chạm để gõ lý do khác...'}
                        </span>
                        <Edit2 className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW (≥ md): Full Data Table */}
      <div className="hidden md:flex flex-1 bg-white border border-teal-100 rounded-2xl shadow-sm overflow-hidden flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f766e] text-white font-semibold">
              <tr>
                <th className="px-4 py-3.5 text-center w-14 text-white font-semibold">STT</th>
                <th className="px-4 py-3.5 text-white font-semibold w-28">Mã HS</th>
                <th className="px-4 py-3.5 text-white font-semibold min-w-[200px]">Họ và Tên</th>
                <th className="px-4 py-3.5 text-white font-semibold min-w-[320px]">
                  Trạng thái điểm danh ({formattedDisplayDate})
                </th>
                <th className="px-4 py-3.5 text-white font-semibold min-w-[240px]">
                  Lý do (Nếu vắng / trễ / về sớm)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HelpCircle className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">Không tìm thấy học sinh nào</p>
                      <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc tìm kiếm theo từ khóa khác</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const record = student.attendanceRecords?.[attendanceDate];
                  const currentStatus = record?.status;
                  const currentReason = record?.reason || '';
                  const isEditingReason = editingReasonStudentId === student.id;

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/60 transition-colors ${
                        !currentStatus ? 'bg-amber-50/10' : ''
                      }`}
                    >
                      {/* STT */}
                      <td className="px-4 py-3.5 text-center text-slate-500 font-medium">
                        {student.stt || idx + 1}
                      </td>

                      {/* Mã HS */}
                      <td className="px-4 py-3.5 font-mono text-xs text-teal-800 font-semibold">
                        {student.code}
                      </td>

                      {/* Họ và Tên */}
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{student.fullName}</span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                            student.gender === 'Nữ' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {student.gender}
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái điểm danh (Pill Buttons) */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          {/* Có mặt */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs font-bold scale-[1.02]'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 ${currentStatus === 'present' ? 'text-white' : 'text-emerald-600'}`} />
                            Có mặt
                          </button>

                          {/* Vắng mặt */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-red-600 text-white shadow-xs font-bold scale-[1.02]'
                                : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                          >
                            <XCircle className={`w-3.5 h-3.5 ${currentStatus === 'absent' ? 'text-white' : 'text-red-500'}`} />
                            Vắng mặt
                          </button>

                          {/* Đi trễ */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student, 'late')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs font-bold scale-[1.02]'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <Clock className={`w-3.5 h-3.5 ${currentStatus === 'late' ? 'text-white' : 'text-amber-500'}`} />
                            Đi trễ
                          </button>

                          {/* Về sớm */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student, 'leave_early')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              currentStatus === 'leave_early'
                                ? 'bg-indigo-600 text-white shadow-xs font-bold scale-[1.02]'
                                : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
                            }`}
                          >
                            Về sớm
                          </button>
                        </div>
                      </td>

                      {/* Lý do */}
                      <td className="px-4 py-3.5">
                        {isEditingReason ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              autoFocus
                              value={reasonInput}
                              onChange={(e) => setReasonInput(e.target.value)}
                              placeholder="Ví dụ: Bị sốt có đơn thuốc, đau bụng..."
                              className="px-2.5 py-1 text-xs border border-teal-400 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 w-full"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveReason(student, reasonInput);
                                else if (e.key === 'Escape') setEditingReasonStudentId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveReason(student, reasonInput)}
                              className="px-2.5 py-1 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 shrink-0"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingReasonStudentId(null)}
                              className="px-2 py-1 text-slate-500 text-xs rounded-lg hover:bg-slate-100 shrink-0"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingReasonStudentId(student.id);
                              setReasonInput(currentReason);
                            }}
                            className="group/reason flex items-center justify-between cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100/80 transition-colors"
                            title="Bấm vào để nhập hoặc sửa lý do"
                          >
                            <span className={`text-xs ${currentReason ? 'text-slate-700 font-medium' : 'text-slate-400 italic'}`}>
                              {currentReason || (currentStatus === 'absent' ? 'Nhập lý do vắng (nghỉ phép/ốm...)' : currentStatus === 'late' ? 'Nhập lý do đi trễ...' : 'Ghi chú lý do nếu có...')}
                            </span>
                            <span className="text-[10px] text-teal-600 opacity-0 group-hover/reason:opacity-100 font-medium ml-2 shrink-0">
                              Sửa
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
