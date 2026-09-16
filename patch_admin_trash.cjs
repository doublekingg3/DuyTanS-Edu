const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Add updateDoc import
c = c.replace(
  "import { doc, setDoc, deleteDoc, writeBatch, addDoc, collection } from 'firebase/firestore';",
  "import { doc, setDoc, deleteDoc, updateDoc, writeBatch, addDoc, collection } from 'firebase/firestore';"
);

// 2. Add RefreshCcw icon import
c = c.replace(
  "import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';",
  "import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate, PieChart as PieChartIcon, BarChart2, RefreshCcw } from 'lucide-react';"
);

// 3. Add state for Trash Modal
c = c.replace(
  "  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);",
  "  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);\n  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);\n  const [selectedTrashUserIds, setSelectedTrashUserIds] = useState<string[]>([]);"
);

// 4. Update filtering to exclude deleted users
c = c.replace(
  "  const filteredUsers = users.filter(u => \n    u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||\n    u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase())\n  );",
  "  const activeUsers = users.filter(u => !u.isDeleted);\n  const deletedUsers = users.filter(u => u.isDeleted);\n  const filteredUsers = activeUsers.filter(u => \n    u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||\n    u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase())\n  );"
);

// 5. Modify handleDeleteUser (soft delete)
c = c.replace(
  "const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa tài khoản này?');\n    console.log('isConfirmed:', isConfirmed);\n    if (isConfirmed) {\n      try {\n        const docRef = doc(db, 'users', userId);\n        await deleteDoc(docRef);\n        showAlert('Xóa tài khoản thành công.', 'success');",
  "const isConfirmed = await showConfirm('Bạn có chắc chắn muốn chuyển tài khoản này vào thùng rác?');\n    if (isConfirmed) {\n      try {\n        const docRef = doc(db, 'users', userId);\n        await updateDoc(docRef, { isDeleted: true });\n        showAlert('Đã chuyển tài khoản vào thùng rác.', 'success');"
);

// 6. Modify handleDeleteSelectedUsers (soft delete)
c = c.replace(
  "const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn xóa ${safeSelectedIds.length} tài khoản đã chọn?`);\n    console.log('isConfirmed bulk:', isConfirmed);\n    if (isConfirmed) {\n      try {\n        const batch = writeBatch(db);\n        safeSelectedIds.forEach(id => {\n          const docRef = doc(db, 'users', id);\n          batch.delete(docRef);",
  "const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn chuyển ${safeSelectedIds.length} tài khoản đã chọn vào thùng rác?`);\n    if (isConfirmed) {\n      try {\n        const batch = writeBatch(db);\n        safeSelectedIds.forEach(id => {\n          const docRef = doc(db, 'users', id);\n          batch.update(docRef, { isDeleted: true });"
);
c = c.replace(
  "showAlert('Đã xóa các tài khoản được chọn.', 'success');",
  "showAlert('Đã chuyển các tài khoản vào thùng rác.', 'success');"
);
c = c.replace(
  /title="Xóa tài khoản"/g,
  `title="Chuyển vào thùng rác"`
);

// 7. Add Trash Button in UI
const addBtnSearch = `<button \n                  onClick={() => {\n                    setEditingUser(null);\n                    setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', isHomeroom: false, isSubject: false, subjects: [], homeroomClasses: [], subjectClasses: [] });\n                    setIsAddUserModalOpen(true);\n                  }}\n                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"\n                >\n                  <Plus className="w-4 h-4" /> Thêm tài khoản\n                </button>`;

const addBtnReplace = addBtnSearch + `\n                <button \n                  onClick={() => setIsTrashModalOpen(true)}\n                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"\n                >\n                  <Trash2 className="w-4 h-4" /> Thùng rác ({deletedUsers.length})\n                </button>`;
c = c.replace(addBtnSearch, addBtnReplace);

// 8. Add Trash Modal Component before final closing tag
const trashModalCode = `
      {/* TRASH MODAL */}
      {isTrashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Thùng rác tài khoản</h2>
                <p className="text-sm text-slate-500 mt-1">Các tài khoản đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.</p>
              </div>
              <button 
                onClick={() => {
                  setIsTrashModalOpen(false);
                  setSelectedTrashUserIds([]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                {selectedTrashUserIds.length > 0 && (
                  <>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(\`Khôi phục \${selectedTrashUserIds.length} tài khoản đã chọn?\`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashUserIds.forEach(id => {
                              batch.update(doc(db, 'users', id), { isDeleted: false });
                            });
                            await batch.commit();
                            setSelectedTrashUserIds([]);
                            showAlert('Đã khôi phục các tài khoản.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi khôi phục.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 border border-green-200"
                    >
                      <RefreshCcw className="w-4 h-4" /> Khôi phục đã chọn
                    </button>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(\`Xóa vĩnh viễn \${selectedTrashUserIds.length} tài khoản? Hành động này KHÔNG THỂ hoàn tác.\`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashUserIds.forEach(id => {
                              batch.delete(doc(db, 'users', id));
                            });
                            await batch.commit();
                            setSelectedTrashUserIds([]);
                            showAlert('Đã xóa vĩnh viễn.', 'success');
                          } catch (e) {
                            showAlert('Lỗi khi xóa vĩnh viễn.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {deletedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Thùng rác trống</h3>
                  <p className="text-slate-500 mt-1">Không có tài khoản nào trong thùng rác.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedTrashUserIds.length > 0 && selectedTrashUserIds.length === deletedUsers.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTrashUserIds(deletedUsers.map(u => u.id));
                            else setSelectedTrashUserIds([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tài khoản / Tên</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Phân quyền</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedUsers.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedTrashUserIds.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashUserIds([...selectedTrashUserIds, u.id]);
                              else setSelectedTrashUserIds(selectedTrashUserIds.filter(id => id !== u.id));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{u.username}</div>
                          <div className="text-sm text-slate-500">{u.fullName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {u.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'users', u.id), { isDeleted: false });
                                  showAlert('Đã khôi phục tài khoản', 'success');
                                } catch(e) {}
                              }}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Khôi phục"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await showConfirm('Xóa vĩnh viễn tài khoản này?');
                                if (isConfirmed) {
                                  try {
                                    await deleteDoc(doc(db, 'users', u.id));
                                    showAlert('Đã xóa vĩnh viễn', 'success');
                                  } catch(e) {}
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

c = c.replace("    </div>\n  );\n}", trashModalCode);

fs.writeFileSync('src/components/AdminView.tsx', c);
