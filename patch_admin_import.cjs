const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "await addDoc(collection(db, 'users'), userData);",
  "await setDoc(doc(db, 'users', userData.id), userData);"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
