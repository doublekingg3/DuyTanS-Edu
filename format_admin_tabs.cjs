const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const regex = /\{\/\* Tab Navigation \*\/\}([\s\S]*?)<\/button>\n\s*<\/div>\n\s*<\/div>/m;

const newBlock = `{/* Tab Navigation */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          <button 
            onClick={() => setActiveTab('classes')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <Building2 className="w-4 h-4" /> Lớp học
          </button>
          <button 
            onClick={() => setActiveTab('school_years')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'school_years' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <Calendar className="w-4 h-4" /> Năm học
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'accounts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <Shield className="w-4 h-4" /> Tài khoản & Phân quyền
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={\`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 \${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-600' : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'}\`}
          >
            <BarChart2 className="w-4 h-4" /> Báo cáo thống kê
          </button>
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
        </div>`;

content = content.replace(regex, newBlock);
fs.writeFileSync('src/components/AdminView.tsx', content);
