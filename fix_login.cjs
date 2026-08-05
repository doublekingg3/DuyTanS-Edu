const fs = require('fs');
const file = 'src/components/Login.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      const parts = studentCode.trim().split('-');
      if (parts.length !== 2) {
        setError('Mã học sinh không hợp lệ. Vui lòng nhập theo định dạng Lớp-STT (VD: 10QT3A-001).');
        return;
      }

      const className = parts[0];
      const sttStr = parts[1];
      const stt = parseInt(sttStr, 10);

      const classObj = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
      if (classObj) {
        const student = students.find(s => s.classId === classObj.id && s.stt === stt);
        if (student) {
          onLogin('parent', student.id);
          return;
        }
      }
      setError('Không tìm thấy học sinh với mã này.');`;

const replaceStr = `      const codeInput = studentCode.trim().toUpperCase();
      
      // Try to find by direct code (e.g., HS-001)
      const studentByCode = students.find(s => s.code?.toUpperCase() === codeInput);
      
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
      
      setError('Không tìm thấy học sinh với mã này. (Nhập mã HS-xxx hoặc Lớp-STT)');`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
