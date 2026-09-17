import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAlert } from '../contexts/AlertContext';
import { Utensils, CheckCircle, ChevronLeft, ChevronRight, Download, Save, Plus, Trash2, Upload, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function TeacherLunchMenu({ classId, role, schoolYearName }: { classId: string, role?: string, schoolYearName?: string }) {
  const [weeks, setWeeks] = useState<{id: number, name: string, status: string, startDate?: string, endDate?: string}[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(5);
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<{day: string, dishes: string[]}[]>([]);

  useEffect(() => {
    // We use a global document for lunch menus for the whole school
    const docRef = doc(db, 'lunch_menus', 'general');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      
      const startYearStr = schoolYearName ? schoolYearName.match(/\d{4}/)?.[0] : null;
      const startYear = startYearStr ? parseInt(startYearStr) : new Date().getFullYear();
      const baseDate = new Date(startYear, 8, 5); // 5th Sept

      const newWeeks = Array.from({ length: 42 }, (_, i) => {
        const weekId = i + 1;
        const weekData = data?.weeks?.[weekId];
        
        const sDate = new Date(baseDate);
        sDate.setDate(sDate.getDate() + (i * 7));
        const eDate = new Date(sDate);
        eDate.setDate(eDate.getDate() + 5);
        
        return {
          id: weekId,
          name: `Tuần ${weekId}`,
          status: weekData?.status || 'empty',
          startDate: weekData?.startDate || sDate.toISOString().split('T')[0],
          endDate: weekData?.endDate || eDate.toISOString().split('T')[0]
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
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn duyệt thực đơn tuần ${selectedWeek} không?`);
    if (confirmed) {
      await saveToFirebase(selectedWeek, { status: 'approved' });
      showAlert('Duyệt thực đơn thành công! Áp dụng cho toàn bộ các lớp.', 'success');
    }
  };

  const handleSaveDraft = async () => {
    await saveToFirebase(selectedWeek, { status: 'draft', menus });
    showAlert('Đã lưu nháp thực đơn', 'success');
  };

  const handleCancelApprove = async () => {
    const confirmed = await showConfirm('Bạn có chắc chắn muốn hủy duyệt thực đơn tuần này không?');
    if (confirmed) {
      await saveToFirebase(selectedWeek, { status: 'draft' });
      showAlert('Đã hủy duyệt thực đơn.', 'success');
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
  

  const handleDownloadTemplate = () => {
    const templateData = [
      ['Thứ', 'Món 1', 'Món 2', 'Món 3', 'Món 4'],
      ['Thứ 2', '', '', '', ''],
      ['Thứ 3', '', '', '', ''],
      ['Thứ 4', '', '', '', ''],
      ['Thứ 5', '', '', '', ''],
      ['Thứ 6', '', '', '', ''],
      ['Thứ 7', '', '', '', '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ThucDon");
    XLSX.writeFile(wb, "Mau_ThucDon.xlsx");
  };

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length > 1) {
          const newMenus = days.map(day => ({ day, dishes: ['', ''] }));
          data.slice(1).forEach((row: any) => {
            const day = row[0];
            if (day) {
              const dayMenu = newMenus.find(m => m.day === day);
              if (dayMenu) {
                 const dishes = [];
                 for (let i = 1; i < row.length; i++) {
                   if (row[i]) dishes.push(row[i].toString());
                 }
                 if (dishes.length === 0) dishes.push('', '');
                 else if (dishes.length === 1) dishes.push('');
                 dayMenu.dishes = dishes;
              }
            }
          });
          setMenus(newMenus);
          showAlert('Nhập dữ liệu thành công!', 'success');
        }
      } catch (error) {
        showAlert('Lỗi khi đọc file', 'error');
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
    <div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          
          <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-500" />
            Thực Đơn Ăn Trưa Theo Tuần
          </h2>
          <p className="text-slate-500 mt-1">Lên thực đơn dinh dưỡng hàng ngày cho toàn bộ học sinh bán trú của trường (áp dụng chung tất cả các lớp)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Tải mẫu
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-amber-500 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Upload mẫu
            <input type="file" ref={fileInputRef} onChange={handleUploadTemplate} accept=".xlsx, .xls, .csv" className="hidden" />
          </label>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Chọn tuần áp dụng</h3>
        <div className="flex items-center gap-2">
          <button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
            {weeks.map(week => (
              <button 
                key={week.id}
                onClick={() => setSelectedWeek(week.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-24 py-2 rounded-xl border transition-all ${selectedWeek === week.id ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-white border-slate-200 hover:border-amber-400'}`}
              >
                <span className="font-bold text-sm">{week.name}</span>
                {week.status === 'approved' && <span className={`text-xs mt-1 ${selectedWeek === week.id ? 'text-amber-100' : 'text-emerald-600'}`}>✓ Đã duyệt</span>}
                {week.status === 'draft' && <span className={`text-xs mt-1 ${selectedWeek === week.id ? 'text-amber-100' : 'text-amber-500'}`}>Bản nháp</span>}
                {week.status === 'empty' && <span className={`text-xs mt-1 ${selectedWeek === week.id ? 'text-amber-100' : 'text-slate-400'}`}>Chưa lên món</span>}
              </button>
            ))}
          </div>
          <button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Utensils className="w-5 h-5 text-amber-600" /></div>
            <h3 className="text-xl font-bold font-display text-slate-800">Thực Đơn Tuần {selectedWeek}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'teacher'} title={role === 'teacher' ? 'Chỉ Giáo vụ hoặc Admin mới có quyền duyệt' : ''}>
              <CheckCircle className="w-4 h-4" /> Duyệt thực đơn
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày (Bắt đầu)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.startDate || ''}
                onChange={(e) => saveToFirebase(selectedWeek, { startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày (Kết thúc)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.endDate || ''}
                onChange={(e) => saveToFirebase(selectedWeek, { endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Nhà cung cấp/Bếp ăn</label>
              <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white">
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
