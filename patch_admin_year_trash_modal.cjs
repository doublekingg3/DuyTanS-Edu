const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const trashModalCode = `
      {/* YEAR TRASH MODAL */}
      {isYearTrashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Thùng rác năm học</h2>
                <p className="text-sm text-slate-500 mt-1">Các năm học đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.</p>
              </div>
              <button 
                onClick={() => {
                  setIsYearTrashModalOpen(false);
                  setSelectedTrashYearIds([]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                {selectedTrashYearIds.length > 0 && (
                  <>
                    <button 
                      onClick={async () => {
                        const isConfirmed = await showConfirm(\`Khôi phục \${selectedTrashYearIds.length} năm học đã chọn?\`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashYearIds.forEach(id => {
                              batch.set(doc(db, 'school_years', id), { isDeleted: false }, { merge: true });
                            });
                            await batch.commit();
                            setSelectedTrashYearIds([]);
                            showAlert('Đã khôi phục các năm học.', 'success');
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
                        const isConfirmed = await showConfirm(\`Xóa vĩnh viễn \${selectedTrashYearIds.length} năm học? Hành động này KHÔNG THỂ hoàn tác.\`);
                        if (isConfirmed) {
                          try {
                            const batch = writeBatch(db);
                            selectedTrashYearIds.forEach(id => {
                              batch.delete(doc(db, 'school_years', id));
                            });
                            await batch.commit();
                            setSelectedTrashYearIds([]);
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
              {deletedYears.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Thùng rác trống</h3>
                  <p className="text-slate-500 mt-1">Không có năm học nào trong thùng rác.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 bg-slate-50 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedTrashYearIds.length > 0 && selectedTrashYearIds.length === deletedYears.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTrashYearIds(deletedYears.map(y => y.id));
                            else setSelectedTrashYearIds([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>
                      <th className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedYears.map(y => (
                      <tr key={y.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedTrashYearIds.includes(y.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashYearIds([...selectedTrashYearIds, y.id]);
                              else setSelectedTrashYearIds(selectedTrashYearIds.filter(id => id !== y.id));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{y.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await setDoc(doc(db, 'school_years', y.id), { isDeleted: false }, { merge: true });
                                  showAlert('Đã khôi phục năm học', 'success');
                                } catch(e) {}
                              }}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Khôi phục"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const isConfirmed = await showConfirm('Xóa vĩnh viễn năm học này?');
                                if (isConfirmed) {
                                  try {
                                    await deleteDoc(doc(db, 'school_years', y.id));
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
`;

c = c.replace("      {/* TRASH MODAL */}", trashModalCode + "\n      {/* TRASH MODAL */}");

fs.writeFileSync('src/components/AdminView.tsx', c);
