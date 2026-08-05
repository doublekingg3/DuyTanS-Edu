const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  const currentViewStudent = useMemo(() => {
    return studentHistory.find(s => s.id === selectedHistoryId) || initialStudent;
  }, [selectedHistoryId, studentHistory, initialStudent]);`;

const replaceStr = `  const currentViewStudent = useMemo(() => {
    return studentHistory.find(s => s.id === selectedHistoryId) || initialStudent;
  }, [selectedHistoryId, studentHistory, initialStudent]);

  const student = currentViewStudent;`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
