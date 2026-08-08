const fs = require('fs');
const file = 'src/components/TeacherGrades.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{ (.*?) \} from 'lucide-react';/,
  "import { $1, Star } from 'lucide-react';"
);

fs.writeFileSync(file, content);
