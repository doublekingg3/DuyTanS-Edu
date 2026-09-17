const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(/\{role !== 'subject_teacher' && \(\<button /g, "{role !== 'subject_teacher' && (<><button ");
c = c.replace(/title="Tải mẫu Excel \(Dùng để nhập HS mới\)"\n          >\n            <Download className="w-5 h-5" \/>\n          <\/button>\)\}/g, 'title="Tải mẫu Excel (Dùng để nhập HS mới)"\n          >\n            <Download className="w-5 h-5" />\n          </button></>)}');

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
