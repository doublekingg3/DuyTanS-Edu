const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useRef } from 'react';");

const weeksDecl = `  const weeks = Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    name: \`Tuần \${i + 1}\`,
    status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty'
  }));`;

const newWeeksDecl = `  const [weeks, setWeeks] = useState(() => Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    name: \`Tuần \${i + 1}\`,
    status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty',
    startDate: (i < 2 || i === 4) ? '2024-09-30' : '',
    endDate: (i < 2 || i === 4) ? '2024-10-05' : ''
  })));
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };`;

c = c.replace(weeksDecl, newWeeksDecl);

// Now patch the scroll arrows
const arrowLeft = `<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>`;
const arrowRight = `<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>`;

c = c.replace(arrowLeft, `<button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>`);
c = c.replace(arrowRight, `<button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>`);

// Fix the container
c = c.replace(`<div className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">`, `<div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>`);

// Patch dates
const datesSearch = `            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày (Bắt đầu)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" defaultValue="2024-09-30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày (Kết thúc)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" defaultValue="2024-10-05" />
            </div>`;

const datesReplace = `            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày (Bắt đầu)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.startDate || ''}
                onChange={(e) => {
                  setWeeks(weeks.map(w => w.id === selectedWeek ? { ...w, startDate: e.target.value } : w));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày (Kết thúc)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.endDate || ''}
                onChange={(e) => {
                  setWeeks(weeks.map(w => w.id === selectedWeek ? { ...w, endDate: e.target.value } : w));
                }}
              />
            </div>`;
c = c.replace(datesSearch, datesReplace);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
