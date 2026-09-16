const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const headerReplace = `
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-800">Quản lý Năm học</h1>
                <p className="text-slate-500 mt-1">Danh sách các năm học trong hệ thống</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedYearIds.length > 0 && (
                  <button 
                    onClick={handleDeleteSelectedYears}
                    className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa {selectedYearIds.length} năm học
                  </button>
                )}
                <button 
                  onClick={() => setIsYearTrashModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Thùng rác ({deletedYears.length})
                </button>
                <button 
                  onClick={() => { setEditingYear(null); setYearFormData({ name: '' }); setIsAddYearModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm Năm học
                </button>
              </div>
            </div>
`;

c = c.replace(
  /            <div className="flex justify-between items-center mb-6">[\s\S]*?<Plus className="w-4 h-4" \/> Thêm Năm học\n              <\/button>\n            <\/div>/m,
  headerReplace
);

const thReplace = `
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 w-12 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selectedYearIds.length > 0 && activeYears.length > 0 && selectedYearIds.length === activeYears.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedYearIds(activeYears.map(y => y.id));
                          else setSelectedYearIds([]);
                        }}
                      />
                    </th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>
`;

c = c.replace(
  "                  <tr>\n                    <th className=\"px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50\">Tên Năm học</th>",
  thReplace
);

c = c.replace(
  "{schoolYears.length === 0 ? (",
  "{activeYears.length === 0 ? ("
);

c = c.replace(
  "<td colSpan={3} className=\"px-6 py-8 text-center text-slate-500\">Chưa có năm học nào</td>",
  "<td colSpan={4} className=\"px-6 py-8 text-center text-slate-500\">Chưa có năm học nào</td>"
);

c = c.replace(
  "schoolYears.map(y => {",
  "activeYears.map(y => {"
);

const tdReplace = `
                        <tr key={y.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 border-b border-slate-50 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedYearIds.includes(y.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedYearIds([...selectedYearIds, y.id]);
                                else setSelectedYearIds(selectedYearIds.filter(id => id !== y.id));
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50 font-bold text-slate-800">{y.name}</td>
`;

c = c.replace(
  "                        <tr key={y.id} className=\"hover:bg-slate-50/80 transition-colors group\">\n                          <td className=\"px-6 py-4 border-b border-slate-50 font-bold text-slate-800\">{y.name}</td>",
  tdReplace
);

// update action button for trash
c = c.replace(
  `                              <button 
                                onClick={() => handleDeleteYear(y.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              ><Trash2 className="w-4 h-4" /></button>`,
  `                              <button 
                                onClick={() => handleDeleteYear(y.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Chuyển vào thùng rác"
                              ><Trash2 className="w-4 h-4" /></button>`
);

fs.writeFileSync('src/components/AdminView.tsx', c);
