const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const searchWeekly = `<TeacherWeeklyPlan classId={selectedClassId} role={role} />`;
const replaceWeekly = `<TeacherWeeklyPlan 
            classId={selectedClassId} 
            role={role} 
            className={allowedClasses.find(c => c.id === selectedClassId)?.name}
            schoolYearName={schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId || selectedYearId))?.name || 'Không xác định'}
          />`;

c = c.replace(searchWeekly, replaceWeekly);

const searchLunch = `<TeacherLunchMenu classId={selectedClassId} role={role} />`;
const replaceLunch = `<TeacherLunchMenu 
            classId={selectedClassId} 
            role={role} 
          />`;

fs.writeFileSync('src/components/TeacherView.tsx', c);
