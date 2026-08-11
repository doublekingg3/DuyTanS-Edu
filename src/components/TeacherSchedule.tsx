import React, { useState, useEffect, useRef } from 'react';
import { SchoolClass, ClassSchedule, SchedulePeriod } from '../data';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAlert } from '../contexts/AlertContext';
import { Upload, Calendar, Search, Monitor, Smartphone, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function TeacherSchedule({ classId }: { classId: string }) {
  const { showAlert } = useAlert();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!classId) { setIsLoading(false); return; }
    
    setIsLoading(true);
    const docRef = doc(db, 'schedules', classId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSchedule(docSnap.data() as ClassSchedule);
      } else {
        setSchedule(null);
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
    const csvContent = `\ufeffTHỜI KHOÁ BIỂU - LỚP MẪU,,,,,
,,,,,
Tiết / Thứ,Thứ 2,Thứ 3,Thứ 4,Thứ 5,Thứ 6,Thứ 7
Sáng - Tiết 1 (7:00-7:45),Toán,Văn,Anh,,,,
Sáng - Tiết 2 (7:50-8:35),Lý,Hóa,Sinh,,,,
Sáng - Tiết 3 (8:55-9:40),,,,,,,
Sáng - Tiết 4 (9:45-10:30),,,,,,,
Chiều - Tiết 1 (13:30-14:15),,,,,,,
Chiều - Tiết 2 (14:20-15:05),,,,,,,
Chiều - Tiết 3 (15:25-16:10),,,,,,,
Chiều - Tiết 4 (16:15-17:00),,,,,,,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'TKB_Mau.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        // Format is:
        // 0: THỜI KHOÁ BIỂU - LỚP ...
        // 1: Empty
        // 2: Tiết / Thứ, Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, [Thứ 7]
        // 3+: Periods
        
        // Find header row
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
          
          periods.push({
            time: String(row[0] || ''),
            t2: String(row[1] || ''),
            t3: String(row[2] || ''),
            t4: String(row[3] || ''),
            t5: String(row[4] || ''),
            t6: String(row[5] || ''),
            t7: String(row[6] || '')
          });
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full bg-slate-50 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Thời khoá biểu
          </h2>
          <p className="text-slate-500 mt-1">Quản lý và cập nhật thời khoá biểu cho lớp học</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm mr-2 hidden sm:flex">
            <button 
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'desktop' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Monitor className="w-4 h-4" /> PC
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'mobile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Smartphone className="w-4 h-4" /> Mobile
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Tải mẫu (CSV)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Tải lên TKB (CSV/Excel)
          </button>
        </div>
      </div>

      {!schedule || schedule.periods.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có thời khoá biểu</h3>
          <p className="text-slate-500 mb-6 max-w-md">Lớp học này chưa có thời khoá biểu. Vui lòng tải lên file CSV/Excel theo đúng cấu trúc để hiển thị.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-5 h-5" /> Tải lên ngay
          </button>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Desktop View */}
          <div className={`flex-1 overflow-auto ${viewMode === 'desktop' ? 'block hidden sm:block' : 'hidden'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                  <th className="p-4 font-semibold text-sm w-48 border-r border-slate-200">Tiết / Thứ</th>
                  <th className="p-4 font-semibold text-sm min-w-[150px] border-r border-slate-200">Thứ 2</th>
                  <th className="p-4 font-semibold text-sm min-w-[150px] border-r border-slate-200">Thứ 3</th>
                  <th className="p-4 font-semibold text-sm min-w-[150px] border-r border-slate-200">Thứ 4</th>
                  <th className="p-4 font-semibold text-sm min-w-[150px] border-r border-slate-200">Thứ 5</th>
                  <th className="p-4 font-semibold text-sm min-w-[150px] border-r border-slate-200">Thứ 6</th>
                  <th className="p-4 font-semibold text-sm min-w-[150px]">Thứ 7</th>
                </tr>
              </thead>
              <tbody>
                {schedule.periods.map((period, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 text-sm border-r border-slate-200 bg-slate-50/30">
                      {period.time}
                    </td>
                    <td className="p-4 text-sm text-slate-600 border-r border-slate-200 whitespace-pre-wrap">{period.t2}</td>
                    <td className="p-4 text-sm text-slate-600 border-r border-slate-200 whitespace-pre-wrap">{period.t3}</td>
                    <td className="p-4 text-sm text-slate-600 border-r border-slate-200 whitespace-pre-wrap">{period.t4}</td>
                    <td className="p-4 text-sm text-slate-600 border-r border-slate-200 whitespace-pre-wrap">{period.t5}</td>
                    <td className="p-4 text-sm text-slate-600 border-r border-slate-200 whitespace-pre-wrap">{period.t6}</td>
                    <td className="p-4 text-sm text-slate-600 whitespace-pre-wrap">{period.t7}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className={`flex-1 overflow-auto bg-slate-50 p-4 ${viewMode === 'mobile' ? 'block' : 'block sm:hidden'}`}>
            <div className="space-y-6">
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((dayStr, dayIdx) => {
                const dayKey = `t${dayIdx + 2}` as keyof SchedulePeriod;
                const hasClasses = schedule.periods.some(p => p[dayKey] && String(p[dayKey]).trim() !== '');
                if (!hasClasses) return null;
                
                return (
                  <div key={dayStr} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-indigo-600 px-4 py-3 text-white font-bold text-lg">
                      {dayStr}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {schedule.periods.map((period, idx) => {
                        const cellValue = period[dayKey];
                        if (!cellValue || String(cellValue).trim() === '') return null;
                        
                        return (
                          <div key={idx} className="p-4 flex gap-4 items-start">
                            <div className="shrink-0 w-24">
                              <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                                {period.time.split('(')[0]?.trim() || period.time}
                              </span>
                              {period.time.includes('(') && (
                                <div className="text-xs text-slate-500 mt-1 font-medium">
                                  {period.time.substring(period.time.indexOf('(')).replace(/[()]/g, '')}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{cellValue}</div>
                            </div>
                          </div>
                        );
                      })}
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
