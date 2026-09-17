const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

const tabStart = c.indexOf('<div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar">');
const tabEnd = c.indexOf('</div>', tabStart) + 6;

const newTabs = `<div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'attendance' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarCheck className="w-4 h-4" /> Hoạt động & Điểm danh
            {activeTab === 'attendance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          
          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="w-4 h-4" /> Thời khoá biểu
            {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          
          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'lunch_menu' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('lunch_menu')}
          >
            <Utensils className="w-4 h-4" /> Thực đơn ăn trưa
            {activeTab === 'lunch_menu' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>`;

c = c.substring(0, tabStart) + newTabs + c.substring(tabEnd);

fs.writeFileSync('src/components/ParentView.tsx', c);
