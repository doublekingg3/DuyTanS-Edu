import React, { useState, useRef, useEffect } from 'react';
import { Utensils, ChevronLeft, ChevronRight, Download, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface DayMenu {
  day: string;
  dishes: string[];
}

interface WeekInfo {
  id: number;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
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
  const [weeks, setWeeks] = useState<WeekInfo[]>(() => 
    Array.from({ length: 42 }, (_, i) => ({
      id: i + 1,
      name: `Tuần ${i + 1}`,
      status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty'
    }))
  );
  
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [firestoreMenus, setFirestoreMenus] = useState<DayMenu[]>([]);
  const [currentWeekData, setCurrentWeekData] = useState<WeekInfo | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'lunch_menus', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firebaseWeeks = data.weeks || {};

        setWeeks(prevWeeks => 
          prevWeeks.map(w => {
            const fw = firebaseWeeks[w.id];
            if (fw) {
              return {
                ...w,
                status: fw.status || w.status,
                startDate: fw.startDate || w.startDate,
                endDate: fw.endDate || w.endDate,
                menus: fw.menus || w.menus
              };
            }
            return w;
          })
        );

        const current = firebaseWeeks[selectedWeek];
        if (current) {
          setCurrentWeekData({
            id: selectedWeek,
            name: `Tuần ${selectedWeek}`,
            status: current.status || 'draft',
            startDate: current.startDate || '',
            endDate: current.endDate || '',
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
  }, [selectedWeek]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  // Calculate displayed menus
  const displayedMenus: DayMenu[] = days.map(day => {
    if (firestoreMenus.length > 0) {
      const found = firestoreMenus.find(m => m.day === day);
      if (found) return { day, dishes: found.dishes.filter(d => d.trim() !== '') };
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
            Thực Đơn Ăn Trưa
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Dinh dưỡng hàng ngày của học sinh tại trường</p>
        </div>
        <button className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Tải về (.pdf)
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider font-display">Chọn tuần</h3>
        <div className="flex items-center gap-2">
          <button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
            {weeks.map(week => (
              <button 
                key={week.id}
                onClick={() => setSelectedWeek(week.id)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-24 py-2.5 rounded-xl border transition-all ${selectedWeek === week.id ? 'bg-teal-700 border-teal-700 text-white shadow-sm' : 'bg-white border-slate-200 hover:border-teal-400 text-slate-700'}`}
              >
                <span className="font-bold text-sm">{week.name}</span>
                {week.status === 'approved' ? (
                  <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-100' : 'text-teal-600 font-medium'}`}>Đã duyệt</span>
                ) : (
                  <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-200' : 'text-slate-400'}`}>Chưa duyệt</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
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
                <h3 className="text-lg sm:text-xl font-bold font-display text-slate-800">Thực Đơn Tuần {selectedWeek}</h3>
                {isApproved ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã duyệt chính thức
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Đang cập nhật
                  </span>
                )}
              </div>
              {activeWeekInfo?.startDate && activeWeekInfo?.endDate ? (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  Thời gian: từ {activeWeekInfo.startDate} đến {activeWeekInfo.endDate}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {displayedMenus.filter(m => m.dishes.length > 0).map((menu, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:border-teal-300 transition-colors">
              <div className="w-full sm:w-24 h-9 sm:h-10 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-200/60">
                {menu.day}
              </div>
              <div className="flex-1 w-full space-y-1.5 pt-0.5">
                 <ul className="list-disc pl-5 space-y-1">
                   {menu.dishes.map((dish, dishIdx) => (
                     <li key={dishIdx} className="text-slate-700 text-sm font-medium">{dish}</li>
                   ))}
                 </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
