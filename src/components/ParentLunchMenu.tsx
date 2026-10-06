import React, { useState, useRef, useEffect } from 'react';
import { Utensils, ChevronLeft, ChevronRight, Download, Calendar, CheckCircle2, Clock, Camera, Eye, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { generateSchoolWeeks, getCurrentSchoolWeek, getDayDateFormatted } from '../lib/schoolWeekUtils';
import { useLanguage, translateDish, translateDay } from '../contexts/LanguageContext';

interface DayMenu {
  day: string;
  dishes: string[];
  imageUrl?: string;
}

interface WeekInfo {
  id: number;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  dateRangeFormatted?: string;
  menus?: DayMenu[];
}

const defaultDishesByDay: Record<string, string[]> = {
  'Thứ 2': ['Cơm trắng, Thịt kho trứng', 'Canh bí đỏ thịt bằm', 'Tráng miệng: Dưa hấu'],
  'Thứ 3': ['Bún bò xào', 'Canh cải ngọt tôm', 'Tráng miệng: Chuối'],
  'Thứ 4': ['Cơm trắng, Gà ram sả ớt', 'Canh chua cá lóc', 'Tráng miệng: Thanh long'],
  'Thứ 5': ['Phở gà', 'Tráng miệng: Sữa chua'],
  'Thứ 6': ['Cơm chiên Dương Châu', 'Canh súp rau củ', 'Tráng miệng: Bánh flan'],
  'Thứ 7': []
};

export default function ParentLunchMenu() {
  const { t, isEn } = useLanguage();
  const realtimeCurrentWeek = getCurrentSchoolWeek();
  const [weeks, setWeeks] = useState<WeekInfo[]>(() => {
    const stdWeeks = generateSchoolWeeks(undefined, 42);
    return stdWeeks.map((w) => ({
      id: w.id,
      name: `${isEn ? 'Week' : 'Tuần'} ${w.id}`,
      status: 'empty',
      startDate: w.startDate,
      endDate: w.endDate,
      dateRangeFormatted: `${w.startFormatted} - ${w.endFormatted}`
    }));
  });
  
  const [selectedWeek, setSelectedWeek] = useState(() => realtimeCurrentWeek);
  const [firestoreMenus, setFirestoreMenus] = useState<DayMenu[]>([]);
  const [currentWeekData, setCurrentWeekData] = useState<WeekInfo | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'lunch_menus', 'general'), (docSnap) => {
      const stdWeeks = generateSchoolWeeks(undefined, 42);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firebaseWeeks = data.weeks || {};

        setWeeks(
          stdWeeks.map(stdWeek => {
            const fw = firebaseWeeks[stdWeek.id];
            return {
              id: stdWeek.id,
              name: `${isEn ? 'Week' : 'Tuần'} ${stdWeek.id}`,
              status: fw?.status || 'empty',
              startDate: fw?.startDate || stdWeek.startDate,
              endDate: fw?.endDate || stdWeek.endDate,
              dateRangeFormatted: `${stdWeek.startFormatted} - ${stdWeek.endFormatted}`,
              menus: fw?.menus
            };
          })
        );

        const current = firebaseWeeks[selectedWeek];
        if (current) {
          const matchedStd = stdWeeks.find(s => s.id === selectedWeek);
          setCurrentWeekData({
            id: selectedWeek,
            name: `${isEn ? 'Week' : 'Tuần'} ${selectedWeek}`,
            status: current.status || 'draft',
            startDate: current.startDate || matchedStd?.startDate || '',
            endDate: current.endDate || matchedStd?.endDate || '',
            dateRangeFormatted: matchedStd ? `${matchedStd.startFormatted} - ${matchedStd.endFormatted}` : '',
            menus: current.menus || []
          });
          if (current.menus && current.menus.length > 0) {
            setFirestoreMenus(current.menus);
          } else {
            setFirestoreMenus([]);
          }
        } else {
          setCurrentWeekData(null);
          setFirestoreMenus([]);
        }
      }
    });

    return () => unsub();
  }, [selectedWeek, isEn]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  const [previewImage, setPreviewImage] = useState<{ title: string; imageUrl: string; dishes?: string[] } | null>(null);
  
  // Calculate displayed menus
  const displayedMenus: DayMenu[] = days.map(day => {
    if (firestoreMenus.length > 0) {
      const found = firestoreMenus.find(m => m.day === day);
      if (found) return { day, dishes: found.dishes.filter(d => d.trim() !== ''), imageUrl: found.imageUrl };
    }
    return { day, dishes: defaultDishesByDay[day] || [] };
  });

  const activeWeekInfo = weeks.find(w => w.id === selectedWeek) || currentWeekData;
  const isApproved = activeWeekInfo?.status === 'approved';

  return (
    <div className="bg-slate-50 overflow-y-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-teal-700" />
            {t('lunchMenuTitle')}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">{t('dailyLunchNutrition')}</p>
        </div>
        <button onClick={() => window.print()} className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm cursor-pointer">
          <Download className="w-4 h-4" /> {t('downloadPdf')}
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider font-display">{t('selectMenuWeek')}</h3>
        <div className="flex items-center gap-2">
          <button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
            {weeks.map(week => {
              return (
                <button 
                  key={week.id}
                  onClick={() => setSelectedWeek(week.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[105px] px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    selectedWeek === week.id 
                      ? 'bg-teal-700 border-teal-700 text-white shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-teal-400 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{week.name}</span>
                  </div>
                  {week.dateRangeFormatted && (
                    <span className={`text-[10px] ${selectedWeek === week.id ? 'text-teal-100' : 'text-slate-400'}`}>
                      {week.dateRangeFormatted}
                    </span>
                  )}
                  {week.status === 'approved' ? (
                    <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-100' : 'text-teal-600 font-medium'}`}>{t('approvedStatus')}</span>
                  ) : (
                    <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-200' : 'text-slate-400'}`}>{t('emptyStatus')}</span>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Menu Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-teal-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-display text-slate-800">{isEn ? `Week ${selectedWeek} Menu` : `Thực Đơn Tuần ${selectedWeek}`}</h3>
                {isApproved ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {t('approvedOfficial')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t('updatingMenu')}
                  </span>
                )}
              </div>
              {activeWeekInfo?.startDate && activeWeekInfo?.endDate ? (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {t('timePeriod')}: {t('from')} {activeWeekInfo.startDate} {t('to')} {activeWeekInfo.endDate}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {displayedMenus.filter(m => m.dishes.length > 0).map((menu, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 p-4 border border-slate-200 rounded-2xl bg-white hover:border-teal-300 transition-colors shadow-2xs">
              <div className="w-full sm:w-28 h-9 sm:h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-200/60 shadow-2xs">
                {translateDay(menu.day, isEn)}
              </div>
              
              <div className="flex-1 w-full space-y-1.5 pt-0.5">
                 <ul className="list-disc pl-5 space-y-1">
                   {menu.dishes.map((dish, dishIdx) => (
                     <li key={dishIdx} className="text-slate-700 text-sm font-semibold">{translateDish(dish, isEn)}</li>
                   ))}
                 </ul>
              </div>

              {/* Dish Photo Button / Thumbnail for Parents */}
              {menu.imageUrl && (() => {
                const activeWeekObj = weeks.find(w => w.id === selectedWeek);
                const dayDate = getDayDateFormatted(activeWeekObj?.startDate, menu.day);
                const modalTitle = `${isEn ? 'Actual Dish Photo' : 'Hình ảnh món ăn thực tế'} - ${translateDay(menu.day, isEn)}${dayDate ? ` (${dayDate})` : ` (Tuần ${selectedWeek})`}`;
                return (
                  <div className="shrink-0 flex sm:flex-col items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-teal-200 shadow-2xs shrink-0 cursor-pointer" onClick={() => setPreviewImage({ title: modalTitle, imageUrl: menu.imageUrl!, dishes: menu.dishes })}>
                      <img 
                        src={menu.imageUrl} 
                        alt={`Món ăn ${menu.day}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ title: modalTitle, imageUrl: menu.imageUrl!, dishes: menu.dishes })}
                      className="flex-1 sm:w-full px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isEn ? 'View Dish Photo' : 'Xem hình ảnh món ăn'}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Dish Image Modal for Parents */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-teal-600" />
                <span>{previewImage.title}</span>
              </h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
              <img 
                src={previewImage.imageUrl} 
                alt={previewImage.title} 
                className="max-h-[60vh] w-auto object-contain rounded-2xl shadow-md border border-slate-200"
              />
            </div>

            {previewImage.dishes && previewImage.dishes.filter(d => d.trim()).length > 0 && (
              <div className="bg-teal-50/80 p-3 rounded-2xl border border-teal-200/80">
                <p className="text-xs font-bold text-teal-900 mb-1">{isEn ? 'Dish details:' : 'Món ăn chi tiết:'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {previewImage.dishes.filter(d => d.trim()).map((dish, dIdx) => (
                    <span key={dIdx} className="px-2.5 py-0.5 bg-white text-teal-900 text-xs font-semibold rounded-lg border border-teal-200 shadow-2xs">
                      {translateDish(dish, isEn)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
