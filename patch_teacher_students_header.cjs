const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const headerButtonsReplaceStr = `        <div className="flex flex-wrap items-center gap-3">
          {selectedStudentIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Xóa {selectedStudentIds.length} HS
            </button>
          )}
          <input`;

c = c.replace(
  "        <div className=\"flex flex-wrap items-center gap-3\">\n          <input",
  headerButtonsReplaceStr
);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
