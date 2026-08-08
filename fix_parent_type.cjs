const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "useState<'grades' | 'notifications' | 'attendance'>",
  "useState<'grades' | 'notifications' | 'attendance' | 'history'>"
);

fs.writeFileSync(file, code);
