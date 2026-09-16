const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const search = `                  {selectedStudentForDetails.parentInfo ? (
                    <div className="space-y-1 mt-2">
                      <p className="text-sm"><span className="text-slate-500">Họ tên:</span> <span className="font-medium text-slate-800">{selectedStudentForDetails.parentInfo.name}</span></p>
                      <p className="text-sm"><span className="text-slate-500">SĐT:</span> <span className="font-medium text-slate-800">{selectedStudentForDetails.parentInfo.phone}</span></p>
                      <p className="text-sm"><span className="text-slate-500">Mã liên kết:</span> <span className="font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">{selectedStudentForDetails.parentInfo.linkCode}</span></p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic mt-2">Chưa có thông tin phụ huynh.</p>
                  )}`;

const replace = `<p className="text-sm text-slate-500 italic mt-2">Tính năng đang phát triển.</p>`;

c = c.replace(search, replace);
fs.writeFileSync('src/components/TeacherStudents.tsx', c);
