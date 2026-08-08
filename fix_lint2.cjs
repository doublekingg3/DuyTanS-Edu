const fs = require('fs');

const file1 = 'src/components/TeacherGrades.tsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(
  /import \{ Download, FileSpreadsheet, Upload, Calendar, Clock, BookOpen, Medal, Calculator, AlertCircle, AlertTriangle, AlertOctagon, Star \} from 'lucide-react';/,
  "import { Download, FileSpreadsheet, Upload, Calendar, Clock, BookOpen, Medal, Calculator, AlertCircle, AlertTriangle, AlertOctagon, Star, Settings2 } from 'lucide-react';"
);
fs.writeFileSync(file1, content1);
