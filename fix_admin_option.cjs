const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const search = `<option value="admin">Ban Giám Hiệu (Admin)</option>`;
const replace = `<option value="staff">Giáo vụ</option>
                  <option value="admin">Ban Giám Hiệu (Admin)</option>`;
c = c.replace(search, replace);
fs.writeFileSync('src/components/AdminView.tsx', c);
