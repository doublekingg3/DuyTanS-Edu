import React, { useState, useRef } from 'react';
import { Utensils, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function ParentLunchMenu() {
  const weeks = Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    name: `Tuần ${i + 1}`,
    status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty'
  }));
  
  const [selectedWeek, setSelectedWeek] = useState(5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  
  
  const menus = [
    { day: 'Thứ 2', dishes: ['Cơm trắng, Thịt kho trứng', 'Canh bí đỏ thịt bằm', 'Tráng miệng: Dưa hấu'] },
    { day: 'Thứ 3', dishes: ['Bún bò xào', 'Canh cải ngọt tôm', 'Tráng miệng: Chuối'] },
    { day: 'Thứ 4', dishes: ['Cơm trắng, Gà ram sả ớt', 'Canh chua cá lóc', 'Tráng miệng: Thanh long'] },
    { day: 'Thứ 5', dishes: ['Phở gà', 'Tráng miệng: Sữa chua'] },
    { day: 'Thứ 6', dishes: ['Cơm chiên Dương Châu', 'Canh súp rau củ', 'Tráng miệng: Bánh flan'] },
    { day: 'Thứ 7', dishes: [] }
  ];

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
                {week.status === 'approved' && <span className={`text-[11px] mt-0.5 ${selectedWeek === week.id ? 'text-teal-100' : 'text-teal-600 font-medium'}`}>Đã chốt</span>}
              </button>
            ))}
          </div>
          <button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Menu Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-teal-50/40 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5 text-teal-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-slate-800">Thực Đơn Tuần {selectedWeek}</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {menus.filter(m => m.dishes.length > 0).map((menu, idx) => (
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
