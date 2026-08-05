import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const replacement = `
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Năm học (VD: 2024-2025) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={yearFormData.name}
                  onChange={e => setYearFormData({...yearFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="2024-2025"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsAddYearModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg">Hủy</button>
              <button onClick={handleSaveYear} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {isPromoteModalOpen && promoteClassData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Kết chuyển học sinh (Lên lớp)</h3>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex-1">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">Từ lớp hiện tại</p>
                  <p className="font-bold text-slate-800 text-lg">{promoteClassData.sourceClass.name}</p>
                </div>
                <div className="text-indigo-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-indigo-600 font-semibold mb-1">Đến lớp mới</p>
                  <select 
                    value={promoteClassData.targetClassId}
                    onChange={(e) => setPromoteClassData({...promoteClassData, targetClassId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.filter(c => c.id !== promoteClassData.sourceClass.id).map(c => {
                      const year = schoolYears.find(y => c.schoolYearId === y.id || c.id.startsWith(y.id));
                      return (
                        <option key={c.id} value={c.id}>{c.name} {year ? \`(Năm học: \${year.name})\` : ''}</option>
                      )
                    })}
                  </select>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
`;

code = code.replace(
  /<div className="p-6 space-y-4 max-h-\[70vh\] overflow-y-auto\">[\s\S]*?<thead>/,
  replacement.trim() + '\n'
);

fs.writeFileSync('src/components/AdminView.tsx', code);
