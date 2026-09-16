const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const search = `{activeMenu === 'schedule' && (
          <TeacherSchedule classId={selectedClassId} />
        )}
        </div>`;

const replace = `{activeMenu === 'weekly_plan' && (
          <TeacherWeeklyPlan classId={selectedClassId} />
        )}
        {activeMenu === 'lunch_menu' && (
          <TeacherLunchMenu classId={selectedClassId} />
        )}
        {activeMenu === 'settings' && (
          role === 'admin' && users && settings ? (
             <AdminView classes={classes || []} students={students} users={users} schoolYears={schoolYears || []} settings={settings} />
          ) : (
             <div className="p-8"><p>Cấu hình giáo viên đang được cập nhật.</p></div>
          )
        )}
        </div>`;
        
c = c.replace(search, replace);
fs.writeFileSync('src/components/TeacherView.tsx', c);
