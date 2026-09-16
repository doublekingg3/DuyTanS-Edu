const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const search = `  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'students', icon: Users, label: 'Quản lý học sinh' },
    { id: 'grades', icon: FileSpreadsheet, label: 'Quản lý điểm số' },
    { id: 'schedule', icon: CalendarIcon, label: 'Thời khóa biểu' },
  ];`;

const replace = `  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'students', icon: Users, label: 'Danh sách lớp' },
    { id: 'weekly_plan', icon: ClipboardList, label: 'Kế hoạch tuần' },
    { id: 'lunch_menu', icon: Utensils, label: 'Thực đơn ăn trưa' }
  ];`;

c = c.replace(search, replace);
fs.writeFileSync('src/components/TeacherView.tsx', c);
