const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// The new HTML for the tabs block
const newBlock = `{/* Tab Navigation */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex overflow-x-auto gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button 
              onClick={() => setActiveTab('classes')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Building2 className="w-4 h-4" /> Lớp học
            </button>
            <button 
              onClick={() => setActiveTab('school_years')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'school_years' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Calendar className="w-4 h-4" /> Năm học
            </button>
            <button 
              onClick={() => setActiveTab('accounts')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'accounts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Shield className="w-4 h-4" /> Tài khoản & Phân quyền
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <BarChart2 className="w-4 h-4" /> Báo cáo thống kê
            </button>
            <button 
              onClick={() => setActiveTab('backup')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'backup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Database className="w-4 h-4" /> Sao lưu dữ liệu
            </button>
            <button 
              onClick={() => setActiveTab('ai_config')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'ai_config' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Sparkles className="w-4 h-4" /> Cấu hình AI
            </button>
            <button 
              onClick={() => setActiveTab('firebase')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'firebase' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Cloud className="w-4 h-4" /> Kết nối Firebase
            </button>
          </div>
        </div>`;

// Use regex to replace the old tab navigation block.
// We look for {/* Tab Navigation */} and replace until the end of that block.
const regex = /\{\/\* Tab Navigation \*\/\}([\s\S]*?)<\/button>\n\s*<\/div>\n\s*<\/div>|\{\/\* Tab Navigation \*\/\}([\s\S]*?)<\/button>\n\s*<\/div>/m;

content = content.replace(regex, newBlock);
fs.writeFileSync('src/components/AdminView.tsx', content);
