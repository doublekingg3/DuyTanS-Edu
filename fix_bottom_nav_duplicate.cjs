const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/className=\{\`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors \$\{isActive \? 'text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'\}\`\}\n\s*style=\{\{ minWidth: '4\.5rem' \}\} className=\{\`snap-center flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors \$\{isActive \? 'text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'\}\`\}/g, 
  'style={{ minWidth: \'4.5rem\' }} className={`snap-center flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? \'text-indigo-600 font-bold\' : \'text-slate-500 hover:bg-slate-50\'}`}');

fs.writeFileSync('src/components/TeacherView.tsx', c);
