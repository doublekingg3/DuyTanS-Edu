const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "  const filteredClasses = classes.filter(c => \n    ((c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || \n    (c.homeroomTeacher || '').toLowerCase().includes((searchTerm || '').toLowerCase())) &&\n    (classFilterYear ? c.schoolYearId === classFilterYear : true)\n  );",
  "  const activeClasses = classes.filter(c => !c.isDeleted);\n  const deletedClasses = classes.filter(c => c.isDeleted);\n  const filteredClasses = activeClasses.filter(c => \n    ((c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || \n    (c.homeroomTeacher || '').toLowerCase().includes((searchTerm || '').toLowerCase())) &&\n    (classFilterYear ? c.schoolYearId === classFilterYear : true)\n  );"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
