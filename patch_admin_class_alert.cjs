const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const s = "const docRef = doc(db, 'classes', classId);\\n        await deleteDoc(docRef);\\n        showAlert('Xóa tài khoản thành công.', 'success');";
const r = "const docRef = doc(db, 'classes', classId);\\n        await deleteDoc(docRef);\\n        showAlert('Xóa lớp học thành công.', 'success');";

c = c.replace(s, r);
fs.writeFileSync('src/components/AdminView.tsx', c);
