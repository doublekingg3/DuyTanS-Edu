import React, { useState, useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, FileText, Download, Save, Trash2, Plus, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { exportWeeklyPlanToDocx } from '../lib/docxExport';
import { exportCumulativePlanToDocx } from '../lib/docxCumulativeExport';
import { generateSchoolWeeks, getCurrentSchoolWeek } from '../lib/schoolWeekUtils';

export default function TeacherWeeklyPlan({ classId, role, className, schoolYearName, teacherName }: { classId: string, role?: string, className?: string, schoolYearName?: string, teacherName?: string }) {
  const { showAlert, showConfirm } = useAlert();
  
  const [weeks, setWeeks] = useState<{
    id: number;
    name: string;
    status: 'empty' | 'draft' | 'approved';
    startDate: string;
    endDate: string;
    dutyTeam: string;
    tasks: string[];
    dateRangeFormatted?: string;
  }[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Tính tuần thực tế theo lịch trường (17/08 - 21/08...)
  const realtimeCurrentWeek = getCurrentSchoolWeek(schoolYearName);
  const [selectedWeek, setSelectedWeek] = useState(() => realtimeCurrentWeek);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const docRef = doc(db, 'class_weekly_plans', classId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      const standardWeeks = generateSchoolWeeks(schoolYearName, 42);
      
      const newWeeks = standardWeeks.map((stdWeek) => {
        const weekId = stdWeek.id;
        const weekData = data?.weeks?.[weekId];
        
        if (weekData) {
          return {
            id: weekId,
            name: `Tuần ${weekId}`,
            status: weekData.status || 'empty',
            startDate: weekData.startDate || stdWeek.startDate,
            endDate: weekData.endDate || stdWeek.endDate,
            dutyTeam: weekData.dutyTeam || 'Tổ 1',
            tasks: weekData.tasks || [],
            dateRangeFormatted: `${stdWeek.startFormatted} - ${stdWeek.endFormatted}`
          };
        }
        
        // Mặc định chuẩn thời gian thực từ Thứ 2 đến Thứ 6
        return {
          id: weekId,
          name: `Tuần ${weekId}`,
          status: 'empty' as const,
          startDate: stdWeek.startDate,
          endDate: stdWeek.endDate,
          dutyTeam: 'Tổ 1',
          tasks: [],
          dateRangeFormatted: `${stdWeek.startFormatted} - ${stdWeek.endFormatted}`
        };
      });
      
      setWeeks(newWeeks);
      setLoading(false);
    }, (err) => {
      console.error("Weekly plan snapshot error:", err);
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
  
  const [newTask, setNewTask] = useState('');
  const currentWeekData = weeks.find(w => w.id === selectedWeek);
  
  const [localTasks, setLocalTasks] = useState<string[]>([]);
  useEffect(() => {
    setLocalTasks(currentWeekData?.tasks || []);
  }, [currentWeekData?.tasks]);

  if (!classId) {
    return (
      <div className="p-8 h-full bg-[#f0fdfa]/30 flex flex-col items-center justify-center text-slate-500 gap-3">
        <CalendarIcon className="w-12 h-12 text-teal-600/50" />
        <p className="text-base font-semibold text-slate-700">Chưa chọn lớp học</p>
        <p className="text-sm text-slate-500">Vui lòng chọn một lớp học ở thanh công cụ phía trên để xem và biên soạn kế hoạch tuần.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">Đang tải kế hoạch tuần...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 overflow-y-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">Năm học {schoolYearName || '2024 - 2025'} • Lớp {className || 'Chưa chọn lớp'}</span>
            <span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-medium border border-indigo-100">Đã duyệt: {weeks.filter(w => w.status === 'approved').length} / 42 tuần</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Kế Hoạch Chủ Nhiệm Theo Tuần
          </h2>
          <p className="text-slate-500 mt-1">Biên soạn công tác nề nếp, phân công tổ trực nhật và theo dõi phê duyệt của Ban Giám Hiệu</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => {
              const approvedWeeks = weeks.filter(w => w.status === 'approved');
              exportCumulativePlanToDocx(className || 'Chưa rõ', schoolYearName || '2024-2025', approvedWeeks, teacherName || '');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            <FileText className="w-4 h-4" /> Tải Sổ lũy kế ({weeks.filter(w => w.status === 'approved').length}/42)
          </button>
          <button 
            onClick={() => exportWeeklyPlanToDocx(className || 'Chưa rõ', schoolYearName || '2024-2025', currentWeekData, teacherName || '')}
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
            {weeks.map(week => {
              const isRealCurrent = week.id === realtimeCurrentWeek;
              return (
                <button 
                  key={week.id}
                  onClick={() => setSelectedWeek(week.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[105px] px-3 py-2 rounded-xl border transition-all relative ${
                    selectedWeek === week.id 
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 hover:border-teal-400 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{week.name}</span>
                  </div>
                  {week.dateRangeFormatted && (
                    <span className={`text-[11px] font-medium mt-0.5 ${selectedWeek === week.id ? 'text-teal-100' : 'text-slate-500'}`}>
                      {week.dateRangeFormatted}
                    </span>
                  )}
                  {week.status === 'approved' && <span className={`text-[11px] font-semibold mt-0.5 ${selectedWeek === week.id ? 'text-teal-100' : 'text-emerald-600'}`}>✓ Đã duyệt</span>}
                  {week.status === 'draft' && <span className={`text-[11px] font-semibold mt-0.5 ${selectedWeek === week.id ? 'text-amber-200' : 'text-amber-600'}`}>Bản nháp</span>}
                  {week.status === 'empty' && <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-200' : 'text-slate-400'}`}>Chưa lập</span>}
                </button>
              );
            })}
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
