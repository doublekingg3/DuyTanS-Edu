const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(/import React, \{ useState \} from 'react';/, 
  "import React, { useState } from 'react';\nimport { useAlert } from '../contexts/AlertContext';");

const componentStart = /export default function TeacherWeeklyPlan\(\{[^}]+\}: \{[^}]+\}\) \{/;
const match = c.match(componentStart);
if (match) {
  c = c.replace(match[0], match[0] + "\n  const { showAlert, showConfirm } = useAlert();");
}

const saveDraftButton = /<button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">\n              <Save className="w-4 h-4" \/> Lưu nháp\n            <\/button>/;

c = c.replace(saveDraftButton, `<button onClick={() => showAlert('Đã lưu nháp kế hoạch tuần!', 'success')} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <Save className="w-4 h-4" /> Lưu nháp
            </button>`);

const approveButton = /<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled=\{role === 'teacher' \|\| role === 'staff'\} title=\{role === 'teacher' \|\| role === 'staff' \? 'Chỉ Admin mới có quyền duyệt' : ''\}>\n              <CheckCircle className="w-4 h-4" \/> Duyệt kế hoạch\n            <\/button>/;

const newApproveButton = `<button onClick={async () => {
              const confirmed = await showConfirm('Bạn có chắc chắn muốn duyệt kế hoạch tuần này không?');
              if (confirmed) {
                showAlert('Duyệt kế hoạch thành công!', 'success');
              }
            }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'staff'} title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}>
              <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
            </button>`;

c = c.replace(approveButton, newApproveButton);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
