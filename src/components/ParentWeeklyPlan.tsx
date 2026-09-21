import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { generateSchoolWeeks, getCurrentSchoolWeek } from '../lib/schoolWeekUtils';

export default function ParentWeeklyPlan({ classId, schoolYearName }: { classId: string, schoolYearName?: string }) {
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

  // Tính tuần học thực tế của trường
  const realtimeCurrentWeek = getCurrentSchoolWeek(schoolYearName);
  const [selectedWeek, setSelectedWeek] = useState(() => realtimeCurrentWeek);

  useEffect(() => {
    if (!classId) return;
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
            dutyTeam: weekData.dutyTeam || '',
            tasks: weekData.tasks || [],
            dateRangeFormatted: `${stdWeek.startFormatted} - ${stdWeek.endFormatted}`
          };
        }
        
        return {
          id: weekId,
          name: `Tuần ${weekId}`,
          status: 'empty' as const,
          startDate: stdWeek.startDate,
          endDate: stdWeek.endDate,
          dutyTeam: '',
          tasks: [],
          dateRangeFormatted: `${stdWeek.startFormatted} - ${stdWeek.endFormatted}`
        };
      });
      
      setWeeks(newWeeks);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId, schoolYearName]);
  const activeWeek = weeks.find(w => w.id === selectedWeek) || weeks[0];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-12">
      <div className="flex-1 p-0 sm:p-2 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 max-w-6xl mx-auto h-full">
          
          {/* Mobile Horizontal Week Selector (md:hidden) */}
          <div className="md:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0f766e]" /> Chọn Tuần
              </span>
              <span className="text-xs text-[#0f766e] font-semibold">Đang xem {activeWeek?.name}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
              {weeks.map(week => {
                const isRealCurrent = week.id === realtimeCurrentWeek;
                return (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all flex flex-col items-center gap-0.5 ${
                      selectedWeek === week.id 
                        ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-sm font-bold' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{week.name}</span>
                    </div>
                    {week.dateRangeFormatted && (
                      <span className={`text-[10px] ${selectedWeek === week.id ? 'text-teal-100' : 'text-slate-400'}`}>
                        {week.dateRangeFormatted}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Sidebar (hidden md:flex) */}
          <div className="hidden md:flex md:w-64 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col h-[520px] shrink-0">
            <div className="p-4 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-teal-100/40">
              <h3 className="font-bold text-teal-900 font-display flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#0f766e]" />
                Danh sách Tuần
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {weeks.map(week => {
                const isRealCurrent = week.id === realtimeCurrentWeek;
                return (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-colors ${
                      selectedWeek === week.id 
                        ? 'bg-[#0f766e] text-white shadow-sm font-semibold' 
                        : 'hover:bg-teal-50/50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{week.name}</span>
                      </div>
                      {week.dateRangeFormatted && (
                        <div className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-100' : 'text-slate-400'}`}>
                          {week.dateRangeFormatted}
                        </div>
                      )}
                    </div>
                    {week.status === 'approved' && (
                      <CheckCircle className={`w-4 h-4 shrink-0 ${selectedWeek === week.id ? 'text-teal-200' : 'text-teal-600'}`} />
                    )}
                    {week.status === 'draft' && (
                      <Clock className={`w-4 h-4 shrink-0 ${selectedWeek === week.id ? 'text-teal-200' : 'text-amber-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 mb-1">{activeWeek?.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500">Từ ngày {formatDate(activeWeek?.startDate)} đến {formatDate(activeWeek?.endDate)}</p>
              </div>
              <div className="self-start sm:self-auto flex items-center gap-2">
                {activeWeek?.status === 'approved' && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Đã duyệt
                  </span>
                )}
                {activeWeek?.status === 'draft' && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Đang soạn thảo
                  </span>
                )}
                {activeWeek?.status === 'empty' && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                    Chưa có nội dung
                  </span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-2">Trực ban (Nếu có)</label>
              <div className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm min-h-[44px] flex items-center">
                {activeWeek?.dutyTeam || 'Không có thông tin trực ban'}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-2">Công việc trọng tâm trong tuần</label>
              {activeWeek?.tasks?.length === 0 ? (
                <div className="p-6 sm:p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-xs sm:text-sm">
                  Chưa có công việc trọng tâm nào được lưu cho tuần này.
                </div>
              ) : (
                activeWeek?.tasks?.map((task, idx) => (
                  <div key={idx} className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-teal-200 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ccfbf1] text-[#0f766e] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 font-medium text-slate-700 text-xs sm:text-sm pt-0.5 sm:pt-1">
                      {task}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
