import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Student, Grades, getSubjectName, computeMonthlyGamificationData } from '../data';
import GradeDetailModal from "./GradeDetailModal";
import { SubjectDetail } from "../data";
import { Download, FileSpreadsheet, Upload, Calendar, Clock, BookOpen, Medal, Calculator, AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useAlert } from "../contexts/AlertContext";

const EditableCell = ({ value, onSave }: { value: string | number, onSave: (val: string) => void }) => {
  const [editValue, setEditValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setEditValue(String(value));
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (editValue !== String(value)) {
       onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-full text-center bg-transparent border border-transparent focus:bg-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded py-1 font-medium transition-all ${isFocused ? 'text-indigo-700 shadow-sm' : 'text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
    />
  );
};

const GamificationCell = ({ 
  data, 
  onUpdate 
}: { 
  data: any, 
  onUpdate: (field: string, value: number) => void 
}) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-1">
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
        <button onClick={() => onUpdate('goldCards', (data?.goldCards || 0) + 1)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-yellow-100 transition-colors group">
          <Medal className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-bold text-slate-600 group-hover:text-yellow-700">{data?.goldCards || 0}</span>
        </button>
        <button onClick={() => onUpdate('silverCards', (data?.silverCards || 0) + 1)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 transition-colors group">
          <Medal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 group-hover:text-slate-700">{data?.silverCards || 0}</span>
        </button>
        <button onClick={() => onUpdate('bronzeCards', (data?.bronzeCards || 0) + 1)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-100 transition-colors group">
          <Medal className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-600 group-hover:text-amber-700">{data?.bronzeCards || 0}</span>
        </button>
      </div>
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
        {[1, 2, 3].map(level => (
          <button 
            key={level}
            onClick={() => onUpdate('penaltyLevel', data?.penaltyLevel === level ? 0 : level)}
            className={`p-1 rounded transition-colors ${
              data?.penaltyLevel === level 
                ? (level === 1 ? 'bg-yellow-100 text-yellow-600' : level === 2 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600')
                : 'text-slate-300 hover:bg-slate-200 hover:text-slate-500'
            }`}
            title={level === 1 ? 'Nhắc nhở' : level === 2 ? 'Cảnh cáo' : 'Vi phạm nặng'}
          >
            {level === 1 ? <AlertCircle className="w-4 h-4" /> : level === 2 ? <AlertTriangle className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const SUBJECT_KEYS: (keyof Grades)[] = [
  'math', 'physics', 'chemistry', 'biology', 'it', 'technology', 'localEdu', 
  'literature', 'history', 'geography', 'civicEdu', 'foreignLanguage', 'pe', 
  'defense', 'japanese', 'experiential'
];

type PeriodType = 'week' | 'month' | 'term1' | 'term2' | 'year';

export default function TeacherGrades({ 
  students,
  className,
  onUpdateGrade,
  onUpdateMultipleGrades
}: { 
  students: Student[],
  className?: string,
  onUpdateGrade: (studentId: string, field: string, value: string | number | any) => void,
  onUpdateMultipleGrades: (updates: { studentId: string, field: string, newValue: string | number | any | any }[]) => void
}) {
  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [periodType, setPeriodType] = useState<PeriodType>('term1');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [visibleSubjects, setVisibleSubjects] = useState<Set<keyof Grades>>(new Set(SUBJECT_KEYS));
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalData, setDetailModalData] = useState<{ student: Student, subject: keyof Grades } | null>(null);

  
  const [showExportMenu, setShowExportMenu] = useState(false);

const handleExportDetailedTemplate = async () => {
    try {
      const XLSX = (await import('xlsx'));
      const wb = XLSX.utils.book_new();
      const visibleKeys = SUBJECT_KEYS.filter(key => visibleSubjects.has(key));
      
      visibleKeys.forEach(key => {
        const name = getSubjectName(key);
        const headers = ['ID_HocSinh', 'Họ và Tên', `${name}_TX1`, `${name}_TX2`, `${name}_TX3`, `${name}_TX4`, `${name}_TX5`, `${name}_TX6`, `${name}_GK`, `${name}_CK`, `${name}_TB`];
        
        const data = students.map(student => {
          const details = periodType === 'term2' ? (student.term2Details || {}) : (student.term1Details || {});
          const grades: Partial<Grades> = periodType === 'term2' ? (student.term2Grades || {}) : periodType === 'year' ? (student.yearGrades || {}) : (student.term1Grades || student.grades);
          
          const detail = details[key] || { tx: [], gk: '', ck: '', tb: '' };
          const tb = grades[key] || '';
          
          return [
            student.id,
            student.fullName,
            detail.tx?.[0] || '',
            detail.tx?.[1] || '',
            detail.tx?.[2] || '',
            detail.tx?.[3] || '',
            detail.tx?.[4] || '',
            detail.tx?.[5] || '',
            detail.gk || '',
            detail.ck || '',
            tb
          ];
        });
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
        ws['!cols'] = [{ hidden: true }, { wch: 25 }];
        
        let safeName = name.replace(/[/\\?*:\[\]]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, safeName);
      });
      
      XLSX.writeFile(wb, `Mau_Nhap_Diem_Chi_Tiet_${periodType === 'term2' ? 'HK2' : periodType === 'year' ? 'CaNam' : 'HK1'}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      showAlert('Có lỗi xảy ra khi tạo file Excel.', 'error');
    }
  };

  const handleExportTemplate = async () => {
    try {
      const XLSX = (await import('xlsx'));
      
      const headers = ['ID_HocSinh', 'Họ và Tên', 'Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Tin học', 'Công nghệ', 'GD địa phương', 'Ngữ Văn', 'Lịch sử', 'Địa lý', 'GDKT & PL', 'Ngoại ngữ', 'GD thể chất', 'GDQP AN', 'Nhật Bản', 'HĐTN, HN', 'Học tập', 'Rèn luyện', 'CP', 'KP', 'Khen thưởng'];
      
      const data = students.map(student => {
        const grades: Partial<Grades> = periodType === 'term2' ? (student.term2Grades || {}) : periodType === 'year' ? (student.yearGrades || {}) : (student.term1Grades || student.grades);
        return [
          student.id,
          student.fullName,
          grades.math || '',
          grades.physics || '',
          grades.chemistry || '',
          grades.biology || '',
          grades.it || '',
          grades.technology || '',
          grades.localEdu || '',
          grades.literature || '',
          grades.history || '',
          grades.geography || '',
          grades.civicEdu || '',
          grades.foreignLanguage || '',
          grades.pe || '',
          grades.defense || '',
          grades.japanese || '',
          grades.experiential || '',
          student.academicPerformance || '',
          student.conduct || '',
          student.cp || '',
          student.kp || '',
          student.award || ''
        ];
      });
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      
      // hide ID column to prevent accidental edits
      ws['!cols'] = [{ hidden: true }, { wch: 25 }];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DiemSo');
      XLSX.writeFile(wb, `BangDiem_${periodType === 'term2' ? 'HK2' : periodType === 'year' ? 'CaNam' : 'HK1'}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      showAlert('Có lỗi xảy ra khi tạo file Excel.', 'error');
    }
  };

const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const XLSX = (await import('xlsx'));
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      
      const updates: { studentId: string, field: string, newValue: string | number | any }[] = [];
      
      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (!rows || rows.length <= 1) return;
        
        const isDetailed = rows[0]?.some((header: any) => typeof header === 'string' && header.includes('_TX1'));
        const headersRow = rows[0] as string[];
        
        const idIdx = headersRow.findIndex(h => h && typeof h === 'string' && (h.includes('ID') || h.includes('Mã')));
        const nameIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Họ và Tên'));

        if (isDetailed) {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            
            let studentId = '';
            if (idIdx !== -1 && row[idIdx]) studentId = row[idIdx].toString();
            if (!studentId && nameIdx !== -1 && row[nameIdx]) {
              const name = row[nameIdx].toString().trim().toLowerCase();
              const found = students.find(s => s.fullName.trim().toLowerCase() === name);
              if (found) studentId = found.id;
            }
            if (!studentId && row[0]) {
              const val = row[0].toString().trim();
              if (students.find(s => s.id === val)) studentId = val;
              else {
                 const found = students.find(s => s.fullName.trim().toLowerCase() === val.toLowerCase());
                 if (found) studentId = found.id;
              }
            }
            
            if (!studentId) continue;

            SUBJECT_KEYS.forEach(key => {
              const subjectName = getSubjectName(key);
              
              const tx1Idx = headersRow.indexOf(`${subjectName}_TX1`);
              const tx2Idx = headersRow.indexOf(`${subjectName}_TX2`);
              const tx3Idx = headersRow.indexOf(`${subjectName}_TX3`);
              const tx4Idx = headersRow.indexOf(`${subjectName}_TX4`);
              const tx5Idx = headersRow.indexOf(`${subjectName}_TX5`);
              const tx6Idx = headersRow.indexOf(`${subjectName}_TX6`);
              const gkIdx = headersRow.indexOf(`${subjectName}_GK`);
              const ckIdx = headersRow.indexOf(`${subjectName}_CK`);
              const tbIdx = headersRow.indexOf(`${subjectName}_TB`);
              
              if (tx1Idx === -1 && gkIdx === -1 && ckIdx === -1 && tbIdx === -1) {
                return; // Subject not in this Excel sheet
              }
              
              const tx = [
                tx1Idx !== -1 ? row[tx1Idx]?.toString() || '' : '',
                tx2Idx !== -1 ? row[tx2Idx]?.toString() || '' : '',
                tx3Idx !== -1 ? row[tx3Idx]?.toString() || '' : '',
                tx4Idx !== -1 ? row[tx4Idx]?.toString() || '' : '',
                tx5Idx !== -1 ? row[tx5Idx]?.toString() || '' : '',
                tx6Idx !== -1 ? row[tx6Idx]?.toString() || '' : ''
              ];
              const gk = gkIdx !== -1 ? row[gkIdx]?.toString() || '' : '';
              const ck = ckIdx !== -1 ? row[ckIdx]?.toString() || '' : '';
              const tb = tbIdx !== -1 ? row[tbIdx]?.toString() || '' : '';
              
              if (tx.some(t => t) || gk || ck || tb) {
                const detailField = periodType === 'term2' ? `term2Details.${key}` : `term1Details.${key}`;
                const gradeField = periodType === 'term2' ? `term2Grades.${key}` : `term1Grades.${key}`;
                
                if (detailField) updates.push({ studentId, field: detailField, newValue: { tx, gk, ck, tb } });
                
                if (tb) {
                  updates.push({ studentId, field: gradeField, newValue: tb });
                }
              }
            });
          }
        } else {
          const fieldsMap: Record<number, string> = {
            2: 'math', 3: 'physics', 4: 'chemistry', 5: 'biology', 6: 'it',
            7: 'technology', 8: 'localEdu', 9: 'literature', 10: 'history',
            11: 'geography', 12: 'civicEdu', 13: 'foreignLanguage', 14: 'pe',
            15: 'defense', 16: 'japanese', 17: 'experiential', 18: 'academicPerformance',
            19: 'conduct', 20: 'cp', 21: 'kp', 22: 'award'
          };

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            
            let studentId = '';
            if (idIdx !== -1 && row[idIdx]) studentId = row[idIdx].toString();
            if (!studentId && nameIdx !== -1 && row[nameIdx]) {
              const name = row[nameIdx].toString().trim().toLowerCase();
              const found = students.find(s => s.fullName.trim().toLowerCase() === name);
              if (found) studentId = found.id;
            }
            if (!studentId && row[0]) {
              const val = row[0].toString().trim();
              if (students.find(s => s.id === val)) studentId = val;
              else {
                 const found = students.find(s => s.fullName.trim().toLowerCase() === val.toLowerCase());
                 if (found) studentId = found.id;
              }
            }
            
            if (!studentId) continue;
            
            Object.entries(fieldsMap).forEach(([colIndexStr, field]) => {
              const colIndex = Number(colIndexStr);
              // Handle when columns might shift if ID is missing.
              // Let's assume standard template: 0: ID, 1: Name, 2: Math, 3: Physics...
              // So Math is always Name + 1, Physics is Name + 2, etc.
              let actualColIndex = colIndex;
              if (nameIdx !== -1) {
                 // in original template, Math is at col 2, and Name is at col 1. So offset is colIndex - 1.
                 actualColIndex = nameIdx + (colIndex - 1);
              }

              const cellValue = row[actualColIndex];
              if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                const isSubject = colIndex <= 17;
                let targetField = field;
                if (isSubject) {
                  targetField = periodType === 'term2' ? `term2Grades.${field}` : periodType === 'year' ? `yearGrades.${field}` : `term1Grades.${field}`;
                }
                updates.push({ studentId, field: targetField, newValue: cellValue.toString() });
              }
            });
          }
        }
      });
      
      if (updates.length > 0) {
        onUpdateMultipleGrades(updates);
        showAlert(`Đã cập nhật ${updates.length} đầu điểm thành công.`, 'success');
      } else {
        showAlert('Không tìm thấy dữ liệu điểm mới nào trong file.', 'info');
      }
    } catch (error) {
      console.error('Error importing Excel:', error);
      showAlert('Có lỗi xảy ra khi đọc file Excel. Vui lòng thử lại.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };
  
  const calculateAverage = (grades: Grades, visibleSubjs: Set<keyof Grades>) => {
    let total = 0;
    let count = 0;
    (Object.entries(grades) as [keyof Grades, string | number][]).forEach(([key, val]) => {
      if (visibleSubjs.has(key) && typeof val === 'number') {
        total += val;
        count++;
      }
    });
    return count > 0 ? (Math.round((total / count) * 10) / 10).toFixed(1) : '0.0';
  };

  const handleCalculateAllTB = () => {
    if (periodType !== 'term1' && periodType !== 'term2' && periodType !== 'year') {
      showAlert('Tính TB chỉ áp dụng cho học kỳ và cả năm.', 'info');
      return;
    }
    
    const updates: { studentId: string, field: string, newValue: any }[] = [];
    
    students.forEach(student => {
      if (periodType === 'year') {
        SUBJECT_KEYS.forEach(key => {
          const subjectName = getSubjectName(key);
          const isPassFail = ['GD thể chất', 'GD địa phương', 'HĐTN, HN'].includes(subjectName);
          const hk1 = student.term1Grades?.[key];
          const hk2 = student.term2Grades?.[key];
          let tb = '';
          
          if (isPassFail) {
            if (hk2 === 'Đ' || hk2 === 'CĐ') tb = hk2 as string;
            else if (hk1 === 'Đ' || hk1 === 'CĐ') tb = hk1 as string;
          } else {
            const h1Val = parseFloat(String(hk1));
            const h2Val = parseFloat(String(hk2));
            if (!isNaN(h1Val) && !isNaN(h2Val)) {
              tb = (Math.round(((h1Val + h2Val * 2) / 3) * 10) / 10).toFixed(1);
            } else if (!isNaN(h2Val)) {
              tb = (Math.round(h2Val * 10) / 10).toFixed(1);
            } else if (!isNaN(h1Val)) {
              tb = (Math.round(h1Val * 10) / 10).toFixed(1);
            }
          }
          
          if (tb !== '' && tb !== student.yearGrades?.[key]) {
            updates.push({
              studentId: student.id,
              field: `yearGrades.${key}`,
              newValue: tb
            });
          }
        });
        return;
      }
      
      const details = periodType === 'term2' ? (student.term2Details || {}) : (student.term1Details || {});
      
      SUBJECT_KEYS.forEach(key => {
        const detail = details[key];
        if (!detail) return;
        
        const subjectName = getSubjectName(key);
        const isPassFail = ['GD thể chất', 'GD địa phương', 'HĐTN, HN'].includes(subjectName);
        
        let tb = '';
        if (isPassFail) {
          if (detail.ck === 'Đ' || detail.ck === 'CĐ') tb = detail.ck;
          else if (detail.gk === 'Đ' || detail.gk === 'CĐ') tb = detail.gk;
          else {
            const lastTx = detail.tx?.slice().reverse().find(v => v === 'Đ' || v === 'CĐ');
            tb = lastTx || '';
          }
        } else {
          const txValues = (detail.tx || []).map(v => parseFloat(String(v))).filter(v => !isNaN(v));
          const gkValue = parseFloat(String(detail.gk));
          const ckValue = parseFloat(String(detail.ck));
          
          let totalScore = 0;
          let totalWeight = 0;
          
          txValues.forEach(val => { totalScore += val; totalWeight += 1; });
          if (!isNaN(gkValue)) { totalScore += gkValue * 2; totalWeight += 2; }
          if (!isNaN(ckValue)) { totalScore += ckValue * 3; totalWeight += 3; }
          
          if (totalWeight > 0) {
            tb = (Math.round((totalScore / totalWeight) * 10) / 10).toFixed(1);
          }
        }
        
        if (tb !== '' && tb !== detail.tb) {
          const updatedDetail = { ...detail, tb };
          const detailField = periodType === 'term2' ? `term2Details.${key}` : `term1Details.${key}`;
          const gradeField = periodType === 'term2' ? `term2Grades.${key}` : `term1Grades.${key}`;
          
          if (detailField) updates.push({ studentId: student.id, field: detailField, newValue: updatedDetail });
          updates.push({ studentId: student.id, field: gradeField, newValue: tb });
        }
      });
    });
    
    if (updates.length > 0) {
      onUpdateMultipleGrades(updates);
      showAlert(`Đã tự động tính ${updates.length / 2} điểm TB.`, 'success');
    } else {
      showAlert('Tất cả điểm TB đã được tính.', 'info');
    }
  };

  const getRank = (avgStr: string, hasFail: boolean) => {
    const avg = parseFloat(avgStr);
    if (avg >= 8.0 && !hasFail) return 'Giỏi';
    if (avg >= 6.5 && !hasFail) return 'Khá';
    if (avg >= 5.0) return 'Trung bình';
    return 'Yếu';
  };

  const studentWithStats = useMemo(() => {
    const periodIndex = periodType === 'week' ? selectedWeek : periodType === 'month' ? selectedMonth : 0;

    return students.map(s => {
      let currentGrades = { ...s.grades };
      
      if (periodType === 'term1') {
        if (s.term1Grades) currentGrades = { ...s.term1Grades };
      } else if (periodType === 'term2') {
        currentGrades = s.term2Grades ? { ...s.term2Grades } : Object.keys(s.grades).reduce((acc, key) => ({...acc, [key]: ''}), {} as Grades);
      } else if (periodType === 'year') {
        currentGrades = s.yearGrades ? { ...s.yearGrades } : Object.keys(s.grades).reduce((acc, key) => ({...acc, [key]: ''}), {} as Grades);
      } else {
        if (s.term1Grades) currentGrades = { ...s.term1Grades };
        Object.keys(currentGrades).forEach(key => {
          const k = key as keyof Grades;
          const baseGrade = currentGrades[k];
          if (typeof baseGrade === 'number') {
            const variation = (s.id.charCodeAt(0) + periodIndex) % 3 - 1; // -1, 0, 1
            let simulated = baseGrade + variation * 0.5;
            simulated = Math.max(0, Math.min(10, simulated));
            currentGrades[k] = (Math.round(simulated * 10) / 10) as never;
          }
        });
      }

      const avg = calculateAverage(currentGrades, visibleSubjects);
      const hasFail = (Object.entries(currentGrades) as [keyof Grades, string | number][]).some(([key, val]) => 
        visibleSubjects.has(key) && (val === 'CĐ' || (typeof val === 'number' && val < 5.0))
      );

      return {
        ...s,
        displayGrades: currentGrades,
        calculatedAvg: avg,
        rank: getRank(avg, hasFail)
      };
    });
  }, [students, periodType, selectedWeek, selectedMonth, visibleSubjects]);

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Quản lý Điểm số</h2>
          <p className="text-sm text-slate-500 mt-1">Lớp {className || ''} • {students.length} Học sinh</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".xlsx" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" /> Nhập từ Excel
          </button>
<div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Xuất File Excel
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => {
                      handleExportTemplate();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    Xuất bảng điểm (Tổng)
                  </button>
                  <button 
                    onClick={() => {
                      handleExportDetailedTemplate();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    Xuất bảng điểm (Chi tiết)
                  </button>
                </div>
              </>
            )}
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Gửi Bảng điểm cho PH
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Toolbar: Kỳ đánh giá */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setPeriodType('week')}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${periodType === 'week' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Theo tuần
              </button>
              <button 
                onClick={() => setPeriodType('month')}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${periodType === 'month' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Theo tháng
              </button>
              <button 
                onClick={() => setPeriodType('term1')}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${periodType === 'term1' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                HK I
              </button>
              <button 
                onClick={() => setPeriodType('term2')}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${periodType === 'term2' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                HK II
              </button>
              <button 
                onClick={() => setPeriodType('year')}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${periodType === 'year' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Cả năm
              </button>
            </div>
            
            {periodType === 'week' && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <select 
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  {Array.from({length: 35}).map((_, i) => (
                    <option key={i} value={i+1}>Tuần {i+1}</option>
                  ))}
                </select>
              </div>
            )}
            
            {periodType === 'month' && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value={9}>Tháng 9</option>
                  <option value={10}>Tháng 10</option>
                  <option value={11}>Tháng 11</option>
                  <option value={12}>Tháng 12</option>
                  <option value={1}>Tháng 1</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen className="w-4 h-4" />
              <span>Đang hiển thị điểm: <strong className="text-slate-700">{periodType === 'week' ? `Tuần ${selectedWeek}` : periodType === 'month' ? `Tháng ${selectedMonth}` : periodType === 'term1' ? 'Học kỳ I' : periodType === 'term2' ? 'Học kỳ II' : 'Cả năm'}</strong></span>
            </div>
            
            {(periodType === 'term1' || periodType === 'term2' || periodType === 'year') && (
              <div className="relative">
                <div className="flex gap-2">
                <button 
                  onClick={handleCalculateAllTB}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 shadow-sm flex items-center gap-2"
                  title="Tính Trung bình tất cả học sinh"
                >
                  <Calculator className="w-4 h-4" /> Tính TB Nhanh
                </button>
                <button 
                  onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2"
                >
                  Tùy chỉnh cột
                </button>
              </div>
                {showSubjectMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 max-h-80 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-700 text-sm">Chọn môn hiển thị</span>
                      <button onClick={() => setShowSubjectMenu(false)} className="text-slate-400 hover:text-slate-700 text-xs">Đóng</button>
                    </div>
                    {SUBJECT_KEYS.map(key => (
                      <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={visibleSubjects.has(key)}
                          onChange={(e) => {
                            const newSet = new Set(visibleSubjects);
                            if (e.target.checked) newSet.add(key);
                            else newSet.delete(key);
                            setVisibleSubjects(newSet);
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{getSubjectName(key)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3 bg-slate-50 sticky left-0 border-r border-slate-200 z-20 w-48">Họ và Tên</th>
                {periodType === 'week' || periodType === 'month' ? (
                  <>
                    <th className="px-3 py-3 text-center w-32">Học tập</th>
                    <th className="px-3 py-3 text-center w-32">Thành tích</th>
                    <th className="px-3 py-3 text-center w-48">Khen thưởng</th>
                    <th className="px-3 py-3 text-center w-64">Thi đua & Kỷ luật</th>
                    <th className="px-3 py-3 text-center flex-1">Nhận xét</th>
                  </>
                ) : (
                  <>
                    {SUBJECT_KEYS.filter(key => visibleSubjects.has(key)).map(key => (
                      <th key={key} className="px-3 py-3 text-center">{getSubjectName(key)}</th>
                    ))}
                    <th className="px-3 py-3 text-center text-indigo-700 bg-indigo-50 border-l border-indigo-100">Học tập</th>
                    <th className="px-3 py-3 text-center text-indigo-700 bg-indigo-50">Rèn luyện</th>
                    <th className="px-3 py-3 text-center text-indigo-700 bg-indigo-50">CP</th>
                    <th className="px-3 py-3 text-center text-indigo-700 bg-indigo-50">KP</th>
                    <th className="px-3 py-3 text-center text-indigo-700 bg-indigo-50">Khen thưởng</th>
                    <th className="px-4 py-3 text-center bg-indigo-50 border-l border-indigo-100">Trung Bình</th>
                    <th className="px-4 py-3 text-center bg-indigo-50">Xếp Loại</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentWithStats.map(student => {
                const isGamification = periodType === 'week' || periodType === 'month';
                
                let gData: any = { achievement: '', reward: '', study: '', comment: '', goldCards: 0, silverCards: 0, bronzeCards: 0, penaltyLevel: 0 };
                if (periodType === 'week') {
                  gData = student.weeklyData?.[selectedWeek] || gData;
                } else if (periodType === 'month') {
                  gData = computeMonthlyGamificationData(student, selectedMonth) || gData;
                }
                const dataPath = periodType === 'week' ? `weeklyData.${selectedWeek}` : `monthlyData.${selectedMonth}`;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3 bg-white group-hover:bg-slate-50/80 sticky left-0 border-r border-slate-100 z-10">
                      <p className="font-bold text-sm text-slate-800 whitespace-nowrap">{student.fullName}</p>
                    </td>
                    {isGamification ? (
                      periodType === 'week' ? (
                        <>
                          <td className="px-2 py-2 text-center font-medium text-slate-600"><EditableCell value={gData.study} onSave={(val) => onUpdateGrade(student.id, `${dataPath}.study`, val)} /></td>
                          <td className="px-2 py-2 text-center font-medium text-slate-600"><EditableCell value={gData.achievement} onSave={(val) => onUpdateGrade(student.id, `${dataPath}.achievement`, val)} /></td>
                          <td className="px-2 py-2 text-center font-medium text-slate-600"><EditableCell value={gData.reward} onSave={(val) => onUpdateGrade(student.id, `${dataPath}.reward`, val)} /></td>
                          <td className="px-2 py-2 text-center">
                            <GamificationCell data={gData} onUpdate={(field, val) => onUpdateGrade(student.id, `${dataPath}.${field}`, val)} />
                          </td>
                          <td className="px-2 py-2 text-center font-medium text-slate-600"><EditableCell value={gData.comment} onSave={(val) => onUpdateGrade(student.id, `${dataPath}.comment`, val)} /></td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-3 text-sm text-slate-700 whitespace-pre-line border-l border-slate-100">{gData.study || <span className="text-slate-400 italic">Trống</span>}</td>
                          <td className="px-3 py-3 text-sm text-slate-700 whitespace-pre-line border-l border-slate-100">{gData.achievement || <span className="text-slate-400 italic">Trống</span>}</td>
                          <td className="px-3 py-3 text-sm text-slate-700 whitespace-pre-line border-l border-slate-100">{gData.reward || <span className="text-slate-400 italic">Trống</span>}</td>
                          <td className="px-3 py-3 text-center border-l border-slate-100">
                            <div className="flex flex-col gap-2 items-center justify-center">
                              <div className="flex gap-3">
                                <div className="flex flex-col items-center"><Medal className="w-5 h-5 text-yellow-500" /><span className="text-xs font-bold">{gData.goldCards}</span></div>
                                <div className="flex flex-col items-center"><Medal className="w-5 h-5 text-slate-400" /><span className="text-xs font-bold">{gData.silverCards}</span></div>
                                <div className="flex flex-col items-center"><Medal className="w-5 h-5 text-amber-600" /><span className="text-xs font-bold">{gData.bronzeCards}</span></div>
                              </div>
                              {gData.penaltyLevel > 0 && (
                                <div className={`text-xs font-bold px-2 py-1 rounded ${gData.penaltyLevel === 1 ? 'bg-yellow-100 text-yellow-700' : gData.penaltyLevel === 2 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                  {gData.penaltyLevel === 1 ? 'Có nhắc nhở' : gData.penaltyLevel === 2 ? 'Có cảnh cáo' : 'Có vi phạm nặng'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-700 whitespace-pre-line border-l border-slate-100">{gData.comment || <span className="text-slate-400 italic">Trống</span>}</td>
                        </>
                      )
                    ) : (
                      <>
                        {SUBJECT_KEYS.filter(key => visibleSubjects.has(key)).map(key => (
                          <td key={key} className="px-1 py-1 text-center font-medium text-slate-600">
                            {(periodType === 'term1' || periodType === 'term2') ? (
                              <div 
                                className="w-full h-full min-h-[28px] flex items-center justify-center cursor-pointer hover:bg-indigo-50/80 rounded transition-colors"
                                onClick={() => {
                                  setDetailModalData({ student, subject: key });
                                  setDetailModalOpen(true);
                                }}
                              >
                                {student.displayGrades[key] || '-'}
                              </div>
                            ) : (
                              <EditableCell 
                                value={student.displayGrades[key]} 
                                onSave={(val) => onUpdateGrade(student.id, `yearGrades.${key}`, val)} 
                              />
                            )}
                          </td>
                        ))}
                        
                        <td className="px-1 py-1 text-center font-medium text-indigo-700 bg-indigo-50/30 border-l border-indigo-50"><EditableCell value={student.academicPerformance || ''} onSave={(val) => onUpdateGrade(student.id, 'academicPerformance', val)} /></td>
                        <td className="px-1 py-1 text-center font-medium text-indigo-700 bg-indigo-50/30"><EditableCell value={student.conduct || ''} onSave={(val) => onUpdateGrade(student.id, 'conduct', val)} /></td>
                        <td className="px-1 py-1 text-center font-medium text-indigo-700 bg-indigo-50/30"><EditableCell value={student.cp} onSave={(val) => onUpdateGrade(student.id, 'cp', val)} /></td>
                        <td className="px-1 py-1 text-center font-medium text-indigo-700 bg-indigo-50/30"><EditableCell value={student.kp} onSave={(val) => onUpdateGrade(student.id, 'kp', val)} /></td>
                        <td className="px-1 py-1 text-center font-medium text-indigo-700 bg-indigo-50/30"><EditableCell value={student.award || ''} onSave={(val) => onUpdateGrade(student.id, 'award', val)} /></td>
                        
                        <td className="px-4 py-3 text-center bg-indigo-50/30 border-l border-indigo-50">
                          <span className="text-indigo-700 font-bold text-base">{student.calculatedAvg}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-indigo-50/30">
                          <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${student.rank === 'Giỏi' ? 'bg-green-100 text-green-700' : student.rank === 'Khá' ? 'bg-blue-100 text-blue-700' : student.rank === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {student.rank}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detailModalOpen && detailModalData && (
        <GradeDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setDetailModalData(null);
          }}
          studentName={detailModalData.student.fullName}
          subjectName={getSubjectName(detailModalData.subject)}
          initialData={
            periodType === 'term2' 
              ? detailModalData.student.term2Details?.[detailModalData.subject] 
              : detailModalData.student.term1Details?.[detailModalData.subject]
          }
          onSave={(data) => {
            const detailField = periodType === 'term2' ? `term2Details.${detailModalData.subject}` : `term1Details.${detailModalData.subject}`;
            const gradeField = periodType === 'term2' ? `term2Grades.${detailModalData.subject}` : `term1Grades.${detailModalData.subject}`;
            
            // First save the details, then update the main TB grade
            onUpdateGrade(detailModalData.student.id, detailField, data);
            if (data.tb !== '') {
              onUpdateGrade(detailModalData.student.id, gradeField, data.tb);
            }
          }}
        />
      )}
    </div>
  );
}
