const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const code = \`\${studentClass.name}-\${student.stt.toString().padStart(3, '0')}\`;",
  "const code = student.code || \`\${studentClass.name}-\${student.stt.toString().padStart(3, '0')}\`;"
);

code = code.replace(
  /<div className="text-xs text-slate-500">Mã: \{student.id\}<\/div>/g,
  '<div className="text-xs text-slate-500">Mã: {student.code || student.id}</div>'
);

fs.writeFileSync(file, code);
