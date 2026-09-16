const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const searchClasses = `const allowedClasses = classes?.filter(c => 
    (role === 'admin' || role === 'staff' || 
     user?.homeroomClasses?.includes(c.id) || 
     user?.subjectClasses?.includes(c.id) ||
     c.homeroomTeacher === user?.fullName) &&
    (!selectedYearId || c.schoolYearId === selectedYearId)
  ) || [];`;

const replaceClasses = `const allowedClasses = classes?.filter(c => 
    (role === 'admin' || role === 'staff' || 
     user?.homeroomClasses?.includes(c.id) || 
     user?.subjectClasses?.includes(c.id) ||
     c.homeroomTeacher === user?.fullName) &&
    (!selectedYearId || c.schoolYearId === selectedYearId || (!c.schoolYearId && selectedYearId === (schoolYears && schoolYears.length > 0 ? schoolYears[schoolYears.length - 1].id : '')))
  ) || [];`;
c = c.replace(searchClasses, replaceClasses);

const searchOptions = `{allowedClasses.length > 0 ? (
                    allowedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {user?.homeroomClasses?.includes(c.id) || c.homeroomTeacher === user?.fullName ? '(GVCN)' : '(GVBM)'}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có lớp phân công</option>
                  )}`;

const replaceOptions = `{allowedClasses.length > 0 ? (
                    allowedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {(role === 'admin' || role === 'staff') ? '' : (user?.homeroomClasses?.includes(c.id) || c.homeroomTeacher === user?.fullName ? '(GVCN)' : '(GVBM)')}
                      </option>
                    ))
                  ) : (
                    <option value="">{(role === 'admin' || role === 'staff') ? 'Chưa có lớp nào' : 'Không có lớp phân công'}</option>
                  )}`;
c = c.replace(searchOptions, replaceOptions);

fs.writeFileSync('src/components/TeacherView.tsx', c);
