const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
  "const loadedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));",
  "const loadedStudents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));"
);

c = c.replace(
  "const loadedClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolClass));",
  "const loadedClasses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SchoolClass));"
);

c = c.replace(
  "const loadedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));",
  "const loadedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserAccount));"
);

c = c.replace(
  "const loadedYears = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));",
  "const loadedYears = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SchoolYear));"
);

fs.writeFileSync('src/App.tsx', c);
