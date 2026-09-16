const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Add buttons to header
const classSearchReplace = `
            <div className="flex gap-4 w-full sm:w-auto flex-col sm:flex-row">
              <div className="relative w-full sm:w-72">
`;
const classHeaderAdd = `
            <div className="flex items-center gap-3">
              {selectedClassIds.length > 0 && (
                <button 
                  onClick={handleDeleteSelectedClasses}
                  className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                >
                  <Trash2 className="w-4 h-4" /> Xóa {selectedClassIds.length} lớp
                </button>
              )}
              <button 
                onClick={() => setIsClassTrashModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Thùng rác ({deletedClasses.length})
              </button>
            </div>
`;
c = c.replace(
  "              </select>\n            </div>\n          </div>",
  "              </select>\n            </div>\n" + classHeaderAdd + "          </div>"
);

// 2. Add checkbox to header
const thReplaceStr = `
                <tr>
                  <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 w-12 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedClassIds.length > 0 && filteredClasses.length > 0 && selectedClassIds.length === filteredClasses.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedClassIds(filteredClasses.map(c => c.id));
                        else setSelectedClassIds([]);
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Lớp</th>
`;
c = c.replace(
  "                <tr>\n                  <th className=\"px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50\">Tên Lớp</th>",
  thReplaceStr
);

// 3. Add checkbox to body
const tdReplaceStr = `
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={selectedClassIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedClassIds([...selectedClassIds, c.id]);
                              else setSelectedClassIds(selectedClassIds.filter(id => id !== c.id));
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50">
`;
c = c.replace(
  "                      <tr key={c.id} className=\"hover:bg-slate-50/80 transition-colors group\">\n                        <td className=\"px-6 py-4 border-b border-slate-50\">",
  tdReplaceStr
);

// 4. Add delete single button
const actionReplaceStr = `
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteClass(c.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Chuyển vào thùng rác"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
`;
c = c.replace(
  "                          <div className=\"flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity\">\n                            \n                            <button",
  actionReplaceStr
);

fs.writeFileSync('src/components/AdminView.tsx', c);
