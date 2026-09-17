const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

const oldGrid = `<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 bg-white">
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Học lực</div>
              <div className="text-xl font-bold text-slate-800">{student.academicPerformance === 'T' ? 'Tốt' : student.academicPerformance === 'K' ? 'Khá' : student.academicPerformance === 'Đ' ? 'Đạt' : (student.academicPerformance || 'Chưa đánh giá')}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Hạnh kiểm</div>
              <div className="text-xl font-bold text-slate-800">{student.conduct === 'T' ? 'Tốt' : 'Khá'}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Nghỉ có phép (CP)</div>
              <div className="text-xl font-bold text-slate-800">{student.cp || 0} ngày</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Nghỉ không phép (KP)</div>
              <div className="text-xl font-bold text-red-600">{student.kp || 0} ngày</div>
            </div>
          </div>`;

c = c.replace(oldGrid, '');

const oldTabs = `<div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'grades' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('grades')}
          >
            <BookOpen className="w-4 h-4" /> Bảng điểm chi tiết
            {activeTab === 'grades' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4" /> Thông báo & Nhận xét
            {student.notifications.some(n => !n.isRead) && (
              <span className="bg-red-500 w-2 h-2 rounded-full inline-block"></span>
            )}
            {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
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
          
          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('history')}
          >
            <BookOpen className="w-4 h-4" /> Lịch sử học tập
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>`;

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

c = c.replace(oldTabs, newTabs);

fs.writeFileSync('src/components/ParentView.tsx', c);
