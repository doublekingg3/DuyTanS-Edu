const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

c = c.replace(
  "  const [tasks, setTasks] = useState<string[]>([]);\n  const [newTask, setNewTask] = useState('');\n  \n  React.useEffect(() => {\n    // Giả lập load dữ liệu theo classId và selectedWeek\n    setTasks([\n      'Chào cờ đầu tuần, sinh hoạt chủ nhiệm phổ biến kế hoạch tuần',\n      'Kiểm tra sĩ số, giờ giấc nề nếp và tác phong đồng phục chuẩn Duy Tân',\n      `Đôn đốc ban cán sự lớp tổng hợp điểm thi đua hàng ngày (${className || ''})`\n    ]);\n  }, [classId, className, schoolYearName, selectedWeek]);",
  "  const [newTask, setNewTask] = useState('');\n  const currentWeekData = weeks.find(w => w.id === selectedWeek);\n  const tasks = currentWeekData?.tasks || [];"
);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
