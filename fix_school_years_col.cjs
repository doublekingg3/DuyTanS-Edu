const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replaceAll("doc(db, 'school_years',", "doc(db, 'schoolYears',");

fs.writeFileSync('src/components/AdminView.tsx', c);
