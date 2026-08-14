const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

content = content.replace(
  "import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate } from 'lucide-react';",
  "import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';"
);

content = content.replace(
  "const [activeTab, setActiveTab] = useState<'classes' | 'accounts' | 'school_years' | 'backup' | 'firebase' | 'ai_config'>('classes');",
  "const [activeTab, setActiveTab] = useState<'classes' | 'accounts' | 'school_years' | 'backup' | 'firebase' | 'ai_config' | 'reports'>('classes');"
);

const tabHtml = `<button 
            onClick={() => setActiveTab('ai_config')}
            className={\`whitespace-nowrap px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 \${activeTab === 'ai_config' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
          >
            <Sparkles className="w-4 h-4" /> Cấu hình AI
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={\`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 \${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}
          >
            <BarChart2 className="w-4 h-4" /> Báo cáo thống kê
          </button>`;

content = content.replace(
  `<button \n            onClick={() => setActiveTab('ai_config')}\n            className={\`whitespace-nowrap px-6 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 \${activeTab === 'ai_config' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}\`}\n          >\n            <Sparkles className="w-4 h-4" /> Cấu hình AI\n          </button>`,
  tabHtml
);

fs.writeFileSync('src/components/AdminView.tsx', content);
