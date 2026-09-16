const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const search = `const allowedClasses = classes?.filter(c => 
    (user?.homeroomClasses?.includes(c.id) || 
    user?.subjectClasses?.includes(c.id) ||
    c.homeroomTeacher === user?.fullName) && // fallback for old data
    (!selectedYearId || c.schoolYearId === selectedYearId)
  ) || [];`;

const replace = `const allowedClasses = classes?.filter(c => 
    (role === 'admin' || role === 'staff' || 
     user?.homeroomClasses?.includes(c.id) || 
     user?.subjectClasses?.includes(c.id) ||
     c.homeroomTeacher === user?.fullName) &&
    (!selectedYearId || c.schoolYearId === selectedYearId)
  ) || [];`;

c = c.replace(search, replace);
fs.writeFileSync('src/components/TeacherView.tsx', c);
