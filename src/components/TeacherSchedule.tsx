import React, { useState, useEffect, useRef } from 'react';
import { SchoolClass, ClassSchedule, SchedulePeriod } from '../data';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useAlert } from '../contexts/AlertContext';
import { 
  Upload, Calendar, Monitor, Smartphone, Download, 
  Edit3, Check, X, Sparkles, Coffee, Sun, Sunset, Trash2,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  STANDARD_SCHEDULE_PERIODS, 
  normalizePeriodTime, 
  generateScheduleCsvTemplate, 
  createBlankStandardSchedule 
} from '../lib/scheduleConstants';

interface TeacherScheduleProps {
  classId: string;
  role?: string;
  classes?: SchoolClass[];
  onClassChange?: (classId: string) => void;
  className?: string;
}

export default function TeacherSchedule({ 
  classId, 
  role, 
  classes = [], 
  onClassChange,
  className 
}: TeacherScheduleProps) {
  const { showAlert } = useAlert();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [editPeriods, setEditPeriods] = useState<SchedulePeriod[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentClassName = className || classes.find(c => c.id === classId)?.name || 'lớp học';

  useEffect(() => {
    if (!classId) { 
      setIsLoading(false); 
      setSchedule(null);
      return; 
    }
    
    setIsLoading(true);
    setIsEditing(false);
    const docRef = doc(db, 'schedules', classId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ClassSchedule;
        setSchedule(data);
        setEditPeriods(data.periods || []);
      } else {
        setSchedule(null);
        setEditPeriods([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      showAlert('Lỗi khi tải thời khoá biểu', 'error');
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId]);

  const handleDownloadTemplate = () => {
    const csvContent = generateScheduleCsvTemplate(currentClassName);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `TKB_${currentClassName.replace(/\s+/g, '_')}_Chuan.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleInitializeDefault = async () => {
    if (!classId) return;
    try {
      setIsSaving(true);
      const blankPeriods = createBlankStandardSchedule();
      const newSchedule: ClassSchedule = {
        classId,
        periods: blankPeriods,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'schedules', classId), newSchedule);
      setEditPeriods(blankPeriods);
      setIsEditing(true);
      showAlert('Đã khởi tạo khung giờ thời khóa biểu chuẩn! Bạn có thể chỉnh sửa trực tiếp.', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Lỗi khi khởi tạo thời khóa biểu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = () => {
    if (!schedule || !schedule.periods || schedule.periods.length === 0) {
      setEditPeriods(createBlankStandardSchedule());
    } else {
      // Ensure time labels adhere to the standard timeframe
      const normalized = schedule.periods.map((p, idx) => {
        const norm = normalizePeriodTime(p.time, idx, schedule.periods.length);
        return {
          ...p,
          time: norm.fullTimeLabel || p.time,
        };
      });
      setEditPeriods(normalized);
    }
    setIsEditing(true);
  };

  const handleCellChange = (periodIndex: number, dayKey: 't2' | 't3' | 't4' | 't5' | 't6' | 't7', value: string) => {
    setEditPeriods(prev => {
      const updated = [...prev];
      if (updated[periodIndex]) {
        updated[periodIndex] = {
          ...updated[periodIndex],
          [dayKey]: value
        };
      }
      return updated;
    });
  };

  const handleSaveEdit = async () => {
    if (!classId) return;
    try {
      setIsSaving(true);
      const newSchedule: ClassSchedule = {
        classId,
        periods: editPeriods,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'schedules', classId), newSchedule);
      showAlert('Lưu thời khoá biểu thành công', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showAlert('Lỗi khi lưu thời khoá biểu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!classId) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thời khoá biểu lớp ${currentClassName}?`)) {
      return;
    }
    try {
      setIsSaving(true);
      await deleteDoc(doc(db, 'schedules', classId));
      showAlert('Đã xóa thời khoá biểu', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showAlert('Lỗi khi xóa thời khoá biểu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !classId) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
        
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(10, data.length); i++) {
          if (data[i] && data[i].length > 0 && String(data[i][0]).toLowerCase().includes('tiết')) {
            headerRowIdx = i;
            break;
          }
        }
        
        if (headerRowIdx === -1) {
          showAlert('Không tìm thấy dòng tiêu đề "Tiết / Thứ". Vui lòng kiểm tra lại file.', 'error');
          return;
        }
        
        const periods: SchedulePeriod[] = [];
        
        for (let i = headerRowIdx + 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;
          
          const rawTime = String(row[0] || '').trim();
          const norm = normalizePeriodTime(rawTime, periods.length);

          periods.push({
            time: norm.fullTimeLabel || rawTime,
            t2: String(row[1] || '').trim(),
            t3: String(row[2] || '').trim(),
            t4: String(row[3] || '').trim(),
            t5: String(row[4] || '').trim(),
            t6: String(row[5] || '').trim(),
            t7: String(row[6] || '').trim()
          });
        }
        
        if (periods.length === 0) {
          showAlert('File không chứa dữ liệu tiết học hợp lệ.', 'error');
          return;
        }

        const newSchedule: ClassSchedule = {
          classId,
          periods,
          updatedAt: Date.now()
        };
        
        await setDoc(doc(db, 'schedules', classId), newSchedule);
        showAlert('Cập nhật thời khoá biểu thành công', 'success');
        if (fileInputRef.current) fileInputRef.current.value = '';
        
      } catch (error) {
        console.error(error);
        showAlert('Lỗi khi đọc file. Vui lòng thử lại.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Active periods list to display
  const displayPeriods = isEditing ? editPeriods : (schedule?.periods || []);

  // Split periods into Morning and Afternoon with standard timeframes
  const morningList: { period: SchedulePeriod; originalIdx: number; norm: ReturnType<typeof normalizePeriodTime> }[] = [];
  const afternoonList: { period: SchedulePeriod; originalIdx: number; norm: ReturnType<typeof normalizePeriodTime> }[] = [];

  displayPeriods.forEach((p, idx) => {
    const norm = normalizePeriodTime(p.time, idx, displayPeriods.length);
    if (norm.session === 'morning') {
      morningList.push({ period: p, originalIdx: idx, norm });
    } else {
      afternoonList.push({ period: p, originalIdx: idx, norm });
    }
  });

  return (
    <div className="p-3 sm:p-6 md:p-8 h-full bg-[#f0fdfa]/30 flex flex-col overflow-y-auto">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#0f766e]" />
              <span>Thời khoá biểu</span>
            </h2>
            <span className="bg-[#ccfbf1] text-[#0f766e] text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-lg border border-[#5eead4]">
              Lớp {currentClassName}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
            Khung giờ chuẩn: Sáng (7:30 - 11:00) • Chiều (13:15 - 16:40) • Ra chơi 20 phút
          </p>
        </div>

        {/* Action Controls matching Class List style */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {/* Admin Class Selector if multiple classes */}
          {role === 'admin' && classes.length > 1 && onClassChange && (
            <div className="relative">
              <select
                value={classId}
                onChange={e => onClassChange(e.target.value)}
                className="bg-white border border-teal-200 text-teal-900 text-xs sm:text-sm rounded-xl px-3 py-2 font-bold shadow-2xs pr-8 cursor-pointer hover:border-teal-300 focus:ring-2 focus:ring-teal-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Lớp {c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-teal-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* PC / Mobile View Toggle */}
          <div className="hidden sm:inline-flex bg-white rounded-xl p-1 border border-teal-100 shadow-2xs">
            <button 
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${viewMode === 'desktop' ? 'bg-[#0f766e] text-white shadow-xs' : 'text-slate-600 hover:text-teal-800'}`}
            >
              <Monitor className="w-3.5 h-3.5" /> PC
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${viewMode === 'mobile' ? 'bg-[#0f766e] text-white shadow-xs' : 'text-slate-600 hover:text-teal-800'}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />

          {isEditing ? (
            <>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3.5 py-2 bg-teal-gradient text-white font-bold rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu thời khoá biểu'}</span>
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditPeriods(schedule?.periods || []);
                }}
                disabled={isSaving}
                className="px-3 py-2 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-2xs"
              >
                <X className="w-4 h-4 text-slate-400" />
                <span>Hủy</span>
              </button>
            </>
          ) : (
            <>
              {schedule && schedule.periods.length > 0 && (
                <>
                  <button 
                    onClick={handleStartEditing}
                    className="px-3 py-2 bg-white text-[#0f766e] font-bold rounded-xl border border-[#5eead4] hover:bg-[#f0fdfa] transition-all flex items-center justify-center gap-1.5 shadow-2xs text-xs sm:text-sm whitespace-nowrap"
                    title="Chỉnh sửa trực tiếp trên bảng"
                  >
                    <Edit3 className="w-4 h-4 text-[#0f766e]" />
                    <span>Sửa trực tiếp</span>
                  </button>
                  <button 
                    onClick={handleDeleteSchedule}
                    className="p-2 bg-white text-rose-600 font-semibold rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center shadow-2xs text-xs sm:text-sm"
                    title="Xóa thời khóa biểu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button 
                onClick={handleDownloadTemplate}
                className="px-3 sm:px-3.5 py-2 bg-white text-slate-700 font-semibold rounded-xl border border-teal-200/80 hover:bg-[#f0fdfa] hover:text-teal-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs text-xs sm:text-sm whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-teal-600" />
                <span>Tải mẫu (CSV)</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 sm:px-3.5 py-2 bg-teal-gradient text-white font-bold rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-xs text-xs sm:text-sm whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>Tải lên TKB</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!displayPeriods || displayPeriods.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-teal-100 shadow-sm flex flex-col items-center justify-center p-8 text-center min-h-[380px]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ccfbf1] rounded-full flex items-center justify-center mb-4 border border-[#5eead4]">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-[#0f766e]" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-800 mb-2">Chưa có thời khoá biểu cho lớp {currentClassName}</h3>
          <p className="text-slate-500 mb-6 max-w-md text-xs sm:text-sm">
            Bạn có thể khởi tạo nhanh khung giờ chuẩn (Sáng: 7:30 - 11:00; Chiều: 13:15 - 16:40) để nhập trực tiếp, hoặc tải file CSV/Excel lên.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button 
              onClick={handleInitializeDefault}
              disabled={isSaving}
              className="px-5 py-2.5 bg-teal-gradient text-white font-bold rounded-xl hover:opacity-95 transition-all flex items-center gap-2 shadow-sm text-sm"
            >
              <Sparkles className="w-4 h-4" /> Khởi tạo khung giờ chuẩn
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-teal-200 hover:bg-[#f0fdfa] hover:text-teal-800 transition-colors flex items-center gap-2 shadow-2xs text-sm"
            >
              <Upload className="w-4 h-4 text-teal-600" /> Tải lên từ máy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-teal-100 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Edit Mode Banner if editing */}
          {isEditing && (
            <div className="bg-[#ccfbf1]/80 border-b border-[#5eead4] px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-[#0f766e] flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Đang ở chế độ chỉnh sửa trực tiếp — Nhập tên môn học vào từng ô và bấm "Lưu thời khoá biểu"
              </span>
              <span className="text-teal-700 font-medium hidden md:inline">
                Khung giờ chuẩn: 8 tiết học + 2 đợt ra chơi (20 phút/đợt)
              </span>
            </div>
          )}

          {/* Desktop Table View */}
          <div className={`flex-1 overflow-auto ${viewMode === 'desktop' ? 'block hidden sm:block' : 'hidden'}`}>
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#0f766e] text-white font-semibold sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold w-48 sm:w-56 whitespace-nowrap border-r border-teal-600/40 text-center">
                    TIẾT / THỜI GIAN
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold text-center border-r border-teal-600/40 min-w-[130px]">
                    THỨ 2
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold text-center border-r border-teal-600/40 min-w-[130px]">
                    THỨ 3
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold text-center border-r border-teal-600/40 min-w-[130px]">
                    THỨ 4
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold text-center border-r border-teal-600/40 min-w-[130px]">
                    THỨ 5
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold text-center border-r border-teal-600/40 min-w-[130px]">
                    THỨ 6
                  </th>
                  <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-white font-semibold text-center min-w-[130px]">
                    THỨ 7
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* 1. BUỔI SÁNG SECTION HEADER */}
                <tr className="bg-gradient-to-r from-teal-50 via-emerald-50/60 to-teal-50/30 border-y border-teal-200">
                  <td colSpan={7} className="px-4 py-2 sm:py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                          <Sun className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-teal-900 text-xs sm:text-sm tracking-wide uppercase">
                          BUỔI SÁNG
                        </span>
                        <span className="text-teal-700 text-xs font-semibold">
                          (7:30 - 11:00)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                        4 Tiết học • Ra chơi 9:05 - 9:25
                      </span>
                    </div>
                  </td>
                </tr>

                {/* SÁNG PERIODS */}
                {morningList.map(({ period, originalIdx, norm }) => {
                  if (norm.isBreak) {
                    return (
                      <tr key={`morning-break-${originalIdx}`} className="bg-amber-50/80 border-y border-amber-200/90 text-amber-900">
                        <td className="px-3 sm:px-4 py-2.5 font-bold text-xs text-amber-800 border-r border-amber-200/70 bg-amber-100/50">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="font-bold text-amber-900">{norm.name}</div>
                              <div className="font-mono text-[11px] text-amber-700 font-semibold">{norm.timeRange}</div>
                            </div>
                          </div>
                        </td>
                        <td colSpan={6} className="px-4 py-2 text-center text-xs font-semibold text-amber-800 italic">
                          ☕ Ra chơi & Thư giãn giữa các tiết học sáng (20 phút)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`period-${originalIdx}`} className="hover:bg-teal-50/40 transition-colors border-b border-teal-100/60">
                      {/* Period Time Column */}
                      <td className="px-3 sm:px-4 py-3 border-r border-teal-100 bg-teal-50/20">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">{norm.name}</span>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-teal-200 text-teal-900 text-[11px] font-mono font-bold rounded-md shadow-2xs w-fit">
                            {norm.timeRange}
                          </span>
                        </div>
                      </td>

                      {/* Day Columns */}
                      {(['t2', 't3', 't4', 't5', 't6', 't7'] as const).map(dayKey => {
                        const cellVal = period[dayKey] || '';
                        return (
                          <td key={dayKey} className="px-2 sm:px-2.5 py-2.5 border-r border-teal-100/70 last:border-0 text-center align-middle">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={cellVal}
                                onChange={e => handleCellChange(originalIdx, dayKey, e.target.value)}
                                placeholder="Nhập môn..."
                                className="w-full h-[38px] bg-white border border-teal-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-center shadow-2xs"
                              />
                            ) : (
                              <div className={`w-full h-[38px] px-2 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center ${
                                cellVal.trim()
                                  ? 'bg-teal-50/90 border-teal-200/80 text-teal-950 shadow-2xs hover:bg-[#ccfbf1]'
                                  : 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                              }`}>
                                <span className="truncate">{cellVal.trim() || '-'}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* 2. NGHỈ TRƯA (LUNCH / SESSION BREAK) */}
                <tr className="bg-[#0f766e] text-white shadow-xs border-y-2 border-teal-800 select-none">
                  <td colSpan={7} className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse shrink-0"></span>
                      <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                        NGHỈ TRƯA 11:00 - 13:15
                      </span>
                    </div>
                  </td>
                </tr>

                {/* 3. BUỔI CHIỀU SECTION HEADER */}
                <tr className="bg-gradient-to-r from-teal-50 via-cyan-50/60 to-teal-50/30 border-y border-teal-200">
                  <td colSpan={7} className="px-4 py-2 sm:py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <Sunset className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-teal-900 text-xs sm:text-sm tracking-wide uppercase">
                          BUỔI CHIỀU
                        </span>
                        <span className="text-teal-700 text-xs font-semibold">
                          (13:15 - 16:40)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                        4 Tiết học • Ra chơi 14:48 - 15:08
                      </span>
                    </div>
                  </td>
                </tr>

                {/* CHIỀU PERIODS */}
                {afternoonList.map(({ period, originalIdx, norm }) => {
                  if (norm.isBreak) {
                    return (
                      <tr key={`afternoon-break-${originalIdx}`} className="bg-amber-50/80 border-y border-amber-200/90 text-amber-900">
                        <td className="px-3 sm:px-4 py-2.5 font-bold text-xs text-amber-800 border-r border-amber-200/70 bg-amber-100/50">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="font-bold text-amber-900">{norm.name}</div>
                              <div className="font-mono text-[11px] text-amber-700 font-semibold">{norm.timeRange}</div>
                            </div>
                          </div>
                        </td>
                        <td colSpan={6} className="px-4 py-2 text-center text-xs font-semibold text-amber-800 italic">
                          ☕ Ra chơi & Thư giãn giữa các tiết học chiều (20 phút)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`period-${originalIdx}`} className="hover:bg-teal-50/40 transition-colors border-b border-teal-100/60">
                      {/* Period Time Column */}
                      <td className="px-3 sm:px-4 py-3 border-r border-teal-100 bg-teal-50/20">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">{norm.name}</span>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-teal-200 text-teal-900 text-[11px] font-mono font-bold rounded-md shadow-2xs w-fit">
                            {norm.timeRange}
                          </span>
                        </div>
                      </td>

                      {/* Day Columns */}
                      {(['t2', 't3', 't4', 't5', 't6', 't7'] as const).map(dayKey => {
                        const cellVal = period[dayKey] || '';
                        return (
                          <td key={dayKey} className="px-2 sm:px-2.5 py-2.5 border-r border-teal-100/70 last:border-0 text-center align-middle">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={cellVal}
                                onChange={e => handleCellChange(originalIdx, dayKey, e.target.value)}
                                placeholder="Nhập môn..."
                                className="w-full h-[38px] bg-white border border-teal-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-center shadow-2xs"
                              />
                            ) : (
                              <div className={`w-full h-[38px] px-2 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-colors flex items-center justify-center ${
                                cellVal.trim()
                                  ? 'bg-teal-50/90 border-teal-200/80 text-teal-950 shadow-2xs hover:bg-[#ccfbf1]'
                                  : 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                              }`}>
                                <span className="truncate">{cellVal.trim() || '-'}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View (Card List grouped by Day with clear Morning & Afternoon & Break Times) */}
          <div className={`flex-1 overflow-auto bg-[#f0fdfa]/40 p-3 sm:p-4 ${viewMode === 'mobile' ? 'block' : 'block sm:hidden'}`}>
            <div className="space-y-4">
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((dayStr, dayIdx) => {
                const dayKey = `t${dayIdx + 2}` as 't2' | 't3' | 't4' | 't5' | 't6' | 't7';
                const hasClasses = displayPeriods.some(p => p[dayKey] && String(p[dayKey]).trim() !== '');
                if (!hasClasses && !isEditing) return null;

                const morningDay = morningList.filter(m => isEditing || (m.period[dayKey] && String(m.period[dayKey]).trim() !== '') || m.norm.isBreak);
                const afternoonDay = afternoonList.filter(a => isEditing || (a.period[dayKey] && String(a.period[dayKey]).trim() !== '') || a.norm.isBreak);

                return (
                  <div key={dayStr} className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-[#0f766e] px-4 py-3 text-white font-bold text-base flex items-center justify-between shadow-xs">
                      <span>{dayStr}</span>
                      <span className="text-teal-100 text-xs font-normal">Lớp {currentClassName}</span>
                    </div>

                    <div className="p-3 space-y-4">
                      {/* Sáng */}
                      {morningDay.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2 px-1">
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-teal-900 text-xs uppercase tracking-wider">
                              Buổi Sáng (7:30 - 11:00)
                            </span>
                          </div>
                          <div className="divide-y divide-teal-50 bg-slate-50/60 rounded-xl border border-teal-100/60 overflow-hidden">
                            {morningDay.map(({ period, originalIdx, norm }) => {
                              if (norm.isBreak) {
                                return (
                                  <div key={norm.id} className="p-2.5 bg-amber-50 text-amber-800 flex items-center gap-2 text-sm font-bold border-y border-amber-200">
                                    <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Ra chơi (Break Time): 9:05 - 9:25 (20 phút)</span>
                                  </div>
                                );
                              }
                              const cellVal = period[dayKey] || '';
                              return (
                                <div key={originalIdx} className="p-3 flex items-center justify-between gap-3">
                                  <div className="shrink-0">
                                    <div className="font-bold text-slate-800 text-[14px]">{norm.name}</div>
                                    <div className="text-[14px] font-mono font-bold text-teal-700">{norm.timeRange}</div>
                                  </div>
                                  <div className="flex-1 text-right flex justify-end">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={cellVal}
                                        onChange={e => handleCellChange(originalIdx, dayKey, e.target.value)}
                                        placeholder="Nhập môn..."
                                        className="w-40 sm:w-48 bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-[14px] font-bold text-teal-950 text-center h-[38px] focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs"
                                      />
                                    ) : (
                                      <div className={`w-40 sm:w-48 h-[38px] px-2.5 py-1.5 rounded-lg border text-[14px] font-bold flex items-center justify-center transition-colors ${
                                        cellVal.trim()
                                          ? 'bg-[#ccfbf1] border-[#5eead4] text-teal-950 shadow-2xs'
                                          : 'bg-slate-50 border-slate-200 text-slate-400'
                                      }`}>
                                        <span className="truncate">{cellVal.trim() || '-'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Ngăn cách sáng chiều trên mobile */}
                      <div className="bg-[#0f766e] text-white p-2.5 rounded-xl text-center text-[14px] font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-2xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse shrink-0"></span>
                        <span>NGHỈ TRƯA 11:00 - 13:15</span>
                      </div>

                      {/* Chiều */}
                      {afternoonDay.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2 px-1">
                            <Sunset className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-teal-900 text-xs uppercase tracking-wider">
                              Buổi Chiều (13:15 - 16:40)
                            </span>
                          </div>
                          <div className="divide-y divide-teal-50 bg-slate-50/60 rounded-xl border border-teal-100/60 overflow-hidden">
                            {afternoonDay.map(({ period, originalIdx, norm }) => {
                              if (norm.isBreak) {
                                return (
                                  <div key={norm.id} className="p-2.5 bg-amber-50 text-amber-800 flex items-center gap-2 text-sm font-bold border-y border-amber-200">
                                    <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Ra chơi (Break Time): 14:48 - 15:08 (20 phút)</span>
                                  </div>
                                );
                              }
                              const cellVal = period[dayKey] || '';
                              return (
                                <div key={originalIdx} className="p-3 flex items-center justify-between gap-3">
                                  <div className="shrink-0">
                                    <div className="font-bold text-slate-800 text-[14px]">{norm.name}</div>
                                    <div className="text-[14px] font-mono font-bold text-teal-700">{norm.timeRange}</div>
                                  </div>
                                  <div className="flex-1 text-right flex justify-end">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={cellVal}
                                        onChange={e => handleCellChange(originalIdx, dayKey, e.target.value)}
                                        placeholder="Nhập môn..."
                                        className="w-40 sm:w-48 bg-white border border-teal-300 rounded-lg px-2.5 py-1.5 text-[14px] font-bold text-teal-950 text-center h-[38px] focus:ring-2 focus:ring-teal-500 outline-none shadow-2xs"
                                      />
                                    ) : (
                                      <div className={`w-40 sm:w-48 h-[38px] px-2.5 py-1.5 rounded-lg border text-[14px] font-bold flex items-center justify-center transition-colors ${
                                        cellVal.trim()
                                          ? 'bg-[#ccfbf1] border-[#5eead4] text-teal-950 shadow-2xs'
                                          : 'bg-slate-50 border-slate-200 text-slate-400'
                                      }`}>
                                        <span className="truncate">{cellVal.trim() || '-'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
