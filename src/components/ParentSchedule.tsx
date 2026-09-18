import React, { useState, useEffect } from 'react';
import { ClassSchedule, SchedulePeriod } from '../data';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Calendar, Sun, Moon } from 'lucide-react';

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
      <div className="p-8 h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!schedule || schedule.periods.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-xl font-bold font-display text-slate-800 mb-2">Chưa có thời khoá biểu</h3>
        <p className="text-slate-500">Giáo viên chủ nhiệm chưa cập nhật thời khoá biểu cho lớp.</p>
      </div>
    );
  }

  const days = [
    { key: 't2', label: 'Thứ 2' },
    { key: 't3', label: 'Thứ 3' },
    { key: 't4', label: 'Thứ 4' },
    { key: 't5', label: 'Thứ 5' },
    { key: 't6', label: 'Thứ 6' },
    { key: 't7', label: 'Thứ 7' },
  ];

  // Lọc ra các ngày có tiết học (để ẩn Thứ 7 nếu không có học)
  const activeDays = days.filter(day => 
    schedule.periods.some(p => p[day.key as keyof SchedulePeriod] && String(p[day.key as keyof SchedulePeriod]).trim() !== '')
  );

  return (
    <div className="pb-20 md:pb-0">
      {/* Desktop/Tablet View (Horizontal Table) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-4 font-bold text-slate-700 w-32 border-r border-slate-200 text-center">Tiết / Thời gian</th>
                {activeDays.map(day => (
                  <th key={day.key} className="px-4 py-4 font-bold text-slate-700 text-center border-r border-slate-200 last:border-0">{day.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.periods.map((period, idx) => {
                const isMorning = period.time.toLowerCase().includes('sáng');
                const isAfternoon = period.time.toLowerCase().includes('chiều');
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 border-r border-slate-200 bg-slate-50/30">
                      <div className="flex flex-col items-center text-center">
                        <span className="font-semibold text-slate-800 text-sm">
                          {period.time.split('(')[0]?.trim() || period.time}
                        </span>
                        {period.time.includes('(') && (
                          <span className="text-xs text-slate-500 mt-1 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                            {period.time.substring(period.time.indexOf('(')).replace(/[()]/g, '')}
                          </span>
                        )}
                      </div>
                    </td>
                    {activeDays.map(day => {
                      const cellValue = String(period[day.key as keyof SchedulePeriod] || '').trim();
                      return (
                        <td key={day.key} className="px-4 py-4 border-r border-slate-200 last:border-0 text-center align-middle">
                          {cellValue ? (
                            <div className="font-bold text-teal-800 text-base">{cellValue}</div>
                          ) : (
                            <span className="text-slate-300">-</span>
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
      </div>

      {/* Mobile View (Vertical Cards) */}
      <div className="md:hidden space-y-6">
        {activeDays.map(day => {
          const dayPeriods = schedule.periods.filter(p => p[day.key as keyof SchedulePeriod] && String(p[day.key as keyof SchedulePeriod]).trim() !== '');
          if (dayPeriods.length === 0) return null;

          const morningPeriods = dayPeriods.filter(p => p.time.toLowerCase().includes('sáng') || p.time.toLowerCase().includes('s-t') || !p.time.toLowerCase().includes('chiều'));
          const afternoonPeriods = dayPeriods.filter(p => p.time.toLowerCase().includes('chiều') || p.time.toLowerCase().includes('c-t'));

          return (
            <div key={day.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f766e] to-[#0d9488] px-5 py-3.5">
                <h3 className="text-lg font-bold font-display text-white text-center">{day.label}</h3>
              </div>
              
              <div className="p-4 space-y-5">
                {morningPeriods.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold font-display text-slate-800 text-base">Buổi Sáng</h4>
                    </div>
                    <div className="space-y-2.5">
                      {morningPeriods.map((period, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3.5 border border-slate-100">
                          <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 bg-white rounded-xl shadow-2xs border border-slate-200">
                            <span className="font-bold text-slate-800 text-xs">
                              {period.time.split('(')[0]?.replace(/Sáng|Chiều|-/gi, '')?.trim() || `T${idx+1}`}
                            </span>
                            {period.time.includes('(') && (
                              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {period.time.substring(period.time.indexOf('(')).replace(/[()]/g, '')}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-bold font-display text-teal-800 uppercase tracking-tight">
                              {String(period[day.key as keyof SchedulePeriod])}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonPeriods.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1 mt-3">
                      <Moon className="w-4 h-4 text-teal-600" />
                      <h4 className="font-bold font-display text-slate-800 text-base">Buổi Chiều</h4>
                    </div>
                    <div className="space-y-2.5">
                      {afternoonPeriods.map((period, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3.5 border border-slate-100">
                          <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 bg-white rounded-xl shadow-2xs border border-slate-200">
                            <span className="font-bold text-slate-800 text-xs">
                              {period.time.split('(')[0]?.replace(/Sáng|Chiều|-/gi, '')?.trim() || `T${idx+1}`}
                            </span>
                            {period.time.includes('(') && (
                              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {period.time.substring(period.time.indexOf('(')).replace(/[()]/g, '')}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-bold font-display text-teal-800 uppercase tracking-tight">
                              {String(period[day.key as keyof SchedulePeriod])}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
