const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');
c = c.replace(/import ParentSchedule from '.\/ParentSchedule';/, "import ParentSchedule from './ParentSchedule';\nimport ParentLunchMenu from './ParentLunchMenu';\nimport { Utensils } from 'lucide-react';");

const tabsSearch = `<button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="w-4 h-4" /> Thời khoá biểu
            {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>`;

const tabsReplace = `<button 
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
          </button>`;
          
c = c.replace(tabsSearch, tabsReplace);

c = c.replace(/useState<'grades' \| 'schedule' \| 'notifications' \| 'attendance' \| 'history'>/g, 
  "useState<'grades' | 'schedule' | 'notifications' | 'attendance' | 'history' | 'lunch_menu'>");

const contentSearch = `{activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto">
            <ParentSchedule classId={student?.classId || ''} />
          </div>
        )}`;

const contentReplace = `{activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto">
            <ParentSchedule classId={student?.classId || ''} />
          </div>
        )}
        
        {activeTab === 'lunch_menu' && (
          <div className="max-w-4xl mx-auto">
            <ParentLunchMenu />
          </div>
        )}`;

c = c.replace(contentSearch, contentReplace);

fs.writeFileSync('src/components/ParentView.tsx', c);
