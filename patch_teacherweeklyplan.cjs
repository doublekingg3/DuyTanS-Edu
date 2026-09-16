const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(/export default function TeacherWeeklyPlan\(\{ classId, role \}: \{ classId: string, role\?: string \}\) \{/,
`import { useEffect } from 'react';\n\nexport default function TeacherWeeklyPlan({ classId, role, className, schoolYearName }: { classId: string, role?: string, className?: string, schoolYearName?: string }) {`);

const hookSearch = `  const [selectedWeek, setSelectedWeek] = useState(5);
  const [tasks, setTasks] = useState([
    'Chào cờ đầu tuần, sinh hoạt chủ nhiệm phổ biến kế hoạch tuần',
    'Kiểm tra sĩ số, giờ giấc nề nếp và tác phong đồng phục chuẩn Duy Tân',
    'Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày'
  ]);
  const [newTask, setNewTask] = useState('');`;

const hookReplace = `  const [selectedWeek, setSelectedWeek] = useState(5);
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState('');
  
  useEffect(() => {
    // Giả lập load dữ liệu theo classId và selectedWeek
    setTasks([
      'Chào cờ đầu tuần, sinh hoạt chủ nhiệm phổ biến kế hoạch tuần',
      'Kiểm tra sĩ số, giờ giấc nề nếp và tác phong đồng phục chuẩn Duy Tân',
      \`Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày (\${className || ''})\`
    ]);
  }, [classId, className, schoolYearName, selectedWeek]);`;

c = c.replace(hookSearch, hookReplace);

const yearSearch = `<span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">Năm học 2024 - 2025 • 38 tuần</span>`;
const yearReplace = `<span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">Năm học {schoolYearName || '2024 - 2025'} • Lớp {className || 'Chưa chọn lớp'}</span>`;

c = c.replace(yearSearch, yearReplace);

// Remove the injected `import { useEffect } from 'react';` if it's already there or just use React.useEffect.
// Actually, it's safer to use React.useEffect
c = c.replace(/import \{ useEffect \} from 'react';\n\n/, '');
c = c.replace(/useEffect\(/g, 'React.useEffect(');

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
