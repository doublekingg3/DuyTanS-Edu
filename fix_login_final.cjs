const fs = require('fs');
const file = 'src/components/Login.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /(<button\s*type="submit"[\s\S]*?<\/button>\s*)\{(selectedRole === 'admin' \|\| selectedRole === 'teacher') && \(/;

const insert = `{selectedRole === 'parent' && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong>Tài Khoản Demo</strong><br/>
                  Phụ huynh đăng nhập theo mẫu: <strong>năm học-stt</strong><br/>
                  Ví dụ: <strong>20252026-001</strong>
                </p>
              </div>
            )}
            
            {`;

code = code.replace(regex, "$1" + insert + "$2 && (");
fs.writeFileSync(file, code);
