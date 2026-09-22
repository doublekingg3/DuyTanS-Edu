import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAlert } from '../contexts/AlertContext';
import { Utensils, CheckCircle, ChevronLeft, ChevronRight, Download, Save, Plus, Trash2, Upload, X, RotateCcw, Eye, Shield } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { generateSchoolWeeks, getCurrentSchoolWeek } from '../lib/schoolWeekUtils';
import { canUserEdit } from '../lib/permissions';
import { UserAccount } from '../data';

// Helper function to format various Excel date formats (Date, serial number, DD/MM/YYYY, YYYY-MM-DD)
const formatExcelDate = (val: any): string => {
  if (!val && val !== 0) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'number') {
    // Excel date serial number (days since 1899-12-30)
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const str = String(val).trim();
  // Match DD/MM/YYYY or DD-MM-YYYY
  const vnMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (vnMatch) {
    const d = vnMatch[1].padStart(2, '0');
    const m = vnMatch[2].padStart(2, '0');
    const y = vnMatch[3];
    return `${y}-${m}-${d}`;
  }
  // Match YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return str;
};

export default function TeacherLunchMenu({ 
  classId, 
  role, 
  user,
  schoolYearName 
}: { 
  classId: string; 
  role?: string; 
  user?: UserAccount;
  schoolYearName?: string; 
}) {
  const canEdit = canUserEdit(user, role, 'lunchMenu');
  const [weeks, setWeeks] = useState<{id: number, name: string, status: string, startDate?: string, endDate?: string, dateRangeFormatted?: string}[]>([]);
  const realtimeCurrentWeek = getCurrentSchoolWeek(schoolYearName);
  const [selectedWeek, setSelectedWeek] = useState(() => realtimeCurrentWeek);
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<{day: string, dishes: string[]}[]>([]);

  useEffect(() => {
    // We use a global document for lunch menus for the whole school
    const docRef = doc(db, 'lunch_menus', 'general');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      const standardWeeks = generateSchoolWeeks(schoolYearName, 42);

      const newWeeks = standardWeeks.map((stdWeek) => {
        const weekId = stdWeek.id;
        const weekData = data?.weeks?.[weekId];
        
        return {
          id: weekId,
          name: `Tuần ${weekId}`,
          status: weekData?.status || 'empty',
          startDate: weekData?.startDate || stdWeek.startDate,
          endDate: weekData?.endDate || stdWeek.endDate,
          dateRangeFormatted: `${stdWeek.startFormatted} - ${stdWeek.endFormatted}`
        };
      });
      setWeeks(newWeeks);
      
      const currentWeekData = data?.weeks?.[selectedWeek];
      if (currentWeekData?.menus) {
        setMenus(currentWeekData.menus);
      } else {
        setMenus([
          { day: 'Thứ 2', dishes: [] },
          { day: 'Thứ 3', dishes: [] },
          { day: 'Thứ 4', dishes: [] },
          { day: 'Thứ 5', dishes: [] },
          { day: 'Thứ 6', dishes: [] }
        ]);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [selectedWeek, schoolYearName]);

  const saveToFirebase = async (weekId: number, updateData: any) => {
    if (!canEdit) {
      showAlert('Bạn chỉ có quyền xem thực đơn, không có quyền thay đổi.', 'error');
      return;
    }
    try {
      await setDoc(doc(db, 'lunch_menus', 'general'), {
        weeks: {
          [weekId]: updateData
        }
      }, { merge: true });
    } catch (e) {
      console.error(e);
      showAlert('Lỗi khi lưu dữ liệu lên server.', 'error');
    }
  };

  const handleApprove = async () => {
    if (!canEdit) {
      showAlert('Chỉ Ban Giám Hiệu hoặc Giáo vụ mới có quyền duyệt thực đơn.', 'error');
      return;
    }
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn duyệt thực đơn Tuần ${selectedWeek} không?\nSau khi duyệt, thực đơn sẽ áp dụng cho toàn bộ học sinh và hiển thị chính thức cho Phụ huynh.`);
    if (confirmed) {
      await saveToFirebase(selectedWeek, { status: 'approved', menus });
      setWeeks(prev => prev.map(w => w.id === selectedWeek ? { ...w, status: 'approved' } : w));
      showAlert(`Duyệt thực đơn Tuần ${selectedWeek} thành công! Áp dụng cho toàn bộ các lớp.`, 'success');
    }
  };

  const handleSaveDraft = async () => {
    if (!canEdit) {
      showAlert('Chỉ Ban Giám Hiệu hoặc Giáo vụ mới có quyền lưu thực đơn.', 'error');
      return;
    }
    await saveToFirebase(selectedWeek, { status: 'draft', menus });
    setWeeks(prev => prev.map(w => w.id === selectedWeek ? { ...w, status: 'draft' } : w));
    showAlert(`Đã lưu nháp thực đơn Tuần ${selectedWeek}`, 'success');
  };

  const handleCancelApprove = async () => {
    if (!canEdit) {
      showAlert('Chỉ Ban Giám Hiệu hoặc Giáo vụ mới có quyền hủy duyệt.', 'error');
      return;
    }
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn hủy duyệt thực đơn Tuần ${selectedWeek} không?\nTrạng thái sẽ trở về Bản nháp để có thể chỉnh sửa và lên lại món ăn.`);
    if (confirmed) {
      await saveToFirebase(selectedWeek, { status: 'draft' });
      setWeeks(prev => prev.map(w => w.id === selectedWeek ? { ...w, status: 'draft' } : w));
      showAlert(`Đã hủy duyệt thực đơn Tuần ${selectedWeek}. Bạn có thể lên lại món và lưu lại.`, 'success');
    }
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportPDF = () => {
    window.print();
  };

  const handleDownloadTemplate = () => {
    const currentWeek = weeks.find(w => w.id === selectedWeek);
    const startDate = currentWeek?.startDate || '';
    const endDate = currentWeek?.endDate || '';

    // Headers with 2 columns: Ngày bắt đầu and Ngày kết thúc
    const templateData: any[][] = [
      ['Thứ', 'Ngày bắt đầu (YYYY-MM-DD)', 'Ngày kết thúc (YYYY-MM-DD)', 'Món 1', 'Món 2', 'Món 3', 'Món 4', 'Món 5']
    ];

    days.forEach((day, index) => {
      const dayMenu = menus.find(m => m.day === day);
      const dishes = dayMenu ? dayMenu.dishes.filter(d => d.trim() !== '') : [];
      templateData.push([
        day,
        index === 0 ? startDate : '',
        index === 0 ? endDate : '',
        dishes[0] || (index === 0 ? 'Cơm trắng' : ''),
        dishes[1] || (index === 0 ? 'Thịt kho trứng' : ''),
        dishes[2] || (index === 0 ? 'Canh rau ngót thịt bằm' : ''),
        dishes[3] || (index === 0 ? 'Chuối tráng miệng' : ''),
        dishes[4] || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 12 }, // Thứ
      { wch: 28 }, // Ngày bắt đầu (YYYY-MM-DD)
      { wch: 28 }, // Ngày kết thúc (YYYY-MM-DD)
      { wch: 22 }, // Món 1
      { wch: 22 }, // Món 2
      { wch: 24 }, // Món 3
      { wch: 22 }, // Món 4
      { wch: 20 }, // Món 5
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `ThucDon_Tuan_${selectedWeek}`);
    XLSX.writeFile(wb, `Mau_ThucDon_Tuan_${selectedWeek}.xlsx`);
  };

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
      showAlert('Bạn chỉ có quyền xem thực đơn, không có quyền thay đổi.', 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (!data || data.length < 2) {
          showAlert('File Excel không có dữ liệu!', 'info');
          return;
        }

        const headerRow = data[0] || [];
        let dayColIdx = -1;
        let startColIdx = -1;
        let endColIdx = -1;

        // Detect column indices based on header labels
        headerRow.forEach((col: any, idx: number) => {
          const text = String(col || '').toLowerCase().trim();
          if (text.includes('thứ') || text.includes('ngày trong tuần') || text === 'day') {
            if (dayColIdx === -1) dayColIdx = idx;
          } else if (text.includes('bắt đầu') || text.includes('start') || text.includes('từ ngày')) {
            if (startColIdx === -1) startColIdx = idx;
          } else if (text.includes('kết thúc') || text.includes('end') || text.includes('đến ngày')) {
            if (endColIdx === -1) endColIdx = idx;
          }
        });

        // Default fallbacks if header doesn't match standard keywords
        if (dayColIdx === -1) dayColIdx = 0;
        if (startColIdx === -1 && endColIdx === -1 && headerRow.length >= 3) {
          // Check if col 1 and 2 look like dates
          const s1 = data[1]?.[1];
          const s2 = data[1]?.[2];
          if (s1 && formatExcelDate(s1).match(/^\d{4}-\d{2}-\d{2}$/)) startColIdx = 1;
          if (s2 && formatExcelDate(s2).match(/^\d{4}-\d{2}-\d{2}$/)) endColIdx = 2;
        }

        let uploadedStartDate = '';
        let uploadedEndDate = '';

        const newMenus = days.map(day => ({ day, dishes: ['', ''] }));

        data.slice(1).forEach((row: any) => {
          if (!row || row.length === 0) return;

          // Extract start date if present
          if (startColIdx !== -1 && row[startColIdx] && !uploadedStartDate) {
            const formatted = formatExcelDate(row[startColIdx]);
            if (formatted && formatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
              uploadedStartDate = formatted;
            }
          }

          // Extract end date if present
          if (endColIdx !== -1 && row[endColIdx] && !uploadedEndDate) {
            const formatted = formatExcelDate(row[endColIdx]);
            if (formatted && formatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
              uploadedEndDate = formatted;
            }
          }

          const rawDay = String(row[dayColIdx] || '').trim();
          if (!rawDay) return;

          const matchedDay = days.find(d => {
            const dNum = d.replace(/\D/g, '');
            return rawDay.toLowerCase().includes(d.toLowerCase()) || 
                   (dNum && (rawDay.toLowerCase() === `t${dNum}` || rawDay.includes(`thứ ${dNum}`) || rawDay.includes(`thu ${dNum}`)));
          });

          if (matchedDay) {
            const dayMenu = newMenus.find(m => m.day === matchedDay);
            if (dayMenu) {
              const dishes: string[] = [];
              row.forEach((cell: any, cIdx: number) => {
                // Do not treat day, startDate, or endDate columns as dishes
                if (cIdx !== dayColIdx && cIdx !== startColIdx && cIdx !== endColIdx) {
                  const dishText = String(cell || '').trim();
                  if (dishText) dishes.push(dishText);
                }
              });
              if (dishes.length === 0) dishes.push('', '');
              else if (dishes.length === 1) dishes.push('');
              dayMenu.dishes = dishes;
            }
          }
        });

        setMenus(newMenus);

        // Prepare data to save to Firebase
        const updatePayload: any = {
          menus: newMenus
        };
        if (uploadedStartDate) {
          updatePayload.startDate = uploadedStartDate;
        }
        if (uploadedEndDate) {
          updatePayload.endDate = uploadedEndDate;
        }

        // Update local weeks state
        setWeeks(prevWeeks => prevWeeks.map(w => {
          if (w.id === selectedWeek) {
            return {
              ...w,
              startDate: uploadedStartDate || w.startDate,
              endDate: uploadedEndDate || w.endDate
            };
          }
          return w;
        }));

        // Persist to Firebase
        await saveToFirebase(selectedWeek, updatePayload);

        let successMsg = `Nhập dữ liệu thực đơn Tuần ${selectedWeek} thành công!`;
        if (uploadedStartDate && uploadedEndDate) {
          successMsg += ` Đã cập nhật ngày áp dụng: ${uploadedStartDate} đến ${uploadedEndDate}.`;
        }
        showAlert(successMsg, 'success');

      } catch (error) {
        console.error(error);
        showAlert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file mẫu.', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  if (loading) {
    return <div className="p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 h-full bg-slate-50 overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            Thực Đơn Ăn Trưa Theo Tuần
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Lên thực đơn dinh dưỡng hàng ngày cho toàn bộ học sinh bán trú của trường (áp dụng chung tất cả các lớp)</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full md:w-auto">
          <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-xs sm:text-sm shadow-2xs whitespace-nowrap">
            <Download className="w-4 h-4" /> <span>Tải mẫu</span>
          </button>
          {canEdit && (
            <label className="flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 border border-amber-500 text-amber-600 font-medium rounded-xl hover:bg-amber-50 transition-colors cursor-pointer text-xs sm:text-sm shadow-2xs whitespace-nowrap">
              <Upload className="w-4 h-4" /> <span>Upload</span>
              <input type="file" ref={fileInputRef} onChange={handleUploadTemplate} accept=".xlsx, .xls, .csv" className="hidden" />
            </label>
          )}
          <button onClick={handleExportPDF} className="flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors text-xs sm:text-sm shadow-2xs whitespace-nowrap">
            <Download className="w-4 h-4" /> <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Chọn tuần áp dụng</h3>
        <div className="flex items-center gap-2">
          <button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
            {weeks.map(week => {
              const isRealCurrent = week.id === realtimeCurrentWeek;
              return (
                <button 
                  key={week.id}
                  onClick={() => setSelectedWeek(week.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[105px] px-3 py-2 rounded-xl border transition-all relative ${
                    selectedWeek === week.id 
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                      : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{week.name}</span>
                  </div>
                  {week.dateRangeFormatted && (
                    <span className={`text-[11px] font-medium mt-0.5 ${selectedWeek === week.id ? 'text-amber-100' : 'text-slate-500'}`}>
                      {week.dateRangeFormatted}
                    </span>
                  )}
                  {week.status === 'approved' && <span className={`text-[11px] font-semibold mt-0.5 ${selectedWeek === week.id ? 'text-amber-100' : 'text-emerald-600'}`}>✓ Đã duyệt</span>}
                  {week.status === 'draft' && <span className={`text-[11px] font-semibold mt-0.5 ${selectedWeek === week.id ? 'text-amber-100' : 'text-amber-600'}`}>Bản nháp</span>}
                  {week.status === 'empty' && <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-amber-100' : 'text-slate-400'}`}>Chưa lên món</span>}
                </button>
              );
            })}
          </div>
          <button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold font-display text-slate-800">Thực Đơn Tuần {selectedWeek}</h3>
                {weeks.find(w => w.id === selectedWeek)?.status === 'approved' && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Đã duyệt
                  </span>
                )}
                {weeks.find(w => w.id === selectedWeek)?.status === 'draft' && (
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                    Bản nháp
                  </span>
                )}
                {weeks.find(w => w.id === selectedWeek)?.status === 'empty' && (
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                    Chưa lên món
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {weeks.find(w => w.id === selectedWeek)?.startDate && weeks.find(w => w.id === selectedWeek)?.endDate
                  ? `Thời gian: từ ${weeks.find(w => w.id === selectedWeek)?.startDate} đến ${weeks.find(w => w.id === selectedWeek)?.endDate}`
                  : 'Chưa thiết lập ngày áp dụng'}
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2.5 self-end sm:self-auto">
            {!canEdit ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100/90 text-slate-600 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Chế độ chỉ xem (Chỉ Admin & Giáo vụ mới có quyền thay đổi)</span>
              </div>
            ) : (
              <>
                <button 
                  onClick={handleSaveDraft} 
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Save className="w-4 h-4 text-slate-500" /> Lưu nháp
                </button>

                {weeks.find(w => w.id === selectedWeek)?.status === 'approved' ? (
                  <>
                    <button 
                      onClick={handleCancelApprove} 
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-sm rounded-lg hover:bg-rose-100 transition-colors shadow-2xs" 
                      title="Hủy duyệt để chuyển về bản nháp và lên lại món ăn"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-600" /> Hủy duyệt
                    </button>
                    <button 
                      onClick={handleApprove} 
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors shadow-sm" 
                      title="Cập nhật lại duyệt thực đơn cho toàn trường"
                    >
                      <CheckCircle className="w-4 h-4" /> Cập nhật duyệt
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleApprove} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 transition-colors shadow-sm" 
                    title="Duyệt thực đơn cho toàn trường"
                  >
                    <CheckCircle className="w-4 h-4" /> Duyệt thực đơn
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày (Bắt đầu)</label>
              <input 
                type="date" 
                disabled={!canEdit}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-slate-100/70 disabled:text-slate-600 disabled:cursor-not-allowed" 
                value={weeks.find(w => w.id === selectedWeek)?.startDate || ''}
                onChange={(e) => canEdit && saveToFirebase(selectedWeek, { startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày (Kết thúc)</label>
              <input 
                type="date" 
                disabled={!canEdit}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-slate-100/70 disabled:text-slate-600 disabled:cursor-not-allowed" 
                value={weeks.find(w => w.id === selectedWeek)?.endDate || ''}
                onChange={(e) => canEdit && saveToFirebase(selectedWeek, { endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Nhà cung cấp/Bếp ăn</label>
              <select 
                disabled={!canEdit}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white disabled:bg-slate-100/70 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                <option>Bếp ăn trường Duy Tân</option>
                <option>Công ty cung cấp suất ăn A</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <h4 className="font-bold text-slate-800 uppercase text-sm">Chi tiết thực đơn các ngày</h4>
            </div>
            
            <div className="space-y-4">
              {days.map((day, idx) => {
                const dayMenu = menus.find(m => m.day === day) || { day, dishes: ['', ''] };
                const dayIdx = menus.findIndex(m => m.day === day);
                return (
                  <div key={idx} className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:border-amber-300 transition-colors">
                    <div className="w-24 h-10 mt-1 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-100">{day}</div>
                    <div className="flex-1 w-full space-y-2">
                       {canEdit ? (
                         <>
                           {dayMenu.dishes.map((dish, dishIdx) => (
                             <div key={dishIdx} className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  placeholder={`Món ${dishIdx + 1} (Ví dụ: Cơm trắng, Canh chua)`}
                                  value={dish}
                                  onChange={(e) => {
                                    const newMenus = [...menus];
                                    newMenus[dayIdx].dishes[dishIdx] = e.target.value;
                                    setMenus(newMenus);
                                  }}
                                  onBlur={() => saveToFirebase(selectedWeek, { menus })}
                                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium text-slate-700"
                                />
                                <button 
                                  onClick={() => {
                                    const newMenus = [...menus];
                                    newMenus[dayIdx].dishes.splice(dishIdx, 1);
                                    setMenus(newMenus);
                                    saveToFirebase(selectedWeek, { menus: newMenus });
                                  }}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                           ))}
                           <button 
                             onClick={() => {
                               const newMenus = [...menus];
                               newMenus[dayIdx].dishes.push('');
                               setMenus(newMenus);
                               saveToFirebase(selectedWeek, { menus: newMenus });
                             }}
                             className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1"
                           >
                             <Plus className="w-4 h-4" /> Thêm món
                           </button>
                         </>
                       ) : (
                         <div className="py-1">
                           {dayMenu.dishes.filter(d => d && d.trim()).length > 0 ? (
                             <div className="flex flex-wrap gap-2">
                               {dayMenu.dishes.filter(d => d && d.trim()).map((dish, dishIdx) => (
                                 <span 
                                   key={dishIdx} 
                                   className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs"
                                 >
                                   <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shrink-0"></span>
                                   {dish}
                                 </span>
                               ))}
                             </div>
                           ) : (
                             <p className="text-sm text-slate-400 italic py-1.5">Chưa cập nhật món ăn cho ngày này</p>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
