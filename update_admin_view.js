import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Add classFilterYear state
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [classFilterYear, setClassFilterYear] = useState('');"
);

// 2. Update filteredClasses
const oldFilteredClasses = `
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  );
`;
const newFilteredClasses = `
  const filteredClasses = classes.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (classFilterYear ? c.schoolYearId === classFilterYear : true)
  );
`;
code = code.replace(oldFilteredClasses.trim(), newFilteredClasses.trim());

// 3. Update Classes Table search/filter UI
const oldClassesTableSearch = `
        {/* Classes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
`;
const newClassesTableSearch = `
        {/* Classes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex gap-4 w-full sm:w-auto flex-col sm:flex-row">
              <div className="relative w-full sm:w-72">
`;
code = code.replace(oldClassesTableSearch.trim(), newClassesTableSearch.trim());

const oldClassesTableSearchInput = `
              <input 
                type="text" 
                placeholder="Tìm kiếm lớp, giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
`;
const newClassesTableSearchInput = `
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
`;
code = code.replace(oldClassesTableSearchInput.trim(), newClassesTableSearchInput.trim());

// 4. Update School Years Table Headers
const oldYearsHeader = `
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
`;
const newYearsHeader = `
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Tên Năm học</th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Số lượng Lớp</th>
                    <th className="px-6 py-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-right">Thao tác</th>
`;
code = code.replace(oldYearsHeader.trim(), newYearsHeader.trim());

// 5. Update School Years Table Body
const oldYearsBody = `
                        <td className="px-6 py-4 border-b border-slate-50">
                          <span className="font-bold text-slate-800">{y.name}</span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-right">
`;
const newYearsBody = `
                        <td className="px-6 py-4 border-b border-slate-50">
                          <span className="font-bold text-slate-800">{y.name}</span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                          <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">{classes.filter(c => c.schoolYearId === y.id).length}</span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 text-right">
`;
code = code.replace(oldYearsBody.trim(), newYearsBody.trim());

// 6. Fix disabled styling for Năm học select in Add/Edit Class Modal
const oldSelectClass = `className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  disabled={!!editingClass}`;
const newSelectClass = `className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  disabled={!!editingClass}`;
code = code.replace(oldSelectClass, newSelectClass);

fs.writeFileSync('src/components/AdminView.tsx', code);
