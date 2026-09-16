const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /{role === 'admin' \? \([\s\S]*?<ParentView studentId={parentStudentId} \/>\n        \)}/m;

const newContent = `{role === 'admin' || role === 'teacher' ? (
          <TeacherView 
            role={role}
            users={users}
            settings={settings}
            students={students}
            classes={classes}
            user={users.find(u => u.id === loggedInUserId)}
            schoolYears={schoolYears}
            onAddComment={handleAddComment}
            onSendNotification={handleSendNotification}
            onAddStudent={handleAddStudent}
            onAddMultipleStudents={handleAddMultipleStudents}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateGrade={handleUpdateGrade}
            onUpdateMultipleGrades={handleUpdateMultipleGrades}
          />
        ) : (
          <ParentView studentId={parentStudentId} />
        )}`;

c = c.replace(regex, newContent);
fs.writeFileSync('src/App.tsx', c);
