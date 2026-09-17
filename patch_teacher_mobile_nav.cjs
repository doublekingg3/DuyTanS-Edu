const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/<div className="flex h-\[calc\(100vh-64px\)\] overflow-hidden bg-slate-50 relative">/, '<div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">');

c = c.replace(/<div className="relative h-full flex-shrink-0 z-20" style=\{\{ width: '64px' \}\}>/, '<div className="hidden md:block relative h-full flex-shrink-0 z-20" style={{ width: \'64px\' }}>');

c = c.replace(/\{\/\* Main Content Area \*\/\}\n\s*<div className="flex-1 overflow-hidden relative flex flex-col">/, `
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 py-2 flex justify-around items-center overflow-x-auto shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] hide-scrollbar">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={\`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-xl transition-colors \${isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}\`}
              style={{ minWidth: '4.5rem' }}
            >
              <Icon className={\`w-6 h-6 mb-1 \${isActive ? 'text-indigo-600' : 'text-slate-400'}\`} />
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col pb-[72px] md:pb-0">`);

fs.writeFileSync('src/components/TeacherView.tsx', c);
