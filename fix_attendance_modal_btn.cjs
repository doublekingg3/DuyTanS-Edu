const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const quickBtnCode = `          <button
            onClick={() => {
              const records = {};
              students.forEach(s => {
                records[s.id] = { status: 'present', reason: '' };
              });
              setQuickAttendanceRecords(records);
              setIsQuickAttendanceModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm border border-emerald-200"
          >
            <CheckCircle className="w-4 h-4" /> Điểm danh nhanh
          </button>
          <input 
            type="date" `;

c = c.replace(/<button\n\s*onClick=\{\(\) => \{\n\s*if \(window\.confirm\('Bạn có chắc muốn đánh dấu TẤT CẢ học sinh là CÓ MẶT trong ngày ' \+ attendanceDate \+ '\?'\)\) \{\n\s*students\.forEach\(s => \{\n\s*handleAttendanceChange\(s\.id, 'present'\);\n\s*\}\);\n\s*\}\n\s*\}\}\n\s*className="px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm border border-emerald-200"\n\s*>\n\s*<CheckCircle className="w-4 h-4" \/> Điểm danh nhanh \(Tất cả có mặt\)\n\s*<\/button>\n\s*<input \n\s*type="date" /g, quickBtnCode);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
