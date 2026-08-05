const fs = require('fs');
const file = 'src/components/Portal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "export default function Portal({ onSelectEduManager }: { onSelectEduManager: () => void }) {",
  "export default function Portal({ onSelectEduManager, onSelectTkb }: { onSelectEduManager: () => void, onSelectTkb: () => void }) {"
);

code = code.replace(
  /onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*window\.open\('https:\/\/example\.com\/tkb', '_blank'\); \/\/ Update this link to the actual TKB system later\s*\}\}/g,
  "onClick={(e) => {\n              e.preventDefault();\n              onSelectTkb();\n            }}"
);

fs.writeFileSync(file, code);
