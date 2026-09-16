const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

// 1. Add "Thời khoá biểu" to menuItems
const menuItemsRegex = /const menuItems = \[\s*\{ id: "overview", icon: LayoutDashboard, label: "Tổng quan" \},\s*\.\.\.\(role !== 'staff' \? \[\{ id: "students", icon: Users, label: "Danh sách lớp" \}\] : \[\]\),\s*\.\.\.\(role !== 'staff' \? \[\{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" \}\] : \[\]\),/g;
const menuItemsReplacement = `const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' ? [{ id: "schedule", icon: CalendarIcon, label: "Thời khoá biểu" }] : []),
    ...(role !== 'staff' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),`;

c = c.replace(menuItemsRegex, menuItemsReplacement);

// 2. Add the component rendering below {activeMenu === 'students'}
const studentsRenderRegex = /\{activeMenu === 'students' && \(\s*<TeacherStudents\s*students=\{filteredStudents\}\s*classId=\{selectedClassId\}\s*classes=\{classes\}\s*onAddComment=\{onAddComment\}/g;
const studentsRenderReplacement = `{activeMenu === 'schedule' && (
          <TeacherSchedule classId={selectedClassId} />
        )}
        {activeMenu === 'students' && (
          <TeacherStudents 
            students={filteredStudents}
            classId={selectedClassId}
            classes={classes}
            onAddComment={onAddComment}`;

c = c.replace(studentsRenderRegex, studentsRenderReplacement);

fs.writeFileSync('src/components/TeacherView.tsx', c);
