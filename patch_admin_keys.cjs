const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  '<tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">',
  '<tr key={`${u.id}-${Math.random()}`} className="hover:bg-slate-50/80 transition-colors group">'
);

fs.writeFileSync('src/components/AdminView.tsx', c);
