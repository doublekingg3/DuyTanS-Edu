const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

c = c.replace(/max-w-md/g, "max-w-lg");
c = c.replace(/Hệ thống quản lý điểm số thông minh/g, "Hệ thống quản lý học sinh online");
c = c.replace(/<div className="flex bg-slate-100 p-1 rounded-xl mb-6">/g, '<div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-6">');

fs.writeFileSync('src/components/Login.tsx', c);
