const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/<TeacherWeeklyPlan \n\s*classId=\{selectedClassId\} \n\s*role=\{role\} \n\s*className=\{allowedClasses\.find\(c => c\.id === selectedClassId\)\?\.name\}\n\s*schoolYearName=\{schoolYears\?\.find\(y => y\.id === \(allowedClasses\.find\(c => c\.id === selectedClassId\)\?\.schoolYearId \|\| selectedYearId\)\)\?\.name \|\| 'Không xác định'\}\n\s*\/>/m,
`<TeacherWeeklyPlan 
            classId={selectedClassId} 
            role={role} 
            className={allowedClasses.find(c => c.id === selectedClassId)?.name}
            schoolYearName={schoolYears?.find(y => y.id === (allowedClasses.find(c => c.id === selectedClassId)?.schoolYearId || selectedYearId))?.name || 'Không xác định'}
            teacherName={user?.fullName}
          />`);

fs.writeFileSync('src/components/TeacherView.tsx', c);
