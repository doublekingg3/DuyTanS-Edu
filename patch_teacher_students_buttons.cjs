const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(/<button \n            onClick=\{\(\) => setShowAddStudentModal\(true\)\}/g, `{role !== 'subject_teacher' && (<button \n            onClick={() => setShowAddStudentModal(true)}`);

c = c.replace(/title="Tải mẫu Excel \(Dùng để nhập HS mới\)"\n          >\n            <Download className="w-5 h-5" \/>\n          <\/button>/g, `title="Tải mẫu Excel (Dùng để nhập HS mới)"\n          >\n            <Download className="w-5 h-5" />\n          </button>)}`);

// Also need to hide the delete buttons / edit buttons in the table
c = c.replace(/\{selectedStudentIds\.length > 0 && \(/g, `{selectedStudentIds.length > 0 && role !== 'subject_teacher' && (`);

// Table column "Thao tác"
c = c.replace(/<th className="px-4 py-3 text-center">Thao tác<\/th>/g, `{role !== 'subject_teacher' && <th className="px-4 py-3 text-center">Thao tác</th>}`);

// Table td "Thao tác"
c = c.replace(/<td className="px-4 py-4 text-center">\n                        <button\n                          onClick=\{\(e\) => \{\n                            e\.stopPropagation\(\);\n                            onDeleteStudent\(student\.id\);\n                          \}\}\n                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"\n                          title="Xóa học sinh"\n                        >\n                          <Trash2 className="w-4 h-4" \/>\n                        <\/button>\n                      <\/td>/g, 
`{role !== 'subject_teacher' && (
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStudent(student.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
)}`);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
