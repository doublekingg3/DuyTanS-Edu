const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

code = code.replace(
  "onDeleteStudent={onDeleteStudent}\n          />",
  "onDeleteStudent={onDeleteStudent}\n            schoolYears={schoolYears}\n          />"
);

fs.writeFileSync('src/components/TeacherView.tsx', code);
