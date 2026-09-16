const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Add state
c = c.replace(
  "  const [userSearchTerm, setUserSearchTerm] = useState('');",
  "  const [userSearchTerm, setUserSearchTerm] = useState('');\n  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);"
);

// 2. Add bulk delete function
const functionInsertPoint = "  const handleDeleteUser = async (userId: string) => {";
const bulkDeleteFunc = `  const handleDeleteSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return;
    
    const safeSelectedIds = selectedUserIds.filter(id => {
      const u = users.find(user => user.id === id);
      return u && u.username !== 'admin' && u.role !== 'admin';
    });

    if (safeSelectedIds.length === 0) {
      showAlert('Không có tài khoản hợp lệ để xoá (không thể xoá tài khoản admin).', 'error');
      return;
    }

    const isConfirmed = await showConfirm(\`Bạn có chắc chắn muốn xóa \${safeSelectedIds.length} tài khoản đã chọn?\`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        safeSelectedIds.forEach(id => {
          const docRef = doc(db, 'users', id);
          batch.delete(docRef);
        });
        await batch.commit();
        setSelectedUserIds([]);
        showAlert('Đã xóa các tài khoản được chọn.', 'success');
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản hàng loạt:', error);
        showAlert('Đã xảy ra lỗi khi xóa tài khoản.', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {`;
c = c.replace(functionInsertPoint, bulkDeleteFunc);

// 3. Add button in the header
const headerSearchPoint = `<div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã GV, tên..." 
                    value={userSearchTerm}
                    onChange={e => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
                  />
                </div>`;
const headerReplacePoint = `<div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã GV, tên..." 
                    value={userSearchTerm}
                    onChange={e => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
                  />
                </div>
                {selectedUserIds.length > 0 && (
                  <button 
                    onClick={handleDeleteSelectedUsers}
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa {selectedUserIds.length} tài khoản
                  </button>
                )}`;
c = c.replace(headerSearchPoint, headerReplacePoint);

// 4. Modify table headers
const tableHeaderSearch = `                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Mã GV (Tài khoản)</th>`;
const tableHeaderReplace = `                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedUserIds.length > 0 && filteredUsers.filter(u => u.username !== 'admin' && u.role !== 'admin').length > 0 && selectedUserIds.length === filteredUsers.filter(u => u.username !== 'admin' && u.role !== 'admin').length}
                          onChange={(e) => {
                            if (e.target.checked) {
                                const ids = filteredUsers.filter(u => u.username !== 'admin' && u.role !== 'admin').map(u => u.id);
                                setSelectedUserIds(ids);
                            } else {
                                setSelectedUserIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Mã GV (Tài khoản)</th>`;
c = c.replace(tableHeaderSearch, tableHeaderReplace);

// 5. Modify empty state colspan
c = c.replace(/<td colSpan=\{5\} className="px-6 py-8 text-center text-slate-500">/g, '<td colSpan={6} className="px-6 py-8 text-center text-slate-500">');

// 6. Modify table rows
const tableRowSearch = `<tr key={\`\${u.id}-\${Math.random()}\`} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50">
                            <span className="font-bold text-slate-800 font-mono">{u.username}</span>
                          </td>`;
const tableRowReplace = `<tr key={\`\${u.id}-\${Math.random()}\`} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                              disabled={u.username === 'admin' || u.role === 'admin'}
                              checked={selectedUserIds.includes(u.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds([...selectedUserIds, u.id]);
                                } else {
                                  setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50">
                            <span className="font-bold text-slate-800 font-mono">{u.username}</span>
                          </td>`;
c = c.replace(tableRowSearch, tableRowReplace);

fs.writeFileSync('src/components/AdminView.tsx', c);
