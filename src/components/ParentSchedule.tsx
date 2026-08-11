import React, { useState, useEffect } from 'react';
import { ClassSchedule, SchedulePeriod } from '../data';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Calendar } from 'lucide-react';

export default function ParentSchedule({ classId }: { classId: string }) {
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!schedule || schedule.periods.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có thời khoá biểu</h3>
        <p className="text-slate-500">Giáo viên chủ nhiệm chưa cập nhật thời khoá biểu cho lớp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((dayStr, dayIdx) => {
        const dayKey = `t${dayIdx + 2}` as keyof SchedulePeriod;
        const hasClasses = schedule.periods.some(p => p[dayKey] && String(p[dayKey]).trim() !== '');
        if (!hasClasses) return null;
        
        return (
          <div key={dayStr} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-indigo-50/50 px-5 py-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-indigo-700">{dayStr}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {schedule.periods.map((period, idx) => {
                const cellValue = period[dayKey];
                if (!cellValue || String(cellValue).trim() === '') return null;
                
                return (
                  <div key={idx} className="p-4 sm:px-5 flex gap-4 items-start">
                    <div className="shrink-0 w-20">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                        {period.time.split('(')[0]?.trim() || period.time}
                      </span>
                      {period.time.includes('(') && (
                        <div className="text-[10px] text-slate-400 mt-1 font-medium px-1">
                          {period.time.substring(period.time.indexOf('(')).replace(/[()]/g, '')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">{cellValue}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
