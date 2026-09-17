const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/className="snap-center flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors \$\{isActive \? 'text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'\}"/g, 
  'className={`snap-center flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? \'text-indigo-600 font-bold\' : \'text-slate-500 hover:bg-slate-50\'}`}');

// Also the previous className is still there? Let's check.
fs.writeFileSync('src/components/TeacherView.tsx', c);
