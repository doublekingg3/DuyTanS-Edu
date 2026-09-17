import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function ParentWeeklyPlan({ classId, schoolYearName }: { classId: string, schoolYearName?: string }) {
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
      const baseDate = new Date(`${startYear}-09-05`);
      
      const day = baseDate.getDay();
      const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
      baseDate.setDate(diff);

      const newWeeks = Array.from({ length: 35 }, (_, i) => {
        const weekId = i + 1;
        const weekData = data?.weeks?.[weekId];
        
        if (weekData) {
          return {
            id: weekId,
            name: `Tuần ${weekId}`,
            status: weekData.status || 'empty',
            startDate: weekData.startDate || '',
            endDate: weekData.endDate || '',
            dutyTeam: weekData.dutyTeam || '',
            tasks: weekData.tasks || []
          };
        }
        
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
          dutyTeam: '',
          tasks: []
        };
      });
      
      setWeeks(newWeeks as any);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId, schoolYearName]);

  const [selectedWeek, setSelectedWeek] = useState(1);
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
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto h-full">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px] shrink-0">
            <div className="p-4 border-b border-slate-100 bg-teal-50">
              <h3 className="font-bold text-teal-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Danh sách Tuần
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {weeks.map(week => (
                <button
                  key={week.id}
                  onClick={() => setSelectedWeek(week.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center justify-between transition-colors ${selectedWeek === week.id ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <span className="font-medium">{week.name}</span>
                  {week.status === 'approved' && <CheckCircle className={`w-4 h-4 ${selectedWeek === week.id ? 'text-white' : 'text-teal-500'}`} />}
                  {week.status === 'draft' && <Clock className={`w-4 h-4 ${selectedWeek === week.id ? 'text-teal-200' : 'text-amber-500'}`} />}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display text-slate-800 mb-1">{activeWeek?.name}</h2>
                <p className="text-slate-500">Từ ngày {formatDate(activeWeek?.startDate)} đến {formatDate(activeWeek?.endDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeWeek?.status === 'approved' && (
                  <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-200 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Đã duyệt
                  </span>
                )}
                {activeWeek?.status === 'draft' && (
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Đang soạn thảo
                  </span>
                )}
                {activeWeek?.status === 'empty' && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                    Chưa có nội dung
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Trực ban (Nếu có)</label>
              <div className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 min-h-[48px]">
                {activeWeek?.dutyTeam || 'Không có thông tin trực ban'}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Công việc trọng tâm trong tuần</label>
              {activeWeek?.tasks?.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-500">
                  Chưa có công việc trọng tâm nào được lưu.
                </div>
              ) : (
                activeWeek?.tasks?.map((task, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 font-medium text-slate-700 pt-1">
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
