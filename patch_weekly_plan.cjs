const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(
  "import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, FileText, Download, Save, Trash2, Plus } from 'lucide-react';",
  "import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, FileText, Download, Save, Trash2, Plus, X } from 'lucide-react';"
);

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
                  const confirmed = await showConfirm('Bạn có chắc chắn muốn hủy duyệt kế hoạch tuần này, yêu cầu làm lại?');
                  if (confirmed) {
                    const newWeeks = [...weeks];
                    newWeeks[selectedWeek - 1].status = 'draft';
                    setWeeks(newWeeks);
                    showAlert('Đã hủy duyệt kế hoạch, trạng thái chuyển về Bản nháp.', 'success');
                  }
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" /> Hủy duyệt
              </button>
            )}
          </div>`;

c = c.replace(
  /<div className="flex items-center gap-3">\s*<button onClick=\{\(\) => showAlert\('Đã lưu nháp kế hoạch tuần!', 'success'\)\}.*?<\/button>\s*<button onClick=\{async \(\) => \{[\s\S]*?<\/button>\s*<\/div>/m,
  buttonsStr
);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
