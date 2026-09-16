const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(
  "<TeacherLunchMenu classId={selectedClassId} role={role} />",
  "<TeacherLunchMenu classId={selectedClassId} role={role} schoolYearName={schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId || selectedYearId))?.name || 'Không xác định'} />"
);

fs.writeFileSync('src/components/TeacherView.tsx', c);
