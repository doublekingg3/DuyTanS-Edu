import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetStr = `              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm học <span className="text-red-500">*</span></label>
                <select 
                  value={formData.schoolYearId}
                  onChange={e => setFormData({...formData, schoolYearId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  disabled={!!editingClass}
                >
                  <option value="">-- Chọn năm học --</option>
                  {schoolYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>`;

const replacementStr = `              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm học <span className="text-red-500">*</span></label>
                <select 
                  value={formData.schoolYearId}
                  onChange={e => setFormData({...formData, schoolYearId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-100 text-slate-500 cursor-not-allowed appearance-none"
                  disabled={true}
                >
                  <option value="">-- Chọn năm học --</option>
                  {schoolYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AdminView.tsx', code);
