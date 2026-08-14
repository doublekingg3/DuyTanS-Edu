const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const anchor = `            <button 
              onClick={() => setActiveTab('firebase')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'firebase' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Cloud className="w-4 h-4" /> Kết nối Firebase
            </button>
          </div>
        </div>`;

const newCode = `            <button 
              onClick={() => setActiveTab('firebase')}
              className={\`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0 \${activeTab === 'firebase' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
            >
              <Cloud className="w-4 h-4" /> Kết nối Firebase
            </button>
          </div>
        </div>

        {activeTab === 'classes' && (
          <>`;

content = content.replace(anchor, newCode);
fs.writeFileSync('src/components/AdminView.tsx', content);
