const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const quickBtnCode = `
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn đánh dấu TẤT CẢ học sinh là CÓ MẶT trong ngày ' + attendanceDate + '?')) {
                students.forEach(s => {
                  handleAttendanceChange(s.id, 'present');
                });
              }
            }}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm border border-emerald-200"
          >
            <CheckCircle className="w-4 h-4" /> Điểm danh nhanh (Tất cả có mặt)
          </button>
          <input 
            type="date" `;

c = c.replace(/<input \n\s*type="date" /g, quickBtnCode);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
