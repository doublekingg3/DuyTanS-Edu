const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/<option value="teacher">Giáo viên<\/option>/g, '<option value="teacher">Giáo viên Chủ nhiệm</option>\n                  <option value="subject_teacher">Giáo viên Bộ môn</option>');
c = c.replace(/role: e\.target\.value as 'admin' \| 'teacher' \| 'staff'/g, "role: e.target.value as 'admin' | 'teacher' | 'subject_teacher' | 'staff'");
c = c.replace(/u\.role === 'staff' \? 'Giáo vụ' : 'Giáo viên'/g, "u.role === 'staff' ? 'Giáo vụ' : u.role === 'subject_teacher' ? 'Giáo viên Bộ môn' : 'Giáo viên'");

fs.writeFileSync('src/components/AdminView.tsx', c);
