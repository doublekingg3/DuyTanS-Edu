import React, { useState, useEffect } from 'react';
import { ClassSchedule, SchedulePeriod } from '../data';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Calendar, Sun, Sunset, Coffee } from 'lucide-react';
import { normalizePeriodTime } from '../lib/scheduleConstants';

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
        <div className="w-8 h-8 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!schedule || !schedule.periods || schedule.periods.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#ccfbf1] rounded-full flex items-center justify-center mb-4 border border-[#5eead4]">
          <Calendar className="w-8 h-8 text-[#0f766e]" />
        </div>
        <h3 className="text-xl font-bold font-display text-slate-800 mb-2">Chưa có thời khoá biểu</h3>
        <p className="text-slate-500 text-sm">Nhà trường hoặc giáo viên chưa cập nhật thời khoá biểu cho lớp.</p>
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

  // Group into morning & afternoon
  const morningList: { period: SchedulePeriod; originalIdx: number; norm: ReturnType<typeof normalizePeriodTime> }[] = [];
  const afternoonList: { period: SchedulePeriod; originalIdx: number; norm: ReturnType<typeof normalizePeriodTime> }[] = [];

  schedule.periods.forEach((p, idx) => {
    const norm = normalizePeriodTime(p.time, idx, schedule.periods.length);
    if (norm.session === 'morning') {
      morningList.push({ period: p, originalIdx: idx, norm });
    } else {
      afternoonList.push({ period: p, originalIdx: idx, norm });
    }
  });

  return (
    <div className="pb-20 md:pb-0 space-y-4">
      {/* Desktop/Tablet View (Table styled with the Class List Teal theme) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-[#0f766e] text-white font-semibold">
              <tr>
                <th className="px-4 py-3.5 text-white font-semibold w-52 whitespace-nowrap border-r border-teal-600/40 text-center">
                  TIẾT / THỜI GIAN
                </th>
                {days.map(day => (
                  <th key={day.key} className="px-4 py-3.5 text-white font-semibold text-center border-r border-teal-600/40 last:border-0 min-w-[120px]">
                    {day.label.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 1. SÁNG HEADER */}
              <tr className="bg-gradient-to-r from-teal-50 via-emerald-50/60 to-teal-50/30 border-y border-teal-200">
                <td colSpan={7} className="px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                        <Sun className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-teal-900 text-xs sm:text-sm tracking-wide uppercase">
                        BUỔI SÁNG
                      </span>
                      <span className="text-teal-700 text-xs font-semibold">
                        (7:30 - 11:00)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                      4 Tiết học • Ra chơi 9:05 - 9:25
                    </span>
                  </div>
                </td>
              </tr>

              {/* SÁNG PERIODS */}
              {morningList.map(({ period, originalIdx, norm }) => {
                if (norm.isBreak) {
                  return (
                    <tr key={`morning-break-${originalIdx}`} className="bg-amber-50/80 border-y border-amber-200/90 text-amber-900">
                      <td className="px-4 py-2.5 font-bold text-xs text-amber-800 border-r border-amber-200/70 bg-amber-100/50">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <div className="font-bold text-amber-900">{norm.name}</div>
                            <div className="font-mono text-[11px] text-amber-700 font-semibold">{norm.timeRange}</div>
                          </div>
                        </div>
                      </td>
                      <td colSpan={6} className="px-4 py-2 text-center text-xs font-semibold text-amber-800 italic">
                        ☕ Ra chơi & Thư giãn giữa các tiết học sáng (20 phút)
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`morning-${originalIdx}`} className="hover:bg-teal-50/40 transition-colors border-b border-teal-100/60">
                    <td className="px-4 py-3 border-r border-teal-100 bg-teal-50/20">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{norm.name}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-teal-200 text-teal-900 text-[11px] font-mono font-bold rounded-md shadow-2xs w-fit">
                          {norm.timeRange}
                        </span>
                      </div>
                    </td>
                    {days.map(day => {
                      const cellVal = String(period[day.key as keyof SchedulePeriod] || '').trim();
                      return (
                        <td key={day.key} className="px-3.5 py-2.5 border-r border-teal-100/70 last:border-0 text-center align-middle">
                          {cellVal ? (
                            <div className="inline-block px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-950 font-bold text-xs sm:text-sm shadow-2xs">
                              {cellVal}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* 2. NGHỈ TRƯA */}
              <tr className="bg-[#0f766e] text-white shadow-xs border-y-2 border-teal-800 select-none">
                <td colSpan={7} className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse shrink-0"></span>
                    <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                      NGHỈ TRƯA 11:00 - 13:15
                    </span>
                  </div>
                </td>
              </tr>

              {/* 3. CHIỀU HEADER */}
              <tr className="bg-gradient-to-r from-teal-50 via-cyan-50/60 to-teal-50/30 border-y border-teal-200">
                <td colSpan={7} className="px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Sunset className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-teal-900 text-xs sm:text-sm tracking-wide uppercase">
                        BUỔI CHIỀU
                      </span>
                      <span className="text-teal-700 text-xs font-semibold">
                        (13:15 - 16:40)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                      4 Tiết học • Ra chơi 14:48 - 15:08
                    </span>
                  </div>
                </td>
              </tr>

              {/* CHIỀU PERIODS */}
              {afternoonList.map(({ period, originalIdx, norm }) => {
                if (norm.isBreak) {
                  return (
                    <tr key={`afternoon-break-${originalIdx}`} className="bg-amber-50/80 border-y border-amber-200/90 text-amber-900">
                      <td className="px-4 py-2.5 font-bold text-xs text-amber-800 border-r border-amber-200/70 bg-amber-100/50">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <div className="font-bold text-amber-900">{norm.name}</div>
                            <div className="font-mono text-[11px] text-amber-700 font-semibold">{norm.timeRange}</div>
                          </div>
                        </div>
                      </td>
                      <td colSpan={6} className="px-4 py-2 text-center text-xs font-semibold text-amber-800 italic">
                        ☕ Ra chơi & Thư giãn giữa các tiết học chiều (20 phút)
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`afternoon-${originalIdx}`} className="hover:bg-teal-50/40 transition-colors border-b border-teal-100/60">
                    <td className="px-4 py-3 border-r border-teal-100 bg-teal-50/20">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{norm.name}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-teal-200 text-teal-900 text-[11px] font-mono font-bold rounded-md shadow-2xs w-fit">
                          {norm.timeRange}
                        </span>
                      </div>
                    </td>
                    {days.map(day => {
                      const cellVal = String(period[day.key as keyof SchedulePeriod] || '').trim();
                      return (
                        <td key={day.key} className="px-3.5 py-2.5 border-r border-teal-100/70 last:border-0 text-center align-middle">
                          {cellVal ? (
                            <div className="inline-block px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-950 font-bold text-xs sm:text-sm shadow-2xs">
                              {cellVal}
                            </div>
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

      {/* Mobile View (Cards grouped with Morning & Afternoon & Break Time) */}
      <div className="md:hidden space-y-4">
        {days.map(day => {
          const dayPeriods = schedule.periods.filter(p => p[day.key as keyof SchedulePeriod] && String(p[day.key as keyof SchedulePeriod]).trim() !== '');
          if (dayPeriods.length === 0) return null;

          const morningDay = morningList.filter(m => (m.period[day.key as keyof SchedulePeriod] && String(m.period[day.key as keyof SchedulePeriod]).trim() !== '') || m.norm.isBreak);
          const afternoonDay = afternoonList.filter(a => (a.period[day.key as keyof SchedulePeriod] && String(a.period[day.key as keyof SchedulePeriod]).trim() !== '') || a.norm.isBreak);

          return (
            <div key={day.key} className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
              <div className="bg-[#0f766e] px-4 py-3 flex items-center justify-between text-white">
                <h3 className="font-bold font-display text-base text-white">{day.label}</h3>
                <span className="text-xs text-teal-100">Thời khóa biểu</span>
              </div>
              
              <div className="p-3 space-y-3">
                {morningDay.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-teal-900 text-xs uppercase tracking-wider">
                        Buổi Sáng (7:30 - 11:00)
                      </h4>
                    </div>
                    <div className="space-y-2 bg-slate-50/60 rounded-xl p-2 border border-teal-100/60">
                      {morningDay.map(({ period, originalIdx, norm }) => {
                        if (norm.isBreak) {
                          return (
                            <div key={norm.id} className="p-2.5 bg-amber-50 rounded-lg text-amber-800 flex items-center gap-2 text-sm font-bold border border-amber-200">
                              <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Ra chơi: 9:05 - 9:25 (20 phút)</span>
                            </div>
                          );
                        }
                        const cellVal = String(period[day.key as keyof SchedulePeriod] || '').trim();
                        if (!cellVal) return null;

                        return (
                          <div key={originalIdx} className="bg-white rounded-xl p-3 flex items-center justify-between gap-3 border border-teal-100 shadow-2xs">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-[14px]">{norm.name}</span>
                              <span className="text-[14px] font-mono font-bold text-teal-700">{norm.timeRange}</span>
                            </div>
                            <div className="font-bold text-teal-950 text-[14px] bg-[#ccfbf1] px-3 py-1.5 rounded-lg border border-[#5eead4] shadow-2xs">
                              {cellVal}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sáng - Chiều Divider on Mobile */}
                <div className="bg-[#0f766e] text-white p-2.5 rounded-xl text-center text-[14px] font-extrabold tracking-wide flex items-center justify-center gap-2 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse shrink-0"></span>
                  <span>NGHỈ TRƯA 11:00 - 13:15</span>
                </div>

                {afternoonDay.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <Sunset className="w-4 h-4 text-blue-500" />
                      <h4 className="font-bold text-teal-900 text-xs uppercase tracking-wider">
                        Buổi Chiều (13:15 - 16:40)
                      </h4>
                    </div>
                    <div className="space-y-2 bg-slate-50/60 rounded-xl p-2 border border-teal-100/60">
                      {afternoonDay.map(({ period, originalIdx, norm }) => {
                        if (norm.isBreak) {
                          return (
                            <div key={norm.id} className="p-2.5 bg-amber-50 rounded-lg text-amber-800 flex items-center gap-2 text-sm font-bold border border-amber-200">
                              <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Ra chơi: 14:48 - 15:08 (20 phút)</span>
                            </div>
                          );
                        }
                        const cellVal = String(period[day.key as keyof SchedulePeriod] || '').trim();
                        if (!cellVal) return null;

                        return (
                          <div key={originalIdx} className="bg-white rounded-xl p-3 flex items-center justify-between gap-3 border border-teal-100 shadow-2xs">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-[14px]">{norm.name}</span>
                              <span className="text-[14px] font-mono font-bold text-teal-700">{norm.timeRange}</span>
                            </div>
                            <div className="font-bold text-teal-950 text-[14px] bg-[#ccfbf1] px-3 py-1.5 rounded-lg border border-[#5eead4] shadow-2xs">
                              {cellVal}
                            </div>
                          </div>
                        );
                      })}
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
