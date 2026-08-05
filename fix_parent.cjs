const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  const [activeTab, setActiveTab] = useState<'grades' | 'notifications' | 'attendance'>('grades');
  const [periodType, setPeriodType] = useState<PeriodType>('year');`;

const replaceStr = `  const [activeTab, setActiveTab] = useState<'grades' | 'notifications' | 'attendance'>('grades');
  const [periodType, setPeriodType] = useState<PeriodType>('year');
  
  // Find all historical records for this student based on their unique code
  const studentHistory = useMemo(() => {
    if (!student?.code) return [student];
    return allStudents.filter(s => s.code === student.code);
  }, [student, allStudents]);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string>(student.id);
  
  // Keep selectedHistoryId in sync if the main student prop changes
  useEffect(() => {
    setSelectedHistoryId(student.id);
  }, [student.id]);
  
  const currentViewStudent = useMemo(() => {
    return studentHistory.find(s => s.id === selectedHistoryId) || student;
  }, [selectedHistoryId, studentHistory, student]);
`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
