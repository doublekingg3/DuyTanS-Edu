const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/role: 'admin'\|'teacher'/g, "role: 'admin'|'teacher'|'staff'");
c = c.replace(/role: 'teacher' as 'admin' \| 'teacher'/g, "role: 'teacher' as 'admin' | 'teacher' | 'staff'");
c = c.replace(/role: e\.target\.value as 'admin' \| 'teacher'/g, "role: e.target.value as 'admin' | 'teacher' | 'staff'");
c = c.replace(/role: 'teacher', isHomeroom/g, "role: 'teacher' as any, isHomeroom");

const searchOption = `<option value="admin">Ban Giám Hiệu</option>
                </select>`;
const replaceOption = `<option value="staff">Giáo vụ</option>
                  <option value="admin">Ban Giám Hiệu</option>
                </select>`;
c = c.replace(searchOption, replaceOption);

const searchTableRole = `{u.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'}`;
const replaceTableRole = `{u.role === 'admin' ? 'Ban Giám Hiệu' : u.role === 'staff' ? 'Giáo vụ' : 'Giáo viên'}`;
c = c.replace(searchTableRole, replaceTableRole);

const searchTableClass = `u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'`;
const replaceTableClass = `u.role === 'admin' ? 'bg-purple-50 text-purple-700' : u.role === 'staff' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'`;
c = c.replace(searchTableClass, replaceTableClass);

// Fix roleRaw during import
c = c.replace(/roleRaw === 'admin' \? 'admin' : 'teacher'/g, "roleRaw === 'admin' ? 'admin' : roleRaw === 'staff' ? 'staff' : 'teacher'");

fs.writeFileSync('src/components/AdminView.tsx', c);
