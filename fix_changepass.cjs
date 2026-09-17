const fs = require('fs');
let c = fs.readFileSync('src/components/ChangePasswordModal.tsx', 'utf8');

c = c.replace(/if \(newPassword\.length < 6\) \{/g, 'if (newPassword.length < 8) {');
c = c.replace(/Mật khẩu mới phải có ít nhất 6 ký tự\./g, 'Mật khẩu mới phải có ít nhất 8 ký tự.');

c = c.replace(/<label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới<\/label>/,
`<label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
              <p className="text-xs text-red-500 font-medium mb-2">* Mật khẩu phải đủ 8 ký tự</p>`);

fs.writeFileSync('src/components/ChangePasswordModal.tsx', c);
