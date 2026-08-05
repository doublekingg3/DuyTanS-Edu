const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const [appMode, setAppMode] = useState<'portal' | 'edu_manager'>('portal');",
  "const [appMode, setAppMode] = useState<'portal' | 'edu_manager' | 'tkb'>('portal');"
);

const targetRenderPortal = `  if (appMode === 'portal') {
    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} />;
  }`;

const replaceRenderPortal = `  if (appMode === 'portal') {
    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} onSelectTkb={() => setAppMode('tkb')} />;
  }

  if (appMode === 'tkb') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative">
        <div className="bg-white border-b border-slate-200 p-4 flex items-center shadow-sm z-10">
          <button 
            onClick={() => setAppMode('portal')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Về Portal</span>
          </button>
          <h1 className="text-xl font-bold font-display text-slate-800 ml-6">Hệ thống Thời Khoá Biểu</h1>
        </div>
        <div className="flex-1 w-full bg-slate-100">
          {/* TKB Placeholder Iframe */}
          <iframe 
            src="https://example.com" 
            className="w-full h-full border-0"
            title="TKB System"
          />
        </div>
      </div>
    );
  }`;

code = code.replace(targetRenderPortal, replaceRenderPortal);
fs.writeFileSync(file, code);
