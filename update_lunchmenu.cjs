const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(/export default function TeacherLunchMenu\(\{ classId \}: \{ classId: string \}\) \{/g, "export default function TeacherLunchMenu({ classId, role }: { classId: string, role?: string }) {");

const searchButtons = `<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <CheckCircle className="w-4 h-4" /> Duyệt thực đơn
            </button>`;

const replaceButtons = `<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'teacher'} title={role === 'teacher' ? 'Chỉ Giáo vụ hoặc Admin mới có quyền duyệt' : ''}>
              <CheckCircle className="w-4 h-4" /> Duyệt thực đơn
            </button>`;

c = c.replace(searchButtons, replaceButtons);
fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
