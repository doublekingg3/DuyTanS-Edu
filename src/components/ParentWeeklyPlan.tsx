import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Calendar, CheckCircle, Clock, ShieldAlert, ListCheck, UserCheck } from 'lucide-react';
import { generateSchoolWeeks, getCurrentSchoolWeek } from '../lib/schoolWeekUtils';
import { useLanguage } from '../contexts/LanguageContext';

export default function ParentWeeklyPlan({ classId, schoolYearName }: { classId: string, schoolYearName?: string }) {
  const { t, isEn } = useLanguage();
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
            name: `${isEn ? 'Week' : 'Tuần'} ${weekId}`,
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
          name: `${isEn ? 'Week' : 'Tuần'} ${weekId}`,
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
  }, [classId, schoolYearName, isEn]);

  const activeWeek = weeks.find(w => w.id === selectedWeek) || weeks[0];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isEn ? 'en-US' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-12 h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-12">
      <div className="flex-1 p-0 sm:p-2 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-5 lg:gap-8 w-full max-w-7xl mx-auto h-full">
          
          {/* Mobile Horizontal Week Selector (md:hidden) */}
          <div className="md:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0f766e]" /> {t('selectWeek')}
              </span>
              <span className="text-xs text-[#0f766e] font-bold">{t('viewingWeek')} {activeWeek?.name}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {weeks.map(week => {
                return (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week.id)}
                    className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all flex flex-col items-center gap-1 cursor-pointer ${
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

          {/* Desktop Sidebar (Rộng rãi & Thoáng mát hơn) */}
          <div className="hidden md:flex md:w-72 lg:w-80 bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex-col h-[600px] lg:h-[660px] shrink-0">
            <div className="p-4 lg:p-5 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-teal-100/40 flex items-center justify-between">
              <h3 className="font-bold text-teal-900 font-display flex items-center gap-2 text-sm lg:text-base">
                <Calendar className="w-5 h-5 text-[#0f766e]" />
                {t('weekList')}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-100/80 text-teal-800 rounded-full">
                42 {isEn ? 'weeks' : 'tuần'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
              {weeks.map(week => {
                const isSelected = selectedWeek === week.id;
                return (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl lg:rounded-2xl flex items-center justify-between text-sm transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#0f766e] text-white shadow-md font-bold' 
                        : 'hover:bg-teal-50/70 text-slate-700 hover:text-teal-900'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm lg:text-base font-bold">{week.name}</span>
                        {week.id === realtimeCurrentWeek && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>
                            {isEn ? 'Current' : 'Hiện tại'}
                          </span>
                        )}
                      </div>
                      {week.dateRangeFormatted && (
                        <div className={`text-xs mt-0.5 font-medium ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {week.dateRangeFormatted}
                        </div>
                      )}
                    </div>
                    {week.status === 'approved' && (
                      <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isSelected ? 'text-teal-200' : 'text-emerald-600'}`} />
                    )}
                    {week.status === 'draft' && (
                      <Clock className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isSelected ? 'text-teal-200' : 'text-amber-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area (Nội dung tuần rộng rãi, chữ to rõ ràng) */}
          <div className="flex-1 bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Header của Tuần */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-slate-800 tracking-tight">
                      {activeWeek?.name}
                    </h2>
                    {activeWeek?.id === realtimeCurrentWeek && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {isEn ? 'Current Week' : 'Tuần Hiện Tại'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-slate-500 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    {isEn ? `From ${formatDate(activeWeek?.startDate)} to ${formatDate(activeWeek?.endDate)}` : `Từ ngày ${formatDate(activeWeek?.startDate)} đến ngày ${formatDate(activeWeek?.endDate)}`}
                  </p>
                </div>
                
                <div className="self-start sm:self-auto flex items-center gap-2">
                  {activeWeek?.status === 'approved' && (
                    <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs sm:text-sm font-bold border border-emerald-200/80 flex items-center gap-2 shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> {t('approvedStatus')}
                    </span>
                  )}
                  {activeWeek?.status === 'draft' && (
                    <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs sm:text-sm font-bold border border-amber-200/80 flex items-center gap-2 shadow-2xs">
                      <Clock className="w-4 h-4 text-amber-600" /> {t('draftStatus')}
                    </span>
                  )}
                  {activeWeek?.status === 'empty' && (
                    <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200">
                      {t('emptyStatus')}
                    </span>
                  )}
                </div>
              </div>

              {/* Phần Trực Ban */}
              <div className="mb-6 lg:mb-8">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500 font-display mb-2.5">
                  <UserCheck className="w-4 h-4 text-[#0f766e]" />
                  {t('dutyTeamLabel')}
                </label>
                <div className="w-full px-5 py-4 bg-teal-50/60 rounded-2xl border border-teal-100/90 text-slate-800 text-sm sm:text-base lg:text-lg font-semibold min-h-[52px] flex items-center gap-3 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0"></span>
                  <span>{activeWeek?.dutyTeam || (isEn ? 'No on-duty team recorded for this week' : 'Không có thông tin trực ban cho tuần này')}</span>
                </div>
              </div>

              {/* Phần Danh Sách Nhiệm Vụ Trọng Tâm */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500 font-display mb-3">
                  <ListCheck className="w-4 h-4 text-[#0f766e]" />
                  {t('keyTasksLabel')}
                </label>

                {activeWeek?.tasks?.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl lg:rounded-3xl text-slate-500 text-sm sm:text-base font-medium">
                    {t('noTasksListed')}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeWeek?.tasks?.map((task, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 lg:p-6 bg-white border border-slate-200/90 rounded-2xl lg:rounded-3xl shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all"
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-[#ccfbf1] text-[#0f766e] font-black text-sm sm:text-base lg:text-lg flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 font-medium text-slate-800 text-sm sm:text-base lg:text-lg leading-relaxed pt-1">
                          {task}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
