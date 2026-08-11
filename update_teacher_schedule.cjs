const fs = require('fs');
const file = 'src/components/TeacherView.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import TeacherSchedule from './TeacherSchedule';`;
content = content.replace("import TeacherGrades from './TeacherGrades';", "import TeacherGrades from './TeacherGrades';\n" + importStatement);

const scheduleBlock = `
        {activeMenu === 'schedule' && (
          <TeacherSchedule classId={selectedClassId} />
        )}`;

content = content.replace(`        {activeMenu === 'schedule' && (
          <div className="p-8 h-full flex items-center justify-center text-slate-400 flex-col">
            <CalendarIcon className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Tính năng Thời khóa biểu đang được cập nhật</p>
          </div>
        )}`, scheduleBlock);

fs.writeFileSync(file, content);
