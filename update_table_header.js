import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

code = code.replace(
  '<th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tài khoản</th>',
  '<th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Mã GV (Tài khoản)</th>'
);

code = code.replace(
  'placeholder="Tìm kiếm tài khoản, tên..."',
  'placeholder="Tìm kiếm mã GV, tên..."'
);

fs.writeFileSync('src/components/AdminView.tsx', code);
