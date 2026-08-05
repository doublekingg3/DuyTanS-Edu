const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold font-display tracking-tight">{student.fullName}</h1>
              <p className="text-indigo-100 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <BookOpen className="w-4 h-4" /> Lớp {student.classId || '10QT3A'} | {student.gender} | {student.ethnicity}
              </p>
            </div>`;

const replaceStr = `            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold font-display tracking-tight">{student.fullName}</h1>
              <div className="text-indigo-100 mt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> 
                  <span>{student.gender} | {student.ethnicity}</span>
                </div>
                
                {studentHistory.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                    <Calendar className="w-4 h-4" />
                    <select 
                      value={selectedHistoryId}
                      onChange={e => setSelectedHistoryId(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer appearance-none pr-4 font-medium"
                    >
                      {studentHistory.map(hist => {
                        const histClass = classes.find(c => c.id === hist.classId);
                        const histYear = schoolYears.find(y => y.id === histClass?.schoolYearId);
                        return (
                          <option key={hist.id} value={hist.id} className="text-slate-800">
                            Lớp {histClass?.name || hist.classId} {histYear ? \`(\${histYear.name})\` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
