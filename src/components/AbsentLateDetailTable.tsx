import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserX, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Phone, 
  Search, 
  Copy, 
  Check, 
  ArrowRight,
  Filter,
  Users,
  X,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { Student, SchoolClass } from '../data';
import * as XLSX from 'xlsx';

export interface AbsentLateRecord {
  student: Student;
  className: string;
  status: 'absent' | 'late' | 'leave_early';
  absentType?: 'excused' | 'unexcused';
  statusLabel: string;
  reason: string;
  time: string;
  parentPhone: string;
  parentName: string;
}

interface AbsentLateDetailTableProps {
  students: Student[];
  classes: SchoolClass[];
  selectedDate: string;
  onDateChange?: (date: string) => void;
  onNavigateToAttendance?: (classId: string) => void;
  title?: string;
  description?: string;
}

export default function AbsentLateDetailTable({
  students,
  classes,
  selectedDate,
  onDateChange,
  onNavigateToAttendance,
  title,
  description
}: AbsentLateDetailTableProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'excused' | 'unexcused' | 'late'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State for Date-range Excel Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(selectedDate);
  const [exportEndDate, setExportEndDate] = useState(selectedDate);
  const [exportClassId, setExportClassId] = useState<string>('all');
  const [exportScope, setExportScope] = useState<'all' | 'absent_only' | 'late_only'>('all');

  // Synchronize export dates when selectedDate changes and modal is closed
  useEffect(() => {
    if (!showExportModal) {
      setExportStartDate(selectedDate);
      setExportEndDate(selectedDate);
    }
  }, [selectedDate, showExportModal]);

  // Helper formatting for date
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return selectedDate;
  }, [selectedDate]);

  // Navigate date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange?.(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange?.(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange?.(new Date().toISOString().split('T')[0]);
  };

  // Copy phone helper
  const handleCopyPhone = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Build the list of absent and late students for selectedDate
  const allRecords = useMemo<AbsentLateRecord[]>(() => {
    const list: AbsentLateRecord[] = [];
    const classMap = new Map<string, string>();
    classes.forEach(c => classMap.set(c.id, c.name));

    students.forEach(s => {
      const record = s.attendanceRecords?.[selectedDate];
      if (record && (record.status === 'absent' || record.status === 'late' || record.status === 'leave_early')) {
        const isAbsent = record.status === 'absent';
        const reasonLower = (record.reason || '').toLowerCase().trim();

        let absentType: 'excused' | 'unexcused' | undefined = undefined;
        let statusLabel = 'Đi trễ';

        if (isAbsent) {
          if (
            reasonLower.includes('không phép') || 
            reasonLower === 'kp' || 
            reasonLower === 'k' || 
            reasonLower.startsWith('kp ') ||
            reasonLower.includes('(không phép)')
          ) {
            absentType = 'unexcused';
            statusLabel = 'Vắng không phép';
          } else if (
            reasonLower.includes('có phép') || 
            reasonLower.includes('phép') || 
            reasonLower === 'p' || 
            reasonLower.startsWith('p ') ||
            reasonLower.includes('ốm') || 
            reasonLower.includes('bệnh') || 
            reasonLower.includes('xin')
          ) {
            absentType = 'excused';
            statusLabel = 'Vắng có phép';
          } else {
            // Nếu vắng mà có ghi lý do rõ ràng thì coi là có phép, nếu để trống thì là không phép
            if (reasonLower.length > 0) {
              absentType = 'excused';
              statusLabel = 'Vắng có phép';
            } else {
              absentType = 'unexcused';
              statusLabel = 'Vắng không phép';
            }
          }
        } else if (record.status === 'leave_early') {
          statusLabel = 'Về sớm';
        }

        list.push({
          student: s,
          className: classMap.get(s.classId) || 'Chưa rõ',
          status: record.status,
          absentType,
          statusLabel,
          reason: record.reason || '',
          time: record.time || '',
          parentPhone: s.parentPhone || s.phone || '',
          parentName: s.parentName || 'Phụ huynh'
        });
      }
    });

    // Sort by class name then student stt or full name
    list.sort((a, b) => {
      const clsCompare = a.className.localeCompare(b.className, 'vi', { numeric: true });
      if (clsCompare !== 0) return clsCompare;
      return (a.student.stt || 0) - (b.student.stt || 0);
    });

    return list;
  }, [students, classes, selectedDate]);

  // Counts by category
  const stats = useMemo(() => {
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    allRecords.forEach(r => {
      if (r.status === 'absent') {
        if (r.absentType === 'excused') excused++;
        else unexcused++;
      } else if (r.status === 'late' || r.status === 'leave_early') {
        late++;
      }
    });

    return {
      total: allRecords.length,
      absentTotal: excused + unexcused,
      excused,
      unexcused,
      late
    };
  }, [allRecords]);

  // Filtered records based on active tabs & search
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      // Status filter
      if (statusFilter === 'excused' && (r.status !== 'absent' || r.absentType !== 'excused')) return false;
      if (statusFilter === 'unexcused' && (r.status !== 'absent' || r.absentType !== 'unexcused')) return false;
      if (statusFilter === 'late' && r.status !== 'late' && r.status !== 'leave_early') return false;

      // Class filter
      if (classFilter !== 'all' && r.student.classId !== classFilter) return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = r.student.fullName.toLowerCase().includes(term);
        const matchCode = (r.student.code || '').toLowerCase().includes(term);
        const matchPhone = r.parentPhone.includes(term);
        const matchReason = r.reason.toLowerCase().includes(term);
        const matchClass = r.className.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchPhone && !matchReason && !matchClass) return false;
      }

      return true;
    });
  }, [allRecords, statusFilter, classFilter, searchTerm]);

  // Quick preset helper for export modal
  const handleSetPreset = (preset: 'selected' | 'today' | 'last7' | 'week' | 'month') => {
    const today = new Date().toISOString().split('T')[0];
    if (preset === 'selected') {
      setExportStartDate(selectedDate);
      setExportEndDate(selectedDate);
    } else if (preset === 'today') {
      setExportStartDate(today);
      setExportEndDate(today);
    } else if (preset === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setExportStartDate(d.toISOString().split('T')[0]);
      setExportEndDate(today);
    } else if (preset === 'week') {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setExportStartDate(monday.toISOString().split('T')[0]);
      setExportEndDate(sunday.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${y}-${m}-01`;
      setExportStartDate(start);
      setExportEndDate(today);
    }
  };

  // Records matching the export modal range & filters
  const exportRangeRecords = useMemo(() => {
    if (!exportStartDate || !exportEndDate) return [];
    const start = exportStartDate <= exportEndDate ? exportStartDate : exportEndDate;
    const end = exportStartDate <= exportEndDate ? exportEndDate : exportStartDate;

    const list: Array<AbsentLateRecord & { date: string; dateDisplay: string }> = [];
    const classMap = new Map<string, string>();
    classes.forEach(c => classMap.set(c.id, c.name));

    students.forEach(s => {
      if (exportClassId !== 'all' && s.classId !== exportClassId) return;
      if (!s.attendanceRecords) return;

      Object.entries(s.attendanceRecords).forEach(([dateStr, record]) => {
        if (dateStr >= start && dateStr <= end) {
          if (record && (record.status === 'absent' || record.status === 'late' || record.status === 'leave_early')) {
            const isAbsent = record.status === 'absent';
            const isLate = record.status === 'late' || record.status === 'leave_early';

            if (exportScope === 'absent_only' && !isAbsent) return;
            if (exportScope === 'late_only' && !isLate) return;

            const reasonLower = (record.reason || '').toLowerCase().trim();
            let absentType: 'excused' | 'unexcused' | undefined = undefined;
            let statusLabel = record.status === 'leave_early' ? 'Về sớm' : 'Đi trễ';

            if (isAbsent) {
              if (
                reasonLower.includes('không phép') || 
                reasonLower === 'kp' || 
                reasonLower === 'k' || 
                reasonLower.startsWith('kp ') ||
                reasonLower.includes('(không phép)')
              ) {
                absentType = 'unexcused';
                statusLabel = 'Vắng không phép';
              } else if (
                reasonLower.includes('có phép') || 
                reasonLower.includes('phép') || 
                reasonLower === 'p' || 
                reasonLower.startsWith('p ') ||
                reasonLower.includes('ốm') || 
                reasonLower.includes('bệnh') || 
                reasonLower.includes('xin')
              ) {
                absentType = 'excused';
                statusLabel = 'Vắng có phép';
              } else {
                if (reasonLower.length > 0) {
                  absentType = 'excused';
                  statusLabel = 'Vắng có phép';
                } else {
                  absentType = 'unexcused';
                  statusLabel = 'Vắng không phép';
                }
              }
            }

            const parts = dateStr.split('-');
            const dateDisplay = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;

            list.push({
              student: s,
              className: classMap.get(s.classId) || 'Chưa rõ',
              status: record.status,
              absentType,
              statusLabel,
              reason: record.reason || '',
              time: record.time || '',
              parentPhone: s.parentPhone || s.phone || '',
              parentName: s.parentName || 'Phụ huynh',
              date: dateStr,
              dateDisplay
            });
          }
        }
      });
    });

    // Sắp xếp: ngày giảm dần, sau đó theo lớp, rồi STT
    list.sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      const classCmp = a.className.localeCompare(b.className, 'vi', { numeric: true });
      if (classCmp !== 0) return classCmp;
      return (a.student.stt || 0) - (b.student.stt || 0);
    });

    return list;
  }, [students, classes, exportStartDate, exportEndDate, exportClassId, exportScope]);

  const rangeStats = useMemo(() => {
    let absentCount = 0;
    let excusedCount = 0;
    let unexcusedCount = 0;
    let lateCount = 0;

    exportRangeRecords.forEach(r => {
      if (r.status === 'absent') {
        absentCount++;
        if (r.absentType === 'excused') excusedCount++;
        else unexcusedCount++;
      } else {
        lateCount++;
      }
    });

    return {
      total: exportRangeRecords.length,
      absentCount,
      excusedCount,
      unexcusedCount,
      lateCount
    };
  }, [exportRangeRecords]);

  // Mở modal xuất excel theo khoảng ngày
  const handleExportExcel = () => {
    setExportStartDate(selectedDate);
    setExportEndDate(selectedDate);
    setShowExportModal(true);
  };

  // Execute export based on date range
  const handleExecuteRangeExport = () => {
    if (exportRangeRecords.length === 0) {
      return;
    }

    const start = exportStartDate <= exportEndDate ? exportStartDate : exportEndDate;
    const end = exportStartDate <= exportEndDate ? exportEndDate : exportStartDate;
    const startVN = start.split('-').reverse().join('/');
    const endVN = end.split('-').reverse().join('/');

    const selectedClassName = exportClassId === 'all' 
      ? 'Toàn trường' 
      : (classes.find(c => c.id === exportClassId)?.name || 'Lớp');

    const headers = [
      'STT',
      'Ngày',
      'Lớp',
      'Mã Định Danh',
      'Họ và Tên Học Sinh',
      'Trạng Thái',
      'Phân Loại',
      'Lý Do / Ghi Chú',
      'Họ Tên Phụ Huynh',
      'Số Điện Thoại Phụ Huynh',
      'Giờ Ghi Nhận'
    ];

    const data = exportRangeRecords.map((r, index) => [
      index + 1,
      r.dateDisplay,
      r.className,
      r.student.code || `HS-${(r.student.stt || index + 1).toString().padStart(3, '0')}`,
      r.student.fullName,
      r.status === 'absent' ? 'Vắng mặt' : (r.status === 'late' ? 'Đi trễ' : 'Về sớm'),
      r.statusLabel,
      r.reason || 'Không có ghi chú',
      r.parentName,
      r.parentPhone || 'Chưa cập nhật',
      r.time || 'Trong ngày'
    ]);

    const titleText = startVN === endVN
      ? `DANH SÁCH CHI TIẾT HỌC SINH VẮNG & ĐI TRỄ NGÀY ${startVN}`
      : `BÁO CÁO THỐNG KÊ CHI TIẾT HỌC SINH VẮNG & ĐI TRỄ (TỪ ${startVN} ĐẾN ${endVN})`;

    const ws = XLSX.utils.aoa_to_sheet([
      [titleText],
      [`Phạm vi: ${selectedClassName} | Tổng số trường hợp: ${exportRangeRecords.length} (Vắng có phép: ${rangeStats.excusedCount}, Vắng không phép: ${rangeStats.unexcusedCount}, Đi trễ/Về sớm: ${rangeStats.lateCount})`],
      [`Thời gian xuất file: ${new Date().toLocaleString('vi-VN')}`],
      [],
      headers,
      ...data
    ]);

    // Column widths
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 12 },
      { wch: 16 },
      { wch: 25 },
      { wch: 14 },
      { wch: 18 },
      { wch: 32 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vang_Tre');
    const safeStart = start.replace(/-/g, '_');
    const safeEnd = end.replace(/-/g, '_');
    XLSX.writeFile(wb, `Thong_Ke_Vang_Tre_${safeStart}_den_${safeEnd}.xlsx`);
    setShowExportModal(false);
  };

  return (
    <div className="bg-white rounded-[20px] border border-teal-100 shadow-sm shadow-teal-500/5 overflow-hidden flex flex-col">
      {/* Header section with Date Navigation & Quick Actions */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 flex-wrap">
                <span>{title || `DANH SÁCH CHI TIẾT HỌC SINH VẮNG, ĐI TRỄ NGÀY ${formattedDisplayDate}`}</span>
                {stats.total > 0 ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    {stats.total} trường hợp
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Đầy đủ 100%
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {description || "Chi tiết lý do vắng (có phép/không phép), giờ đi trễ và số điện thoại liên hệ phụ huynh"}
              </p>
            </div>
          </div>
        </div>

        {/* Date picker controls & Export Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onDateChange && (
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button 
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                title="Ngày hôm trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1.5 px-2">
                <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange?.(e.target.value)}
                  className="text-xs font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
                />
              </div>

              <button 
                onClick={handleNextDay}
                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                title="Ngày tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="ml-1 text-[11px] font-semibold px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md border border-teal-200 transition-colors"
              >
                Hôm nay
              </button>
            </div>
          )}

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Xuất Excel danh sách này"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Compact status filter menu (Tổng cộng, Có phép, Không phép, Đi trễ / Về sớm) */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline-flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Lọc:
        </span>

        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tổng cộng</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('excused')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'excused'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Có phép</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
            statusFilter === 'excused' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {stats.excused}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('unexcused')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'unexcused'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Không phép</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
            statusFilter === 'unexcused' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {stats.unexcused}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('late')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'late'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Đi trễ / Về sớm</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
            statusFilter === 'late' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {stats.late}
          </span>
        </button>
      </div>

      {/* Filter Toolbar (Lọc theo lớp & Tìm kiếm) */}
      <div className="p-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, mã định danh, SĐT, lý do..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {classes && classes.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Lớp:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.filter(c => !c.isDeleted).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <span className="text-xs text-slate-500">
            Hiển thị: <b>{filteredRecords.length}</b> / {allRecords.length}
          </span>
        </div>
      </div>

      {/* Detail Table */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider select-none sticky top-0 z-10 shadow-xs">
            <tr>
              <th className="px-2 py-2.5 w-10 text-center text-white whitespace-nowrap">STT</th>
              <th className="px-2 py-2.5 text-center text-white whitespace-nowrap w-16">LỚP</th>
              <th className="px-2.5 py-2.5 text-center text-white whitespace-nowrap w-24">MÃ ĐỊNH DANH</th>
              <th className="px-3 py-2.5 text-white whitespace-nowrap">HỌ VÀ TÊN HỌC SINH</th>
              <th className="px-2.5 py-2.5 text-center text-white whitespace-nowrap w-32">TRẠNG THÁI</th>
              <th className="px-3 py-2.5 text-white">LÝ DO / GHI CHÚ</th>
              <th className="px-2 py-2.5 text-center text-white whitespace-nowrap w-[130px]">SĐT PHỤ HUYNH</th>
              <th className="px-2 py-2.5 text-center text-white whitespace-nowrap w-[95px]">GIỜ GHI NHẬN</th>
              {onNavigateToAttendance && (
                <th className="px-2 py-2.5 text-center text-white whitespace-nowrap w-20">THAO TÁC</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((item, index) => {
                const s = item.student;
                const isExcused = item.absentType === 'excused';
                const isUnexcused = item.absentType === 'unexcused';
                const isLate = item.status === 'late' || item.status === 'leave_early';

                return (
                  <tr 
                    key={`${s.id}-${index}`} 
                    className="hover:bg-[#f0fdfa]/40 transition-colors group"
                  >
                    <td className="px-2 py-2.5 text-center text-slate-400 font-semibold text-xs whitespace-nowrap">
                      {index + 1}
                    </td>

                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <span className="font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg text-xs">
                        {item.className}
                      </span>
                    </td>

                    <td className="px-2.5 py-2.5 text-center text-xs font-mono font-semibold text-slate-500 whitespace-nowrap">
                      {s.code || `HS-${s.stt.toString().padStart(3, '0')}`}
                    </td>

                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center text-[11px] font-bold shrink-0 border border-teal-200">
                          {s.fullName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {s.fullName}
                        </span>
                      </div>
                    </td>

                    <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                      {isExcused && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Vắng có phép</span>
                        </span>
                      )}
                      {isUnexcused && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs animate-pulse">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Vắng không phép</span>
                        </span>
                      )}
                      {isLate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{item.status === 'leave_early' ? 'Về sớm' : 'Đi trễ'}</span>
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-xs max-w-[220px]">
                      {item.reason ? (
                        <span className="text-slate-800 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80 inline-block truncate max-w-full" title={item.reason}>
                          {item.reason}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          {isUnexcused ? 'Chưa rõ lý do (Chưa có phép)' : 'Không có ghi chú'}
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-2.5 text-center whitespace-nowrap w-[130px]">
                      {item.parentPhone ? (
                        <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-teal-50/90 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 transition-colors shadow-2xs">
                          <a 
                            href={`tel:${item.parentPhone}`}
                            className="inline-flex items-center gap-1 font-mono tracking-tight hover:underline text-[12px]"
                            title="Gọi điện cho phụ huynh"
                          >
                            <Phone className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>{item.parentPhone}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopyPhone(item.parentPhone)}
                            className="p-0.5 text-slate-400 hover:text-teal-700 rounded transition-colors cursor-pointer"
                            title="Sao chép SĐT"
                          >
                            {copiedPhone === item.parentPhone ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Chưa có SĐT
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-2.5 text-center whitespace-nowrap font-mono text-xs text-slate-600 w-[95px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100/90 border border-slate-200 text-slate-700 tracking-tight font-mono text-[11px]">
                        {item.time && item.time !== 'Hôm nay' ? item.time : '07:15:00'}
                      </span>
                    </td>

                    {onNavigateToAttendance && (
                      <td className="px-2 py-2.5 text-center whitespace-nowrap w-20">
                        <button
                          type="button"
                          onClick={() => onNavigateToAttendance(s.classId)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-teal-50 text-teal-700 hover:border-teal-400 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                          title="Mở sổ điểm danh lớp này"
                        >
                          <span>Điểm danh</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={onNavigateToAttendance ? 9 : 8} className="px-6 py-12 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">
                      {allRecords.length === 0 
                        ? `Không có học sinh nào vắng hoặc đi trễ ngày ${formattedDisplayDate}` 
                        : 'Không tìm thấy kết quả phù hợp'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {allRecords.length === 0 
                        ? 'Tuyệt vời! Tất cả học sinh đều có mặt đầy đủ, nề nếp chuyên cần đạt 100%.' 
                        : 'Thử điều chỉnh lại bộ lọc trạng thái, lớp học hoặc từ khóa tìm kiếm.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xuất Excel theo tùy chọn khoảng ngày bắt đầu và kết thúc */}
      {showExportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Xuất Báo Cáo Thống Kê Học Sinh Vắng & Đi Trễ
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Tùy chọn ngày bắt đầu & kết thúc để trích xuất file Excel chính xác
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-slate-700">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Khoảng thời gian mẫu (Chọn nhanh)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetPreset('today')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('week')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Tuần này
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('last7')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    7 ngày gần nhất
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('month')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Tháng này
                  </button>
                </div>
              </div>

              {/* Date pickers (Start & End) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ngày bắt đầu:</span>
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ngày kết thúc:</span>
                  </label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
                  />
                </div>
              </div>

              {/* Scope & Class Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phạm vi lớp học:
                  </label>
                  <select
                    value={exportClassId}
                    onChange={(e) => setExportClassId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">Toàn trường (Tất cả các lớp)</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loại học sinh cần xuất:
                  </label>
                  <select
                    value={exportScope}
                    onChange={(e) => setExportScope(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">Tất cả (Vắng mặt & Đi trễ / Về sớm)</option>
                    <option value="absent_only">Chỉ danh sách vắng học (Có phép & Không phép)</option>
                    <option value="late_only">Chỉ học sinh đi trễ / về sớm</option>
                  </select>
                </div>
              </div>

              {/* Stats Summary Preview */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-[#f0fdfa] flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Thống kê trong khoảng ngày:
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                    {exportRangeRecords.length} trường hợp
                  </span>
                </div>
                
                {exportRangeRecords.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-teal-200/60 text-xs">
                    <span className="text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                      Vắng có phép: {rangeStats.excusedCount}
                    </span>
                    <span className="text-rose-800 font-bold bg-white px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs">
                      Vắng không phép: {rangeStats.unexcusedCount}
                    </span>
                    <span className="text-amber-800 font-bold bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs">
                      Đi trễ / Về sớm: {rangeStats.lateCount}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 italic font-medium pt-1">
                    Không có học sinh nào vắng hoặc đi trễ trong khoảng thời gian đã chọn.
                  </p>
                )}
              </div>

              {/* Quick Preview table (if items exist) */}
              {exportRangeRecords.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs">
                  <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex justify-between items-center">
                    <span>Xem trước dữ liệu (5 dòng đầu)</span>
                    <span className="text-[11px] font-normal text-slate-500">File Excel gồm đầy đủ {exportRangeRecords.length} dòng</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                    {exportRangeRecords.slice(0, 5).map((r, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-50/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-slate-400 font-mono text-[11px] shrink-0">{r.dateDisplay}</span>
                          <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded text-[11px] shrink-0">{r.className}</span>
                          <span className="font-semibold text-slate-800 truncate">{r.student.fullName}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          r.status === 'absent' 
                            ? (r.absentType === 'excused' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                  {exportRangeRecords.length > 5 && (
                    <div className="bg-slate-50/80 px-3 py-1.5 text-center text-[11px] text-slate-500 font-medium italic border-t border-slate-100">
                      + và {exportRangeRecords.length - 5} trường hợp khác trong file tải về
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleExecuteRangeExport}
                disabled={exportRangeRecords.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải file Excel ({exportRangeRecords.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
