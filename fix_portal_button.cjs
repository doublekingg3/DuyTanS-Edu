const fs = require('fs');
const file = 'src/components/Portal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<a\s+href="#"\s+onClick=\{\(e\) => \{\s+e\.preventDefault\(\);\s+onSelectTkb\(\);\s+\}\}/g,
  '<button\n            onClick={onSelectTkb}'
);
code = code.replace(
  /<\/a>/g,
  '</button>'
);

code = code.replace(/p-8/g, 'p-6 sm:p-8');

fs.writeFileSync(file, code);
