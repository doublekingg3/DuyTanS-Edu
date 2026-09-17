const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

const oldBtn = `<button className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
            <Download className="w-4 h-4" /> Xuất Sổ chủ nhiệm (.docx) — 3 tuần
          </button>`;

const newBtn = `<button 
            onClick={() => exportWeeklyPlanToDocx(className || 'Chưa rõ', schoolYearName || '2024-2025', currentWeekData)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
            <Download className="w-4 h-4" /> Xuất Kế hoạch Tuần {selectedWeek} (.docx)
          </button>`;

c = c.replace(oldBtn, newBtn);
fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
