const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(/export default function TeacherWeeklyPlan\(\{ classId \}: \{ classId: string \}\) \{/g, "export default function TeacherWeeklyPlan({ classId, role }: { classId: string, role?: string }) {");

const searchButtons = `<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
            </button>`;

const replaceButtons = `<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'teacher' || role === 'staff'} title={role === 'teacher' || role === 'staff' ? 'Chỉ Admin mới có quyền duyệt' : ''}>
              <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
            </button>`;

c = c.replace(searchButtons, replaceButtons);
fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
