const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  /await deleteDoc\(docRef\);\s*}\s*catch/g,
  `await deleteDoc(docRef);
        showAlert('Xóa tài khoản thành công.', 'success');
      } catch`
);

fs.writeFileSync('src/components/AdminView.tsx', c);
