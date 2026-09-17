const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

const approvedCountStr = `<span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-medium border border-indigo-100">Đã duyệt: 3 / 42 tuần</span>`;
const newApprovedCountStr = `{/* Replaced dynamic count below */}`;

const oldBtn = `<button className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            <FileText className="w-4 h-4" /> Xem Sổ lũy kế (3/42)
          </button>`;
const newBtn = `<button 
            onClick={() => {
              const approvedWeeks = weeks.filter(w => w.status === 'approved');
              exportCumulativePlanToDocx(className || 'Chưa rõ', schoolYearName || '2024-2025', approvedWeeks, teacherName || '');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            <FileText className="w-4 h-4" /> Tải Sổ lũy kế ({weeks.filter(w => w.status === 'approved').length}/42)
          </button>`;

c = c.replace(oldBtn, newBtn);
c = c.replace(approvedCountStr, `<span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-medium border border-indigo-100">Đã duyệt: {weeks.filter(w => w.status === 'approved').length} / 42 tuần</span>`);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
