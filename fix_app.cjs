const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const oldRender = `{role === 'admin' ? (
          <AdminView classes={classes} students={students} users={users} schoolYears={schoolYears} settings={settings} />
        ) : role === 'teacher' ? (
          <TeacherView 
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

const newRender = `{role === 'admin' || role === 'teacher' ? (
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

c = c.replace(oldRender, newRender);
fs.writeFileSync('src/App.tsx', c);
