const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const anchor = `{activeTab === 'classes' && (
          <>
            {/* Stats */}`;

const newHeader = `{activeTab === 'classes' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-800">Quản lý Lớp học</h1>
                <p className="text-slate-500 mt-1">Quản lý danh sách lớp và phân công giáo viên</p>
              </div>
              <button 
                onClick={openAddModal}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-5 h-5" /> Thêm Lớp
              </button>
            </div>

            {/* Stats */}`;

content = content.replace(anchor, newHeader);
fs.writeFileSync('src/components/AdminView.tsx', content);
