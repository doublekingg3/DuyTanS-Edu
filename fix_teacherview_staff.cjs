const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');
const search = `  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    { id: "students", icon: Users, label: "Danh sách lớp" },
    { id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" },
    { id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" }
  ];`;

const replace = `  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),
    { id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" }
  ];`;
  
c = c.replace(search, replace);

// Also pass role to LunchMenu and WeeklyPlan
const searchComponents = `{activeMenu === 'weekly_plan' && (
          <TeacherWeeklyPlan classId={selectedClassId} />
        )}
        {activeMenu === 'lunch_menu' && (
          <TeacherLunchMenu classId={selectedClassId} />
        )}`;
const replaceComponents = `{activeMenu === 'weekly_plan' && (
          <TeacherWeeklyPlan classId={selectedClassId} role={role} />
        )}
        {activeMenu === 'lunch_menu' && (
          <TeacherLunchMenu classId={selectedClassId} role={role} />
        )}`;

c = c.replace(searchComponents, replaceComponents);

fs.writeFileSync('src/components/TeacherView.tsx', c);
