import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// Fix Table Header
code = code.replace(
  '<th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Phân quyền</th>\n                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>',
  '<th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Phân quyền</th>\n                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Lớp phân công</th>\n                      <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>'
);

// Add Import/Export Buttons
code = code.replace(
  '              <button \n                onClick={openAddUserModal}\n                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"\n              >\n                <Plus className="w-4 h-4" /> Thêm Tài khoản\n              </button>\n            </div>',
  '              <div className="flex items-center gap-3">\n                <button onClick={() => alert("Tính năng đang phát triển")} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">\n                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Tải mẫu\n                </button>\n                <button onClick={() => alert("Tính năng đang phát triển")} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">\n                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> Nhập (Import)\n                </button>\n                <button \n                  onClick={openAddUserModal}\n                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"\n                >\n                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Thêm\n                </button>\n              </div>\n            </div>'
);


fs.writeFileSync('src/components/AdminView.tsx', code);
