import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

code = code.replace(
  "{isAddUserModalOpen && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4\">\n          <div className=\"bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden\"",
  "{isAddUserModalOpen && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4\">\n          <div className=\"bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden\""
);

// find the user modal body <div className="p-6 space-y-4"> just below the header
code = code.replace(
  "Thêm Tài khoản mới'}</h3>\n              <button onClick={() => setIsAddUserModalOpen(false)} className=\"text-slate-400 hover:text-slate-600\">\n                <svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" /></svg>\n              </button>\n            </div>\n            \n            <div className=\"p-6 space-y-4\">",
  "Thêm Tài khoản mới'}</h3>\n              <button onClick={() => setIsAddUserModalOpen(false)} className=\"text-slate-400 hover:text-slate-600\">\n                <svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" /></svg>\n              </button>\n            </div>\n            \n            <div className=\"p-6 space-y-4 max-h-[70vh] overflow-y-auto\">"
);

fs.writeFileSync('src/components/AdminView.tsx', code);
