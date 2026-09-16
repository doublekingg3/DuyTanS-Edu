const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const oldTabs = `        {/* Tab Navigation */}
        {!externalActiveTab && <div className="flex flex-wrap gap-2.5 mb-8">
          <button 
            onClick={() => setActiveTab('backup')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'backup' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <Database className="w-4 h-4" /> Sao lưu dữ liệu
          </button>
          <button 
            onClick={() => setActiveTab('ai_config')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'ai_config' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <Sparkles className="w-4 h-4" /> Cấu hình AI
          </button>
          <button 
            onClick={() => setActiveTab('firebase')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'firebase' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <Cloud className="w-4 h-4" /> Kết nối Firebase
          </button>
        </div>}`;

const newTabs = `        {/* Tab Navigation */}
        {!externalActiveTab && <div className="flex justify-center gap-3 mb-10 border-b border-slate-200 pb-2">
          <button 
            onClick={() => setActiveTab('backup')}
            className={\`px-6 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 \${activeTab === 'backup' ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border-transparent'}\`}
          >
            <Database className="w-4 h-4" /> Sao lưu dữ liệu
          </button>
          <button 
            onClick={() => setActiveTab('ai_config')}
            className={\`px-6 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 \${activeTab === 'ai_config' ? 'text-purple-600 border-purple-600 bg-purple-50/50' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50 border-transparent'}\`}
          >
            <Sparkles className="w-4 h-4" /> Cấu hình Trợ lý AI
          </button>
          <button 
            onClick={() => setActiveTab('firebase')}
            className={\`px-6 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 \${activeTab === 'firebase' ? 'text-slate-800 border-slate-800 bg-slate-100/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'}\`}
          >
            <Cloud className="w-4 h-4" /> Kết nối đám mây
          </button>
        </div>}`;

c = c.replace(oldTabs, newTabs);
fs.writeFileSync('src/components/AdminView.tsx', c);
