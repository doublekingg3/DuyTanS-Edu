const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

const targetStr = `          <div className="flex items-center gap-3">
            <button onClick={() => showAlert('Đã lưu nháp kế hoạch tuần!', 'success')} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button onClick={async () => {
              const confirmed = await showConfirm('Bạn có chắc chắn muốn duyệt kế hoạch tuần này không?');
              if (confirmed) {
                showAlert('Duyệt kế hoạch thành công!', 'success');
              }
            }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'staff'} title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}>
              <CheckCircle className="w-4 h-4" /> Duyệt kế hoạch
            </button>
          </div>`;

const buttonsStr = `          <div className="flex items-center gap-3">
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

if (c.includes(targetStr)) {
  c = c.replace(targetStr, buttonsStr);
  fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
  console.log("Replaced successfully");
} else {
  console.log("Could not find the target string. Let me try matching with regex again with more permissive whitespace.");
  const rx = /<div className="flex items-center gap-3">[\s\S]*?<CheckCircle className="w-4 h-4" \/> Duyệt kế hoạch\s*<\/button>\s*<\/div>/g;
  if(rx.test(c)) {
    c = c.replace(rx, buttonsStr);
    fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
    console.log("Replaced with regex successfully");
  } else {
    console.log("Regex failed too.");
  }
}

