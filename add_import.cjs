const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');
content = content.replace(
  "import { db } from '../lib/firebase';",
  "import { db } from '../lib/firebase';\nimport { defaultDb } from '../lib/firebase_default';"
);
fs.writeFileSync('src/components/AdminView.tsx', content);
