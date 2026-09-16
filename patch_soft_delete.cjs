const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "await updateDoc(docRef, { isDeleted: true });",
  "await setDoc(docRef, { isDeleted: true }, { merge: true });"
);

c = c.replace(
  "batch.update(docRef, { isDeleted: true });",
  "batch.set(docRef, { isDeleted: true }, { merge: true });"
);

c = c.replace(
  "await updateDoc(doc(db, 'users', u.id), { isDeleted: false });",
  "await setDoc(doc(db, 'users', u.id), { isDeleted: false }, { merge: true });"
);

c = c.replace(
  "batch.update(doc(db, 'users', id), { isDeleted: false });",
  "batch.set(doc(db, 'users', id), { isDeleted: false }, { merge: true });"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
