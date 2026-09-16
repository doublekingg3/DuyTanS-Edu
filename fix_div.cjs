const fs = require('fs');
let lines = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8').split('\n');
// We want to find line 252 and remove it (index 251)
// Let's just do a string replace on the exact snippet
let c = lines.join('\n');
c = c.replace("            </div>\n            <div>\n            <div>\n              <label className=\"block text-sm font-medium text-slate-500 mb-2\">Nhà cung cấp/Bếp ăn</label>", 
              "            </div>\n            <div>\n              <label className=\"block text-sm font-medium text-slate-500 mb-2\">Nhà cung cấp/Bếp ăn</label>");
fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
