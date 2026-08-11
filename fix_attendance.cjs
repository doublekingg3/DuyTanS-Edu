const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { Search, MessageSquare, Send, UserCheck, UserX, Clock, Plus, Edit2, Trash2, X, Download, Upload } from 'lucide-react';",
  "import { Search, MessageSquare, Send, UserCheck, UserX, Clock, Plus, Edit2, Trash2, X, Download, Upload, LogOut, Calendar, ChevronDown, PieChart as PieChartIcon } from 'lucide-react';\nimport { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';"
);

// 2. Add attendanceDate state
content = content.replace(
  "const [attendanceModal, setAttendanceModal] = useState",
  "const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);\n  const [attendanceModal, setAttendanceModal] = useState"
);

// 3. Update attendanceModal state type
content = content.replace(
  "status: 'late' | 'absent'",
  "status: 'late' | 'absent' | 'leave_early'"
);

// 4. Update markAttendance function
content = content.replace(
  "const markAttendance = (id: string, status: 'present' | 'absent' | 'late') => {",
  "const markAttendance = (id: string, status: 'present' | 'absent' | 'late' | 'leave_early') => {"
);
content = content.replace(
  "if (status === 'late' || status === 'absent') {",
  "if (status === 'late' || status === 'absent' || status === 'leave_early') {"
);
content = content.replace(
  "const today = new Date().toISOString().split('T')[0];\n    const student = students.find(s => s.id === id);",
  "const today = attendanceDate;\n    const student = students.find(s => s.id === id);"
);

// 5. Update confirmAttendance function
content = content.replace(
  "const confirmAttendance = () => {\n    const today = new Date().toISOString().split('T')[0];",
  "const confirmAttendance = () => {\n    const today = attendanceDate;"
);
content = content.replace(
  "status: attendanceModal.status as 'present' | 'late' | 'absent'",
  "status: attendanceModal.status as 'present' | 'late' | 'absent' | 'leave_early'"
);
content = content.replace(
  "showAlert(\`Đã điểm danh \${attendanceModal.status === 'late' ? 'Đi trễ' : 'Vắng mặt'} và lưu lý do.\`);",
  "showAlert(\`Đã điểm danh \${attendanceModal.status === 'late' ? 'Đi trễ' : attendanceModal.status === 'leave_early' ? 'Xin về' : 'Vắng mặt'} và lưu lý do.\`);"
);

// 6. Fix modal title
content = content.replace(
  "Ghi chú lý do {attendanceModal.status === 'late' ? 'Đi trễ' : 'Vắng mặt'}",
  "Ghi chú lý do {attendanceModal.status === 'late' ? 'Đi trễ' : attendanceModal.status === 'leave_early' ? 'Xin về' : 'Vắng mặt'}"
);


fs.writeFileSync('src/components/TeacherStudents.tsx', content);
