const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetStr = `            <div className="flex items-center gap-3">
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
            </div>`;

const newButtons = `            <div className="flex items-center gap-3 flex-wrap justify-end">
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
              <button 
                onClick={handleExportTemplate}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" /> Tải mẫu Excel
              </button>
              <button 
                onClick={() => document.getElementById('upload-classes-file')?.click()}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" /> Nhập Excel
              </button>
              <input type="file" id="upload-classes-file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
              <button 
                onClick={() => {
                  setEditingClass(null);
                  setFormData({ name: '', homeroomTeacher: '', schoolYearId: classFilterYear || (schoolYears[0]?.id || ''), specialization: '' });
                  setIsAddClassModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Thêm Lớp
              </button>
            </div>`;

c = c.replace(targetStr, newButtons);
fs.writeFileSync('src/components/AdminView.tsx', c);
