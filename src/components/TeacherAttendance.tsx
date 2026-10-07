import React, { useState, useMemo, useEffect } from 'react';
import { Student, UserAccount, SchoolClass } from '../data';
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
  Download,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
  Edit2,
  X,
  Filter
} from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import { canUserEdit } from '../lib/permissions';

interface TeacherAttendanceProps {
  role?: string;
  user?: UserAccount;
  classes?: SchoolClass[];
  students: Student[];
  allStudents?: Student[];
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
  user,
  classes,
  students,
  allStudents,
  classId,
  className = '',
  onEditStudent
}: TeacherAttendanceProps) {
  const { showAlert } = useAlert();
  const currentClass = classes?.find(c => c.id === classId);
  const canEditAttendance = canUserEdit(user, role, 'attendance');
  const isHomeroom = 
    canEditAttendance && (
      role === 'admin' || 
      user?.homeroomClasses?.includes(classId) || 
      Boolean(currentClass && user?.fullName && currentClass.homeroomTeacher === user.fullName) ||
      user?.subjectClasses?.includes(classId)
    );

  const [attendanceDate, setAttendanceDate] = useState(() => getLocalDateISO());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'leave_early' | 'unmarked'>('all');
  const [editingReasonStudentId, setEditingReasonStudentId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState('');

  // Modal Xuất Excel theo Ngày / Tuần / Tháng
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(() => getLocalDateISO());
  const [exportEndDate, setExportEndDate] = useState(() => getLocalDateISO());
  const [exportClassId, setExportClassId] = useState<string>(classId);
  const [exportScope, setExportScope] = useState<'all' | 'absent_late' | 'absent_only' | 'late_only'>('all');

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

  // Kiểm tra ngày đang chọn có phải ngày cuối tuần (Thứ 7 hoặc Chủ Nhật) không
  const isWeekend = useMemo(() => {
    const parts = attendanceDate.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const dateObj = (!isNaN(y) && !isNaN(m) && !isNaN(d)) ? new Date(y, m - 1, d) : new Date(attendanceDate);
    return dateObj.getDay() === 0 || dateObj.getDay() === 6;
  }, [attendanceDate]);

  // Tự động xóa điểm danh nếu rơi vào ngày cuối tuần (Thứ 7 / Chủ Nhật)
  useEffect(() => {
    if (isWeekend && sortedStudents.length > 0) {
      sortedStudents.forEach(student => {
        if (student.attendanceRecords?.[attendanceDate]) {
          const newRecords = { ...student.attendanceRecords };
          delete newRecords[attendanceDate];
          onEditStudent({
            ...student,
            attendanceRecords: newRecords
          });
        }
      });
    }
  }, [isWeekend, attendanceDate, sortedStudents]);

  // Cập nhật trạng thái điểm danh
  const handleStatusChange = (student: Student, newStatus: 'present' | 'absent' | 'late' | 'leave_early') => {
    if (isWeekend) {
      showAlert('Không thể điểm danh vào ngày cuối tuần (Thứ 7 & Chủ nhật).', 'error');
      return;
    }

    // Chỉ vai trò Admin có quyền bấm nút "Có mặt"
    if (newStatus === 'present' && role !== 'admin') {
      showAlert('Chỉ tài khoản Admin mới có quyền bấm nút Có mặt.', 'error');
      return;
    }

    const currentRecords = student.attendanceRecords || {};
    const existingForDate = currentRecords[attendanceDate];
    
    // Bấm lần thứ 2 (khi đã có trạng thái này) -> Tắt điểm danh / Hủy đánh dấu
    if (existingForDate?.status === newStatus) {
      const newRecords = { ...currentRecords };
      delete newRecords[attendanceDate];
      const updatedStudent: Student = {
        ...student,
        attendanceRecords: newRecords
      };
      onEditStudent(updatedStudent);
      return;
    }

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

  // Thay đổi ngày (lùi / tiến) - Tự động bỏ qua Thứ 7 và Chủ nhật
  const changeDateByDays = (delta: number) => {
    const [y, m, d] = attendanceDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    // Tiến hoặc lùi 1 ngày
    date.setDate(date.getDate() + (delta >= 0 ? 1 : -1));

    // Nếu rơi vào Thứ 7 (getDay() === 6) hoặc Chủ nhật (getDay() === 0) -> Nhảy tiếp
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + (delta >= 0 ? 1 : -1));
    }

    setAttendanceDate(getLocalDateISO(date));
  };

  const handleSetToday = () => {
    const date = new Date();
    // Nếu hôm nay là Thứ 7 hoặc Chủ nhật, tự chuyển về Thứ 6 gần nhất
    if (date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    } else if (date.getDay() === 0) {
      date.setDate(date.getDate() - 2);
    }
    setAttendanceDate(getLocalDateISO(date));
  };

  const handleDateSelect = (selectedDateStr: string) => {
    if (!selectedDateStr) return;
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    if (date.getDay() === 6) { // Thứ 7
      date.setDate(date.getDate() - 1);
      showAlert('Điểm danh chỉ thực hiện từ Thứ 2 đến Thứ 6. Đã tự động chuyển về Thứ 6.', 'info');
    } else if (date.getDay() === 0) { // Chủ nhật
      date.setDate(date.getDate() - 2);
      showAlert('Điểm danh chỉ thực hiện từ Thứ 2 đến Thứ 6. Đã tự động chuyển về Thứ 6.', 'info');
    }

    setAttendanceDate(getLocalDateISO(date));
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

  // Quick preset helper for export modal
  const handleSetPreset = (preset: 'selected' | 'today' | 'last7' | 'week' | 'month') => {
    const today = getLocalDateISO();
    if (preset === 'selected') {
      setExportStartDate(attendanceDate);
      setExportEndDate(attendanceDate);
    } else if (preset === 'today') {
      setExportStartDate(today);
      setExportEndDate(today);
    } else if (preset === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setExportStartDate(getLocalDateISO(d));
      setExportEndDate(today);
    } else if (preset === 'week') {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setExportStartDate(getLocalDateISO(monday));
      setExportEndDate(getLocalDateISO(sunday));
    } else if (preset === 'month') {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${y}-${m}-01`;
      setExportStartDate(start);
      setExportEndDate(today);
    }
  };

  const handleOpenExportModal = () => {
    setExportStartDate(attendanceDate);
    setExportEndDate(attendanceDate);
    setExportClassId(classId);
    setShowExportModal(true);
  };

  const exportTargetStudents = useMemo(() => {
    const pool = (allStudents && allStudents.length > 0) ? allStudents : students;
    if (exportClassId === 'all') {
      return pool.filter(s => !s.isDeleted);
    }
    return pool.filter(s => !s.isDeleted && s.classId === exportClassId);
  }, [allStudents, students, exportClassId]);

  const exportRangeRecords = useMemo(() => {
    if (!exportStartDate || !exportEndDate) return [];
    const start = exportStartDate <= exportEndDate ? exportStartDate : exportEndDate;
    const end = exportStartDate <= exportEndDate ? exportEndDate : exportStartDate;

    const classMap = new Map<string, string>();
    (classes || []).forEach(c => classMap.set(c.id, c.name));

    const list: Array<{
      date: string;
      dateDisplay: string;
      student: Student;
      className: string;
      status: 'present' | 'absent' | 'late' | 'leave_early' | 'unmarked';
      statusText: string;
      absentType?: 'excused' | 'unexcused';
      statusLabel: string;
      reason: string;
      time?: string;
      parentName: string;
      parentPhone: string;
    }> = [];

    const parseAbsentType = (reason: string = '') => {
      const rLower = reason.toLowerCase().trim();
      if (
        rLower.includes('không phép') || 
        rLower === 'kp' || 
        rLower === 'k' || 
        rLower.startsWith('kp ') || 
        rLower.includes('(không phép)')
      ) {
        return { type: 'unexcused' as const, label: 'Vắng không phép' };
      }
      if (
        rLower.includes('có phép') || 
        rLower.includes('phép') || 
        rLower === 'p' || 
        rLower.startsWith('p ') || 
        rLower.includes('ốm') || 
        rLower.includes('bệnh') || 
        rLower.includes('xin') ||
        rLower.length > 0
      ) {
        return { type: 'excused' as const, label: 'Vắng có phép' };
      }
      return { type: 'unexcused' as const, label: 'Vắng không phép' };
    };

    exportTargetStudents.forEach(s => {
      const targetClassName = classMap.get(s.classId) || className || 'Lớp';
      const records = s.attendanceRecords || {};

      if (start === end) {
        const rec = records[start];
        const status = rec?.status || 'unmarked';
        const isAbsent = status === 'absent';
        const isLate = status === 'late' || status === 'leave_early';

        if (exportScope === 'absent_only' && !isAbsent) return;
        if (exportScope === 'late_only' && !isLate) return;
        if (exportScope === 'absent_late' && !isAbsent && !isLate) return;

        let statusText = 'Chưa điểm danh';
        let statusLabel = 'Chưa điểm danh';
        let absentType: 'excused' | 'unexcused' | undefined = undefined;

        if (status === 'present') {
          statusText = 'Có mặt';
          statusLabel = 'Có mặt';
        } else if (isAbsent) {
          statusText = 'Vắng mặt';
          const p = parseAbsentType(rec?.reason);
          absentType = p.type;
          statusLabel = p.label;
        } else if (status === 'late') {
          statusText = 'Đi trễ';
          statusLabel = 'Đi trễ';
        } else if (status === 'leave_early') {
          statusText = 'Về sớm';
          statusLabel = 'Về sớm';
        }

        const [y, m, d] = start.split('-');
        list.push({
          date: start,
          dateDisplay: `${d}/${m}/${y}`,
          student: s,
          className: targetClassName,
          status,
          statusText,
          absentType,
          statusLabel,
          reason: rec?.reason || '',
          time: rec?.time || '',
          parentName: s.parentName || 'Phụ huynh',
          parentPhone: s.parentPhone || s.phone || ''
        });
      } else {
        Object.entries(records).forEach(([dStr, rec]) => {
          if (dStr >= start && dStr <= end && rec) {
            const isAbsent = rec.status === 'absent';
            const isLate = rec.status === 'late' || rec.status === 'leave_early';

            if (exportScope === 'absent_only' && !isAbsent) return;
            if (exportScope === 'late_only' && !isLate) return;
            if (exportScope === 'absent_late' && !isAbsent && !isLate) return;

            let statusText = 'Có mặt';
            let statusLabel = 'Có mặt';
            let absentType: 'excused' | 'unexcused' | undefined = undefined;

            if (rec.status === 'present') {
              statusText = 'Có mặt';
              statusLabel = 'Có mặt';
            } else if (isAbsent) {
              statusText = 'Vắng mặt';
              const p = parseAbsentType(rec.reason);
              absentType = p.type;
              statusLabel = p.label;
            } else if (rec.status === 'late') {
              statusText = 'Đi trễ';
              statusLabel = 'Đi trễ';
            } else if (rec.status === 'leave_early') {
              statusText = 'Về sớm';
              statusLabel = 'Về sớm';
            }

            const [y, m, d] = dStr.split('-');
            list.push({
              date: dStr,
              dateDisplay: `${d}/${m}/${y}`,
              student: s,
              className: targetClassName,
              status: rec.status,
              statusText,
              absentType,
              statusLabel,
              reason: rec.reason || '',
              time: rec.time || '',
              parentName: s.parentName || 'Phụ huynh',
              parentPhone: s.parentPhone || s.phone || ''
            });
          }
        });
      }
    });

    list.sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      const classCmp = a.className.localeCompare(b.className, 'vi', { numeric: true });
      if (classCmp !== 0) return classCmp;
      return (a.student.stt || 0) - (b.student.stt || 0);
    });

    return list;
  }, [exportStartDate, exportEndDate, exportTargetStudents, exportClassId, exportScope, classes, className]);

  const exportStats = useMemo(() => {
    let presentCount = 0;
    let excusedCount = 0;
    let unexcusedCount = 0;
    let lateCount = 0;
    let unmarkedCount = 0;

    exportRangeRecords.forEach(r => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') {
        if (r.absentType === 'excused') excusedCount++;
        else unexcusedCount++;
      } else if (r.status === 'late' || r.status === 'leave_early') {
        lateCount++;
      } else {
        unmarkedCount++;
      }
    });

    return {
      total: exportRangeRecords.length,
      presentCount,
      excusedCount,
      unexcusedCount,
      lateCount,
      unmarkedCount
    };
  }, [exportRangeRecords]);

  // Xuất báo cáo điểm danh ra Excel theo khoảng ngày
  const handleExecuteRangeExport = async () => {
    if (exportRangeRecords.length === 0) {
      showAlert('Không có bản ghi điểm danh nào trong khoảng thời gian đã chọn để xuất file.', 'info');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const start = exportStartDate <= exportEndDate ? exportStartDate : exportEndDate;
      const end = exportStartDate <= exportEndDate ? exportEndDate : exportStartDate;
      const startVN = start.split('-').reverse().join('/');
      const endVN = end.split('-').reverse().join('/');

      const selectedClassName = exportClassId === 'all' 
        ? 'Toàn trường' 
        : (classes?.find(c => c.id === exportClassId)?.name || className || 'Lớp');

      const headers = [
        'STT',
        'Ngày',
        'Lớp',
        'Mã Học Sinh',
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
        r.statusText,
        r.statusLabel,
        r.reason || '',
        r.parentName,
        r.parentPhone || 'Chưa cập nhật',
        r.time || 'Trong ngày'
      ]);

      const titleText = startVN === endVN
        ? `BÁO CÁO ĐIỂM DANH & CHUYÊN CẦN NGÀY ${startVN} - ${selectedClassName.toUpperCase()}`
        : `BÁO CÁO ĐIỂM DANH & CHUYÊN CẦN (TỪ ${startVN} ĐẾN ${endVN}) - ${selectedClassName.toUpperCase()}`;

      const summaryLine = `Phạm vi: ${selectedClassName} | Tổng bản ghi: ${exportRangeRecords.length} (Có mặt: ${exportStats.presentCount}, Vắng có phép: ${exportStats.excusedCount}, Vắng không phép: ${exportStats.unexcusedCount}, Đi trễ/Về sớm: ${exportStats.lateCount})`;

      const ws = XLSX.utils.aoa_to_sheet([
        [titleText],
        [summaryLine],
        [`Thời gian xuất file: ${new Date().toLocaleString('vi-VN')}`],
        [],
        headers,
        ...data
      ]);

      ws['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 12 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 30 },
        { wch: 22 },
        { wch: 18 },
        { wch: 14 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Chi_Tiet_Diem_Danh');

      // Thêm Sheet 2: Bảng tổng hợp theo từng học sinh
      if (exportTargetStudents.length > 0) {
        const studentSummaryData = exportTargetStudents.map((s, idx) => {
          let sPresent = 0;
          let sExcused = 0;
          let sUnexcused = 0;
          let sLate = 0;

          if (s.attendanceRecords) {
            Object.entries(s.attendanceRecords).forEach(([dStr, rec]) => {
              if (dStr >= start && dStr <= end && rec) {
                if (rec.status === 'present') sPresent++;
                else if (rec.status === 'absent') {
                  const rLower = (rec.reason || '').toLowerCase().trim();
                  if (
                    rLower.includes('không phép') || 
                    rLower === 'kp' || 
                    rLower === 'k' || 
                    rLower.startsWith('kp ') || 
                    rLower.includes('(không phép)')
                  ) {
                    sUnexcused++;
                  } else {
                    sExcused++;
                  }
                } else if (rec.status === 'late' || rec.status === 'leave_early') {
                  sLate++;
                }
              }
            });
          }

          const totalDays = sPresent + sExcused + sUnexcused;
          const rate = totalDays > 0 ? Math.round((sPresent / totalDays) * 100) : 100;

          return [
            idx + 1,
            s.code || `HS-${(s.stt || idx + 1).toString().padStart(3, '0')}`,
            s.fullName,
            classes?.find(c => c.id === s.classId)?.name || className || 'Lớp',
            sPresent,
            sExcused,
            sUnexcused,
            sLate,
            `${rate}%`
          ];
        });

        const summaryHeaders = [
          'STT',
          'Mã Học Sinh',
          'Họ và Tên Học Sinh',
          'Lớp',
          'Số buổi có mặt',
          'Vắng có phép',
          'Vắng không phép',
          'Đi trễ / Về sớm',
          'Tỷ lệ chuyên cần (%)'
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet([
          [`BẢNG TỔNG HỢP CHUYÊN CẦN HỌC SINH (TỪ ${startVN} ĐẾN ${endVN})`],
          [`Lớp: ${selectedClassName} | Sĩ số: ${exportTargetStudents.length} học sinh`],
          [],
          summaryHeaders,
          ...studentSummaryData
        ]);

        wsSummary['!cols'] = [
          { wch: 6 },
          { wch: 15 },
          { wch: 25 },
          { wch: 12 },
          { wch: 16 },
          { wch: 16 },
          { wch: 16 },
          { wch: 16 },
          { wch: 20 }
        ];

        XLSX.utils.book_append_sheet(wb, wsSummary, 'Tong_Hop_Hoc_Sinh');
      }

      const safeStart = start.replace(/-/g, '_');
      const safeEnd = end.replace(/-/g, '_');
      const safeClassName = selectedClassName.replace(/[^a-zA-Z0-9]/g, '_');
      XLSX.writeFile(wb, `Diem_Danh_${safeClassName}_${safeStart}_den_${safeEnd}.xlsx`);

      showAlert('Xuất báo cáo điểm danh thành công!', 'success');
      setShowExportModal(false);
    } catch (err) {
      console.error(err);
      showAlert('Lỗi khi xuất file Excel điểm danh.', 'error');
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 sm:mb-4 gap-2.5 sm:gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h2 className="text-lg sm:text-2xl font-bold font-display text-slate-800 tracking-tight">
              Điểm danh {className ? `- Lớp ${className}` : ''}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
              {isToday ? 'Hôm nay' : `Ngày ${formattedDisplayDate}`}
            </span>
            {role !== 'admin' && role !== 'staff' && (
              isHomeroom ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  GVCN
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0" title="Giáo viên bộ môn có quyền điểm danh các lớp được phân công">
                  GV Bộ môn (Điểm danh)
                </span>
              )
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Quản lý chuyên cần • Chạm nhanh để điểm danh trực tiếp
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Quick Date Switcher */}
          <div className="flex items-center justify-between sm:justify-start bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors shrink-0"
              title="Ngày hôm trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center px-1.5 sm:px-2 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer max-w-[130px] sm:max-w-none"
              />
            </div>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors shrink-0"
              title="Ngày tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={handleSetToday}
                className="ml-1 px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg transition-colors shrink-0"
                title="Về ngày hôm nay"
              >
                Hôm nay
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mark All Present Button */}
            <button
              onClick={handleMarkAllPresent}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
              title="Đánh dấu tất cả học sinh có mặt hôm nay"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Tất cả có mặt</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleOpenExportModal}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
              title="Xuất báo cáo điểm danh ra Excel (Tùy chọn ngày, tuần, tháng)"
            >
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Xuất</span> Excel
            </button>
          </div>
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
                {isWeekend ? (
                  <div className="p-2 bg-slate-100/90 text-slate-500 rounded-xl text-xs font-semibold text-center border border-slate-200/80 mb-2">
                    Ngày cuối tuần (Thứ 7 & Chủ nhật) - Không điểm danh
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student, 'present')}
                      className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/60'
                      } ${role !== 'admin' ? 'opacity-80' : ''}`}
                      title={role !== 'admin' ? 'Chỉ Admin mới có quyền bấm Có mặt' : 'Bấm 2 lần để tắt điểm danh'}
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
                )}

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
                        {isWeekend ? (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 inline-block">
                            Cuối tuần (Thứ 7 & CN) - Không điểm danh
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {/* Có mặt */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student, 'present')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs font-bold scale-[1.02]'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              } ${role !== 'admin' ? 'opacity-80' : ''}`}
                              title={role !== 'admin' ? 'Chỉ Admin mới có quyền bấm Có mặt' : 'Bấm 2 lần để tắt điểm danh'}
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
                        )}
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

      {/* Modal Xuất Excel theo tùy chọn Ngày / Tuần / Tháng */}
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
                    Xuất Báo Cáo Điểm Danh Chuyên Cần
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Tùy chọn ngày, tuần hoặc tháng để trích xuất file Excel chi tiết
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-slate-700">
              {/* Presets: Ngày, Tuần, Tháng */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Khoảng thời gian mẫu (Chọn nhanh)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetPreset('selected')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
                  >
                    Ngày đang xem ({formattedDisplayDate})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPreset('today')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
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
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
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
                    {classes && classes.length > 1 && (
                      <option value="all">Toàn trường (Tất cả các lớp)</option>
                    )}
                    {classes && classes.length > 0 ? (
                      classes.map(c => (
                        <option key={c.id} value={c.id}>Lớp {c.name}</option>
                      ))
                    ) : (
                      <option value={classId}>{className ? `Lớp ${className}` : 'Lớp hiện tại'}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nội dung cần xuất:
                  </label>
                  <select
                    value={exportScope}
                    onChange={(e) => setExportScope(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">Tất cả (Có mặt, Vắng, Đi trễ, Về sớm)</option>
                    <option value="absent_late">Chỉ học sinh Vắng & Đi trễ / Về sớm</option>
                    <option value="absent_only">Chỉ danh sách Vắng học (Có phép & Không phép)</option>
                    <option value="late_only">Chỉ học sinh Đi trễ & Về sớm</option>
                  </select>
                </div>
              </div>

              {/* Stats Summary Preview */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-[#f0fdfa] flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    Thống kê trong khoảng thời gian:
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                    {exportRangeRecords.length} lượt ghi nhận
                  </span>
                </div>
                
                {exportRangeRecords.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-teal-200/60 text-xs">
                    <span className="text-slate-800 font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                      Có mặt: {exportStats.presentCount}
                    </span>
                    <span className="text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                      Vắng có phép: {exportStats.excusedCount}
                    </span>
                    <span className="text-rose-800 font-bold bg-white px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs">
                      Vắng không phép: {exportStats.unexcusedCount}
                    </span>
                    <span className="text-amber-800 font-bold bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs">
                      Đi trễ / Về sớm: {exportStats.lateCount}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 italic font-medium pt-1">
                    Không có dữ liệu điểm danh phù hợp trong khoảng thời gian đã chọn.
                  </p>
                )}
              </div>

              {/* Quick Preview table (if items exist) */}
              {exportRangeRecords.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs">
                  <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex justify-between items-center">
                    <span>Xem trước dữ liệu (5 dòng đầu)</span>
                    <span className="text-[11px] font-normal text-slate-500">File Excel gồm đầy đủ {exportRangeRecords.length} dòng + Bảng tổng hợp học sinh</span>
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
                          r.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'absent' 
                              ? (r.absentType === 'excused' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                  {exportRangeRecords.length > 5 && (
                    <div className="bg-slate-50/80 px-3 py-1.5 text-center text-[11px] text-slate-500 font-medium italic border-t border-slate-100">
                      + và {exportRangeRecords.length - 5} dòng khác trong file Excel tải về (kèm Sheet tổng hợp từng học sinh)
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
