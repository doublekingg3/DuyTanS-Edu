const fs = require('fs');
const file = 'src/components/TeacherGrades.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldRender = `<td className="px-4 py-3 text-center bg-indigo-50/30">
                          <span className={\`px-2 py-1 text-[10px] font-black rounded uppercase \${student.rank === 'Giỏi' ? 'bg-green-100 text-green-700' : student.rank === 'Khá' ? 'bg-blue-100 text-blue-700' : student.rank === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}\`}>
                            {student.rank}
                          </span>
                        </td>`;

const newRender = `<td className="px-4 py-3 text-center bg-indigo-50/30 flex justify-center items-center gap-1 min-w-[120px]">
                          <span className={\`px-2 py-1 text-[10px] font-black rounded uppercase \${student.rank === 'Xuất sắc' ? 'bg-purple-100 text-purple-700' : student.rank === 'Giỏi' ? 'bg-green-100 text-green-700' : student.rank === 'Khá' ? 'bg-blue-100 text-blue-700' : student.rank === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}\`}>
                            {student.rank}
                          </span>
                          {student.baseRank === 'Giỏi' && (
                            <button
                              onClick={() => {
                                const field = periodType === 'term2' ? 'term2IsExcellent' : periodType === 'term1' ? 'term1IsExcellent' : 'yearIsExcellent';
                                onUpdateGrade(student.id, field, student.rank !== 'Xuất sắc');
                              }}
                              className={\`p-1 rounded-full transition-colors \${student.rank === 'Xuất sắc' ? 'text-amber-500 hover:bg-amber-100' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}\`}
                              title={student.rank === 'Xuất sắc' ? 'Bỏ Đánh dấu Xuất Sắc' : 'Đánh dấu Xuất Sắc'}
                            >
                              <Star className={\`w-4 h-4 \${student.rank === 'Xuất sắc' ? 'fill-current' : ''}\`} />
                            </button>
                          )}
                        </td>`;

content = content.replace(oldRender, newRender);

fs.writeFileSync(file, content);
