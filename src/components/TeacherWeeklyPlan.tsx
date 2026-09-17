import React, { useState, useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, FileText, Download, Save, Trash2, Plus, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { exportWeeklyPlanToDocx } from '../lib/docxExport';

export default function TeacherWeeklyPlan({ classId, role, className, schoolYearName }: { classId: string, role?: string, className?: string, schoolYearName?: string }) {
  const { showAlert, showConfirm } = useAlert();
  
  const [weeks, setWeeks] = useState<{
    id: number;
    name: string;
    status: 'empty' | 'draft' | 'approved';
    startDate: string;
    endDate: string;
    dutyTeam: string;
    tasks: string[];
  }[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    const docRef = doc(db, 'class_weekly_plans', classId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      
      const startYearStr = schoolYearName ? schoolYearName.match(/\d{4}/)?.[0] : null;
      const startYear = startYearStr ? parseInt(startYearStr) : new Date().getFullYear();
      const baseDate = new Date(startYear, 8, 5); // 5th Sept
      
      const newWeeks = Array.from({ length: 42 }, (_, i) => {
        const weekId = i + 1;
        const weekData = data?.weeks?.[weekId];
        
        if (weekData) {
          return {
            id: weekId,
            name: `Tuần ${weekId}`,
            status: weekData.status || 'empty',
            startDate: weekData.startDate || '',
            endDate: weekData.endDate || '',
            dutyTeam: weekData.dutyTeam || 'Tổ 1',
            tasks: weekData.tasks || []
          };
        }
        
        // Default if no data
        const sDate = new Date(baseDate);
        sDate.setDate(sDate.getDate() + (i * 7));
        const eDate = new Date(sDate);
        eDate.setDate(eDate.getDate() + 5);
        
        return {
          id: weekId,
          name: `Tuần ${weekId}`,
          status: 'empty',
          startDate: sDate.toISOString().split('T')[0],
          endDate: eDate.toISOString().split('T')[0],
          dutyTeam: 'Tổ 1',
          tasks: []
        };
      });
      
      setWeeks(newWeeks);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId, schoolYearName]);

  const saveWeekToFirebase = async (weekId: number, updateData: Partial<typeof weeks[0]>) => {
    try {
      const currentWeek = weeks.find(w => w.id === weekId);
      if (!currentWeek) return;
      const fullWeekData = { ...currentWeek, ...updateData };
      
      // Clean up for firebase
      const firebaseData = {
        status: fullWeekData.status,
        startDate: fullWeekData.startDate,
        endDate: fullWeekData.endDate,
        dutyTeam: fullWeekData.dutyTeam,
        tasks: fullWeekData.tasks
      };
      
      await setDoc(doc(db, 'class_weekly_plans', classId), {
        weeks: {
          [weekId]: firebaseData
        }
      }, { merge: true });
    } catch (e) {
      console.error(e);
      showAlert('Lỗi khi lưu dữ liệu lên server.', 'error');
    }
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [newTask, setNewTask] = useState('');
  const currentWeekData = weeks.find(w => w.id === selectedWeek);
  
  const [localTasks, setLocalTasks] = useState<string[]>([]);
  useEffect(() => {
    setLocalTasks(currentWeekData?.tasks || []);
  }, [currentWeekData?.tasks]);

  if (loading) {
    return <div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">Năm học {schoolYearName || '2024 - 2025'} • Lớp {className || 'Chưa chọn lớp'}</span>
            <span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-medium border border-indigo-100">Đã duyệt: 3 / 42 tuần</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Kế Hoạch Chủ Nhiệm Theo Tuần
          </h2>
          <p className="text-slate-500 mt-1">Biên soạn công tác nề nếp, phân công tổ trực nhật và theo dõi phê duyệt của Ban Giám Hiệu</p>
        </div>
        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            <FileText className="w-4 h-4" /> Xem Sổ lũy kế (3/42)
          </button>
          <button 
            onClick={() => exportWeeklyPlanToDocx(className || 'Chưa rõ', schoolYearName || '2024-2025', currentWeekData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
            <Download className="w-4 h-4" /> Xuất Kế hoạch Tuần {selectedWeek} (.docx)
          </button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Chọn tuần học (Năm học 42 tuần)</h3>
        <div className="flex items-center gap-2">
          <button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
            {weeks.map(week => (
              <button 
                key={week.id}
                onClick={() => setSelectedWeek(week.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-24 py-2 rounded-xl border transition-all ${selectedWeek === week.id ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-200 hover:border-teal-400'}`}
              >
                <span className="font-bold text-sm">{week.name}</span>
                {week.status === 'approved' && <span className={`text-xs mt-1 ${selectedWeek === week.id ? 'text-teal-100' : 'text-emerald-600'}`}>✓ Đã duyệt</span>}
                {week.status === 'draft' && <span className={`text-xs mt-1 ${selectedWeek === week.id ? 'text-teal-100' : 'text-amber-500'}`}>Bản nháp</span>}
                {week.status === 'empty' && <span className={`text-xs mt-1 ${selectedWeek === week.id ? 'text-teal-100' : 'text-slate-400'}`}>Chưa lập</span>}
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
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-slate-600" /></div>
            <h3 className="text-xl font-bold font-display text-slate-800">Kế Hoạch Tuần {selectedWeek}</h3>
            {currentWeekData?.status === 'draft' && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">BẢN NHÁP</span>}
          </div>
          <div className="flex items-center gap-3">
            {currentWeekData?.status !== 'approved' && (
              <button 
                onClick={async () => {
                  await saveWeekToFirebase(selectedWeek, { status: 'draft' });
                  showAlert('Đã lưu nháp kế hoạch tuần!', 'success');
                }} 
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Save className="w-4 h-4" /> Lưu nháp
              </button>
            )}

            {currentWeekData?.status !== 'approved' && (
              <button 
                onClick={async () => {
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn duyệt kế hoạch tuần này không?');
                  if (confirmed) {
                    await saveWeekToFirebase(selectedWeek, { status: 'approved' });
                    showAlert('Duyệt kế hoạch thành công!', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={role === 'staff'} 
                title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}
              >
                <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
              </button>
            )}

            {currentWeekData?.status === 'approved' && role === 'admin' && (
              <button 
                onClick={async () => {
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn hủy duyệt kế hoạch tuần này, yêu cầu Giáo viên làm lại?');
                  if (confirmed) {
                    await saveWeekToFirebase(selectedWeek, { status: 'draft' });
                    showAlert('Đã hủy duyệt kế hoạch, trạng thái chuyển về Bản nháp.', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm border border-red-200"
              >
                <X className="w-4 h-4" /> Hủy duyệt
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Tuần học số</label>
              <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">Tuần {selectedWeek}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày (Bắt đầu)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.startDate || ''}
                onChange={(e) => saveWeekToFirebase(selectedWeek, { startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày (Kết thúc)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.endDate || ''}
                onChange={(e) => saveWeekToFirebase(selectedWeek, { endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Tổ trực nhật tuần</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                value={currentWeekData?.dutyTeam || 'Tổ 1'}
                onChange={(e) => saveWeekToFirebase(selectedWeek, { dutyTeam: e.target.value })}
              >
                <option value="Tổ 1">Tổ 1</option>
                <option value="Tổ 2">Tổ 2</option>
                <option value="Tổ 3">Tổ 3</option>
                <option value="Tổ 4">Tổ 4</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <h4 className="font-bold text-slate-800 uppercase text-sm">Các nội dung công việc trong tuần ({localTasks.length} mục)</h4>
              <span className="text-xs text-slate-500">Có thể thêm, chỉnh sửa hoặc xóa từng mục</span>
            </div>
            
            <div className="space-y-3 mb-4">
              {localTasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white hover:border-indigo-300 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                  <input 
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const newTasks = [...localTasks];
                      newTasks[idx] = e.target.value;
                      setLocalTasks(newTasks);
                    }}
                    onBlur={() => {
                      saveWeekToFirebase(selectedWeek, { tasks: localTasks });
                    }}
                    className="flex-1 bg-transparent outline-none font-medium text-slate-700"
                  />
                  <button 
                    onClick={() => {
                      const newTasks = [...localTasks];
                      newTasks.splice(idx, 1);
                      saveWeekToFirebase(selectedWeek, { tasks: newTasks });
                    }}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Nhập thêm mục công việc mới (Ví dụ: Kiểm tra chuyên cần...)" 
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTask.trim()) {
                    saveWeekToFirebase(selectedWeek, { tasks: [...localTasks, newTask] });
                    setNewTask('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newTask.trim()) {
                    saveWeekToFirebase(selectedWeek, { tasks: [...localTasks, newTask] });
                    setNewTask('');
                  }
                }}
                className="px-6 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-5 h-5" /> Thêm mục
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
