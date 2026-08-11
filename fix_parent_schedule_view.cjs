const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStr = "import Markdown from 'react-markdown';";
content = content.replace(importStr, "import ParentSchedule from './ParentSchedule';\n" + importStr);

content = content.replace("<ParentSchedule classId={selectedStudent?.classId || ''} />", "<ParentSchedule classId={student?.classId || ''} />");

fs.writeFileSync(file, content);
