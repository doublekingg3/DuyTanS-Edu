const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

const adminViewReplace = `{activeMenu.startsWith('admin_') && (
          role === 'admin' && users && settings ? (
             <div className="p-6 h-full overflow-auto">
                <AdminView 
                  classes={classes || []} 
                  students={students} 
                  users={users} 
                  schoolYears={schoolYears || []} 
                  settings={settings} 
                  externalActiveTab={
                    activeMenu === 'admin_classes' ? 'classes' :
                    activeMenu === 'admin_school_years' ? 'school_years' :
                    activeMenu === 'admin_accounts' ? 'accounts' :
                    activeMenu === 'admin_reports' ? 'reports' :
                    undefined
                  }
                />
             </div>
          ) : (
             <div className="p-8"><p>Không có quyền truy cập.</p></div>
          )
        )}`;

c = c.replace(/\{activeMenu\.startsWith\('admin_'\).*?<\/\p><\/div>\n          \)\n        \)\}/s, adminViewReplace);
fs.writeFileSync('src/components/TeacherView.tsx', c);
