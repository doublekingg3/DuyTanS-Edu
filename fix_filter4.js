import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetStr = `  const filteredClasses = classes.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (classFilterYear ? c.schoolYearId === classFilterYear : true)
  );`;

const replacementStr = `  const filteredClasses = classes.filter(c => 
    ((c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
    (c.homeroomTeacher || '').toLowerCase().includes((searchTerm || '').toLowerCase())) &&
    (classFilterYear ? c.schoolYearId === classFilterYear : true)
  );`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AdminView.tsx', code);
