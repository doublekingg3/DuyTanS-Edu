const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import ParentSchedule from './ParentSchedule';`;
content = content.replace("import ParentGrades from './ParentGrades';", "import ParentGrades from './ParentGrades';\n" + importStatement);

content = content.replace("useState<'grades' | 'notifications' | 'attendance' | 'history'>('grades')", "useState<'grades' | 'schedule' | 'notifications' | 'attendance' | 'history'>('grades')");

const tabNavHtml = `
          <button 
            onClick={() => setActiveTab('schedule')}
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Thời khoá biểu</span>
            <span className="sm:hidden">TKB</span>
            {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
`;

content = content.replace(/          <button \n            onClick=\{\(\) => setActiveTab\('notifications'\)\}/, tabNavHtml + "\n          <button \n            onClick={() => setActiveTab('notifications')}");

const scheduleBlock = `
        {activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto">
            <ParentSchedule classId={selectedStudent?.classId || ''} />
          </div>
        )}
`;

content = content.replace("{activeTab === 'history' && (", scheduleBlock + "\n        {activeTab === 'history' && (");

fs.writeFileSync(file, content);
