import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetLines = code.split('\n');
const startLine = 480;
const endLine = 491;

const newLines = `              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm lớp, giáo viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={classFilterYear}
                onChange={e => setClassFilterYear(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700"
              >
                <option value="">Tất cả năm học</option>
                {schoolYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
          </div>`.split('\n');

targetLines.splice(startLine - 1, endLine - startLine + 1, ...newLines);

fs.writeFileSync('src/components/AdminView.tsx', targetLines.join('\n'));
