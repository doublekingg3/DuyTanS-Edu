const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

// replace " student " with " currentViewStudent " in function requestAiReview
code = code.replace(/body: JSON\.stringify\(\{ student, periodType, adminInfo \}\)/, 'body: JSON.stringify({ student: currentViewStudent, periodType, adminInfo })');

fs.writeFileSync(file, code);
