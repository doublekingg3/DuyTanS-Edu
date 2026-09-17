const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const oldMenu = `  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' ? [{ id: "schedule", icon: CalendarIcon, label: "Thời khoá biểu" }] : []),
    ...(role !== 'staff' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),
    { id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" },
    ...adminMenuItems
  ];`;

const newMenu = `  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' && role !== 'subject_teacher' ? [{ id: "grades", icon: BarChart2, label: "Điểm số" }] : []),
    ...(role !== 'staff' && role !== 'subject_teacher' ? [{ id: "schedule", icon: CalendarIcon, label: "Thời khoá biểu" }] : []),
    ...(role !== 'staff' && role !== 'subject_teacher' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),
    ...(role !== 'subject_teacher' ? [{ id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" }] : []),
    ...adminMenuItems
  ];`;

c = c.replace(oldMenu, newMenu);

// Fix role passing to TeacherStudents
c = c.replace(/<TeacherStudents \n            students=\{filteredStudents\}\n            classId=\{selectedClassId\}\n            classes=\{classes\}\n            onAddComment=\{onAddComment\}/g, `<TeacherStudents \n            role={role}\n            students={filteredStudents}\n            classId={selectedClassId}\n            classes={classes}\n            onAddComment={onAddComment}`);

fs.writeFileSync('src/components/TeacherView.tsx', c);
