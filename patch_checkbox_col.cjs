const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(/<th className="px-4 py-3 text-center w-12">\n                  <input\n                    type="checkbox"\n                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"\n                    checked=\{selectedStudentIds\.length > 0 && filteredStudents\.length > 0 && selectedStudentIds\.length === filteredStudents\.length\}\n                    onChange=\{\(e\) => \{\n                      if \(e\.target\.checked\) setSelectedStudentIds\(filteredStudents\.map\(s => s\.id\)\);\n                      else setSelectedStudentIds\(\[\]\);\n                    \}\}\n                  \/>\n                <\/th>/g, 
`{role !== 'subject_teacher' && (
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedStudentIds.length > 0 && filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedStudentIds(filteredStudents.map(s => s.id));
                      else setSelectedStudentIds([]);
                    }}
                  />
                </th>
)}`);

c = c.replace(/<td className="px-4 py-4 text-center">\n                        <input\n                          type="checkbox"\n                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"\n                          checked=\{selectedStudentIds\.includes\(student\.id\)\}\n                          onChange=\{\(e\) => \{\n                            if \(e\.target\.checked\) setSelectedStudentIds\(\[\.\.\.selectedStudentIds, student\.id\]\);\n                            else setSelectedStudentIds\(selectedStudentIds\.filter\(id => id !== student\.id\)\);\n                          \}\}\n                        \/>\n                      <\/td>/g, 
`{role !== 'subject_teacher' && (
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, student.id]);
                            else setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                          }}
                        />
                      </td>
)}`);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
