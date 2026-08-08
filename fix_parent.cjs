const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

const historyButton = `          <button 
            className={\`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 \${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}\`}
            onClick={() => setActiveTab('history')}
          >
            <BookOpen className="w-4 h-4" /> Lịch sử học tập
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>`;

code = code.replace(/<\/div>\n\n        {\/\* Tab Content \*\/}/, historyButton + '\n\n        {/* Tab Content */}');

const historyContent = `
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Lịch sử các năm học trước
                </h3>
              </div>
              <div className="p-0">
                {!student.historicalRecords || student.historicalRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Không có dữ liệu lịch sử năm học cũ.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {student.historicalRecords.map((record, index) => (
                      <div key={index} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-slate-800">Lớp {record.className || 'Không xác định'}</h4>
                            <p className="text-sm text-slate-500 mt-1">Dữ liệu lưu trữ năm học trước</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-medium rounded-full text-sm">
                              HL: {record.academicPerformance || 'Chưa đánh giá'}
                            </span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 font-medium rounded-full text-sm">
                              HK: {record.conduct || 'Chưa đánh giá'}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-100/50 text-slate-600 text-xs uppercase font-medium">
                              <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Môn học</th>
                                <th className="px-4 py-3 text-center">TBM HK1</th>
                                <th className="px-4 py-3 text-center">TBM HK2</th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">TBM Cả năm</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {Object.keys(record.grades || {}).map((subjectKey) => (
                                <tr key={subjectKey}>
                                  <td className="px-4 py-3 font-medium text-slate-700">
                                    {getSubjectName(subjectKey as keyof Grades) || subjectKey}
                                  </td>
                                  <td className="px-4 py-3 text-center text-slate-600 font-medium">
                                    {(record.term1Grades && record.term1Grades[subjectKey as keyof Grades]) || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-center text-slate-600 font-medium">
                                    {(record.term2Grades && record.term2Grades[subjectKey as keyof Grades]) || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-center text-indigo-600 font-bold">
                                    {(record.yearGrades && record.yearGrades[subjectKey as keyof Grades]) || (record.grades && record.grades[subjectKey as keyof Grades]) || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
`;

code = code.replace(/\{\/\* Tab Content \*\/\}/, '{/* Tab Content */}\n' + historyContent);

fs.writeFileSync(file, code);
