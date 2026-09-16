const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const searchStr = `                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã GV, tên..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>`;

const replaceStr = searchStr + `
                {selectedUserIds.length > 0 && (
                  <button 
                    onClick={handleDeleteSelectedUsers}
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa {selectedUserIds.length} tài khoản
                  </button>
                )}`;

c = c.replace(searchStr, replaceStr);
fs.writeFileSync('src/components/AdminView.tsx', c);
