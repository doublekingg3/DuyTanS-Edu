const fs = require('fs');
const file = 'src/components/Login.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\\n');

let index = lines.findIndex(line => line.includes("{(selectedRole === 'admin' || selectedRole === 'teacher') && (") && line.includes("Gợi ý"));
if (index === -1) {
  index = 191; // roughly there
}

const insert = `{selectedRole === 'parent' && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong>Tài Khoản Demo</strong><br/>
                  Phụ huynh đăng nhập theo mẫu: <strong>năm học-stt</strong><br/>
                  Ví dụ: <strong>20252026-001</strong>
                </p>
              </div>
            )}`;

// let's just do string replace on the button closing tag
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  "</button>\\n            \\n            {(selectedRole === 'admin' || selectedRole === 'teacher') && (",
  "</button>\\n\\n            " + insert + "\\n\\n            {(selectedRole === 'admin' || selectedRole === 'teacher') && ("
);

fs.writeFileSync(file, code);
