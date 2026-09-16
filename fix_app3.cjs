const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const newLines = `        {role === 'admin' || role === 'teacher' ? (
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
        ) : (`;

lines.splice(384, 18, newLines); // From line 385 to 402 is 18 lines. Let's just slice it properly.
// Better: 
