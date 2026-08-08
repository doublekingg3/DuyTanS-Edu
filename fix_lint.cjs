const fs = require('fs');

const file1 = 'src/components/TeacherGrades.tsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(
  /import \{ FileDown, FileUp, Save, Search, UserCircle, Calculator, Info, Filter, ArrowUpDown, ChevronDown, Check, Star \} from 'lucide-react';/,
  "import { FileDown, FileUp, Save, Search, UserCircle, Calculator, Info, Filter, ArrowUpDown, ChevronDown, Check, Star, Settings2 } from 'lucide-react';"
);
fs.writeFileSync(file1, content1);

const file2 = 'src/components/TeacherStudents.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(
  /import \{ Student, getSubjectName, Grades, SchoolClass \} from '\.\.\/data';/,
  "import { Student, getSubjectName, Grades, SchoolClass, SchoolYear } from '../data';"
);
fs.writeFileSync(file2, content2);
