const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

c = c.replace(/<div className="flex gap-4 border-b border-slate-200">/g, '<div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar">');

fs.writeFileSync('src/components/ParentView.tsx', c);
