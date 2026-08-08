const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

code = code.replace(
  "classes: SchoolClass[]",
  "classes: SchoolClass[],\n  schoolYears: SchoolYear[]"
);

code = code.replace(
  "  classes\n}: {",
  "  classes,\n  schoolYears\n}: {"
);

fs.writeFileSync('src/components/TeacherStudents.tsx', code);
