import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetStr = `
            </div>
          </div>

          <div className="overflow-x-auto">
`;
const replacementStr = `
            </div>
          </div>
          </div>

          <div className="overflow-x-auto">
`;

code = code.replace(targetStr, replacementStr);

// Wait, I should also make sure to add the select for year filter!
const searchInputTarget = `
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm lớp, giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          </div>

          <div className="overflow-x-auto">
`;

const searchInputReplacement = `
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
          </div>

          <div className="overflow-x-auto">
`;

code = code.replace(searchInputTarget, searchInputReplacement);
fs.writeFileSync('src/components/AdminView.tsx', code);
