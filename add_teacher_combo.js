import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Add states for teacher dropdown
const stateToAdd = `
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
`;

code = code.replace(
  "const [formData, setFormData] = useState({",
  stateToAdd.trim() + "\n  const [formData, setFormData] = useState({"
);

// 2. Replace the old homeroomTeacher input with a custom dropdown
const oldTeacherInput = `
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giáo viên Chủ nhiệm <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.homeroomTeacher}
                  onChange={e => setFormData({...formData, homeroomTeacher: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>
`;

const newTeacherInput = `
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Giáo viên Chủ nhiệm <span className="text-red-500">*</span></label>
                <div 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all flex items-center bg-white cursor-pointer"
                  onClick={() => setShowTeacherDropdown(true)}
                >
                  <span className="flex-1 text-slate-700">{formData.homeroomTeacher || 'Chọn Giáo viên Chủ nhiệm...'}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>

                {showTeacherDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTeacherDropdown(false)}></div>
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
                      <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            autoFocus
                            placeholder="Tìm tên hoặc mã giáo viên..."
                            value={teacherSearchTerm}
                            onChange={e => setTeacherSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {users
                          .filter(u => u.role === 'teacher')
                          .filter(u => u.fullName.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || u.username.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
                          .map(teacher => (
                            <div 
                              key={teacher.id}
                              className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onClick={() => {
                                setFormData({...formData, homeroomTeacher: teacher.fullName});
                                setShowTeacherDropdown(false);
                                setTeacherSearchTerm('');
                              }}
                            >
                              <div className="font-medium text-slate-800 text-sm">{teacher.fullName}</div>
                              <div className="text-xs text-slate-500">Mã GV: {teacher.username}</div>
                            </div>
                          ))}
                        {users.filter(u => u.role === 'teacher' && (u.fullName.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || u.username.toLowerCase().includes(teacherSearchTerm.toLowerCase()))).length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-slate-500">
                            Không tìm thấy giáo viên nào.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
`;

code = code.replace(oldTeacherInput.trim(), newTeacherInput.trim());

fs.writeFileSync('src/components/AdminView.tsx', code);
