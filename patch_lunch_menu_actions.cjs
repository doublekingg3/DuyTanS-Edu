const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(
  /const weeks = Array\.from\(\{ length: 38 \}, \(_, i\) => \(\{\n    id: i \+ 1,\n    name: \`Tuần \$\{i \+ 1\}\`,\n    status: i < 2 \? 'approved' : i === 4 \? 'draft' : 'empty'\n  \}\)\);/,
  `const [weeks, setWeeks] = useState(Array.from({ length: 38 }, (_, i) => ({
    id: i + 1,
    name: \`Tuần \${i + 1}\`,
    status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty'
  })));`
);

c = c.replace(
  /const \{ showAlert \} = useAlert\(\);/,
  `const { showAlert, showConfirm } = useAlert();

  const handleApprove = async () => {
    const confirmed = await showConfirm(\`Bạn có chắc chắn muốn duyệt thực đơn tuần \${selectedWeek} không?\`);
    if (confirmed) {
      setWeeks(weeks.map(w => w.id === selectedWeek ? { ...w, status: 'approved' } : w));
      showAlert('Duyệt thực đơn thành công!', 'success');
    }
  };

  const handleSaveDraft = () => {
    setWeeks(weeks.map(w => w.id === selectedWeek ? { ...w, status: 'draft' } : w));
    showAlert('Đã lưu nháp thực đơn', 'success');
  };`
);

c = c.replace(
  /<button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">/,
  `<button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">`
);

c = c.replace(
  /<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled=\{role === 'teacher'\} title=\{role === 'teacher' \? 'Chỉ Giáo vụ hoặc Admin mới có quyền duyệt' : ''\}>/,
  `<button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'teacher'} title={role === 'teacher' ? 'Chỉ Giáo vụ hoặc Admin mới có quyền duyệt' : ''}>`
);

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
