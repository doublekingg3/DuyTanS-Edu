const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

// 1. Remove the local tasks state and useEffect
c = c.replace(/  const \[tasks, setTasks\] = useState<string\[\]>\(\[\]\);\n  const \[newTask, setNewTask\] = useState\(''\);\n\n  React\.useEffect\(\(\) => \{[\s\S]*?\}, \[classId, className, schoolYearName, selectedWeek\]\);/g, "  const [newTask, setNewTask] = useState('');\n  const currentWeekData = weeks.find(w => w.id === selectedWeek);\n  const tasks = currentWeekData?.tasks || [];");

// 2. Fix the buttons in header to use saveWeekToFirebase
const saveButtonsOld = `          <div className="flex items-center gap-3">
            {weeks[selectedWeek - 1].status !== 'approved' && (
              <button 
                onClick={() => {
                  const newWeeks = [...weeks];
                  newWeeks[selectedWeek - 1].status = 'draft';
                  setWeeks(newWeeks);
                  showAlert('Đã lưu nháp kế hoạch tuần!', 'success');
                }} 
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Save className="w-4 h-4" /> Lưu nháp
              </button>
            )}

            {weeks[selectedWeek - 1].status !== 'approved' && (
              <button 
                onClick={async () => {
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn duyệt kế hoạch tuần này không?');
                  if (confirmed) {
                    const newWeeks = [...weeks];
                    newWeeks[selectedWeek - 1].status = 'approved';
                    setWeeks(newWeeks);
                    showAlert('Duyệt kế hoạch thành công!', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={role === 'staff'} 
                title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}
              >
                <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
              </button>
            )}

            {weeks[selectedWeek - 1].status === 'approved' && role === 'admin' && (
              <button 
                onClick={async () => {
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn hủy duyệt kế hoạch tuần này, yêu cầu Giáo viên làm lại?');
                  if (confirmed) {
                    const newWeeks = [...weeks];
                    newWeeks[selectedWeek - 1].status = 'draft';
                    setWeeks(newWeeks);
                    showAlert('Đã hủy duyệt kế hoạch, trạng thái chuyển về Bản nháp.', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm border border-red-200"
              >
                <X className="w-4 h-4" /> Hủy duyệt
              </button>
            )}
          </div>`;

const saveButtonsNew = `          <div className="flex items-center gap-3">
            {currentWeekData?.status !== 'approved' && (
              <button 
                onClick={async () => {
                  await saveWeekToFirebase(selectedWeek, { status: 'draft' });
                  showAlert('Đã lưu nháp kế hoạch tuần!', 'success');
                }} 
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Save className="w-4 h-4" /> Lưu nháp
              </button>
            )}

            {currentWeekData?.status !== 'approved' && (
              <button 
                onClick={async () => {
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn duyệt kế hoạch tuần này không?');
                  if (confirmed) {
                    await saveWeekToFirebase(selectedWeek, { status: 'approved' });
                    showAlert('Duyệt kế hoạch thành công!', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={role === 'staff'} 
                title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}
              >
                <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
              </button>
            )}

            {currentWeekData?.status === 'approved' && role === 'admin' && (
              <button 
                onClick={async () => {
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn hủy duyệt kế hoạch tuần này, yêu cầu Giáo viên làm lại?');
                  if (confirmed) {
                    await saveWeekToFirebase(selectedWeek, { status: 'draft' });
                    showAlert('Đã hủy duyệt kế hoạch, trạng thái chuyển về Bản nháp.', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm border border-red-200"
              >
                <X className="w-4 h-4" /> Hủy duyệt
              </button>
            )}
          </div>`;

c = c.replace(saveButtonsOld, saveButtonsNew);

// 3. Fix the "BẢN NHÁP" label to use currentWeekData?.status
c = c.replace(
  "{weeks[selectedWeek - 1].status === 'draft' && <span className=\"text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md\">BẢN NHÁP</span>}",
  "{currentWeekData?.status === 'draft' && <span className=\"text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md\">BẢN NHÁP</span>}"
);

// 4. Update the input onChange methods
c = c.replace(
  `                onChange={(e) => {
                  setWeeks(weeks.map(w => w.id === selectedWeek ? { ...w, startDate: e.target.value } : w));
                }}`,
  `                onChange={(e) => saveWeekToFirebase(selectedWeek, { startDate: e.target.value })}`
);
c = c.replace(
  `                onChange={(e) => {
                  setWeeks(weeks.map(w => w.id === selectedWeek ? { ...w, endDate: e.target.value } : w));
                }}`,
  `                onChange={(e) => saveWeekToFirebase(selectedWeek, { endDate: e.target.value })}`
);

// 5. Update dutyTeam 
const selectRegex = /<select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">[\s\S]*?<\/select>/;
const selectReplacement = `<select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                value={currentWeekData?.dutyTeam || 'Tổ 1'}
                onChange={(e) => saveWeekToFirebase(selectedWeek, { dutyTeam: e.target.value })}
              >
                <option value="Tổ 1">Tổ 1</option>
                <option value="Tổ 2">Tổ 2</option>
                <option value="Tổ 3">Tổ 3</option>
                <option value="Tổ 4">Tổ 4</option>
              </select>`;
c = c.replace(selectRegex, selectReplacement);

// 6. Update tasks editing
const taskItemRegex = /<input \s*type="text"\s*value=\{task\}\s*onChange=\{\(e\) => \{\s*const newTasks = \[\.\.\.tasks\];\s*newTasks\[idx\] = e\.target\.value;\s*setTasks\(newTasks\);\s*\}\}\s*className="flex-1 bg-transparent outline-none font-medium text-slate-700"\s*\/>/;
const taskItemReplacement = `<input 
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx] = e.target.value;
                      saveWeekToFirebase(selectedWeek, { tasks: newTasks });
                    }}
                    className="flex-1 bg-transparent outline-none font-medium text-slate-700"
                  />`;
c = c.replace(taskItemRegex, taskItemReplacement);

// 7. Update task deletion
const taskDelRegex = /<button \s*onClick=\{\(\) => \{\s*const newTasks = \[\.\.\.tasks\];\s*newTasks\.splice\(idx, 1\);\s*setTasks\(newTasks\);\s*\}\}\s*className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"\s*>/;
const taskDelReplacement = `<button 
                    onClick={() => {
                      const newTasks = [...tasks];
                      newTasks.splice(idx, 1);
                      saveWeekToFirebase(selectedWeek, { tasks: newTasks });
                    }}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >`;
c = c.replace(taskDelRegex, taskDelReplacement);

// 8. Update task adding
c = c.replace(
  `                  if (e.key === 'Enter' && newTask.trim()) {
                    setTasks([...tasks, newTask]);
                    setNewTask('');
                  }`,
  `                  if (e.key === 'Enter' && newTask.trim()) {
                    saveWeekToFirebase(selectedWeek, { tasks: [...tasks, newTask] });
                    setNewTask('');
                  }`
);
c = c.replace(
  `                  if (newTask.trim()) {
                    setTasks([...tasks, newTask]);
                    setNewTask('');
                  }`,
  `                  if (newTask.trim()) {
                    saveWeekToFirebase(selectedWeek, { tasks: [...tasks, newTask] });
                    setNewTask('');
                  }`
);

// 9. Add loading state display at the top
const returnRegex = /return \(\s*<div className="p-8 h-full bg-slate-50 overflow-y-auto">/;
const returnReplacement = `if (loading) {
    return <div className="p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-8 h-full bg-slate-50 overflow-y-auto">`;
c = c.replace(returnRegex, returnReplacement);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
