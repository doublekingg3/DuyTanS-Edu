const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

const parentLoginBlock = `    } else if (selectedRole === 'parent') {
      if (!studentCode.trim()) {
        setError('Vui lòng nhập mã học sinh.');
        return;
      }
      
      const codeInput = studentCode.trim().toUpperCase();
      const codeInputNoHyphen = codeInput.replace(/-/g, '');
      
      // Try to find by direct code (e.g., HS-001 or 20252026-001 or 20252026001)
      const studentByCode = students.find(s => 
        s.code?.toUpperCase() === codeInput || 
        s.code?.toUpperCase() === codeInputNoHyphen
      );
      
      if (studentByCode) {
        onLogin('parent', studentByCode.id);
        return;
      }

      // Fallback for backward compatibility (Lớp-STT)
      const parts = codeInput.split('-');
      if (parts.length === 2) {
        const className = parts[0];
        const stt = parseInt(parts[1], 10);

        const classObj = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
        if (classObj) {
          const student = students.find(s => s.classId === classObj.id && s.stt === stt);
          if (student) {
            onLogin('parent', student.id);
            return;
          }
        }
      }
      
      setError('Không tìm thấy học sinh với mã này. (Nhập mã HS-xxx hoặc Lớp-STT)');
    }`;

const newParentLoginBlock = `    } else if (selectedRole === 'parent') {
      if (!studentCode.trim()) {
        setError('Vui lòng nhập mã học sinh.');
        return;
      }
      if (password !== '12345678' && password !== 'admin') {
        setError('Tài khoản hoặc mật khẩu không đúng.');
        return;
      }
      
      const codeInput = studentCode.trim().toUpperCase();
      const codeInputNoHyphen = codeInput.replace(/-/g, '');
      
      // Try to find by direct code (e.g., HS-001 or 20252026-001 or 20252026001)
      const studentByCode = students.find(s => 
        s.code?.toUpperCase() === codeInput || 
        s.code?.toUpperCase() === codeInputNoHyphen
      );
      
      if (studentByCode) {
        onLogin('parent', studentByCode.id);
        return;
      }

      // Fallback for backward compatibility (Lớp-STT)
      const parts = codeInput.split('-');
      if (parts.length === 2) {
        const className = parts[0];
        const stt = parseInt(parts[1], 10);

        const classObj = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
        if (classObj) {
          const student = students.find(s => s.classId === classObj.id && s.stt === stt);
          if (student) {
            onLogin('parent', student.id);
            return;
          }
        }
      }
      
      setError('Không tìm thấy học sinh với mã này. (Nhập mã HS-xxx hoặc Lớp-STT)');
    }`;

c = c.replace(parentLoginBlock, newParentLoginBlock);

const parentInputBlock = `{selectedRole === 'parent' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Học sinh</label>
                <div className="relative">
                  <UserCircle className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    placeholder="VD: 20252026_0001"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                
              </div>
            )}`;

const newParentInputBlock = `{selectedRole === 'parent' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã Học sinh</label>
                  <div className="relative">
                    <UserCircle className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={studentCode}
                      onChange={e => setStudentCode(e.target.value)}
                      placeholder="VD: 20252026_0001"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}`;

c = c.replace(parentInputBlock, newParentInputBlock);
fs.writeFileSync('src/components/Login.tsx', c);
