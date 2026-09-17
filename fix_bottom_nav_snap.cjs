const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/overflow-x-auto shadow-\[0_-4px_6px_-1px_rgb\(0,0,0,0\.05\)\] hide-scrollbar gap-2/g, 
  "overflow-x-auto snap-x snap-mandatory shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] hide-scrollbar gap-2");

c = c.replace(/style=\{\{ minWidth: '4\.5rem' \}\}/g, "style={{ minWidth: '4.5rem' }} className=\"snap-center flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}\"");

fs.writeFileSync('src/components/TeacherView.tsx', c);
