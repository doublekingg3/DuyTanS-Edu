import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// The class modal end is broken from line 926 (Phân ban select)
const brokenSectionRegex = /<option value="Xã Hội">Xã Hội<\/option>\n\s*<\/select>\n\s*<\/div><\/div>[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;

const fixedClassModalEnd = `
                  <option value="Xã Hội">Xã Hội</option>
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveClass}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(brokenSectionRegex, fixedClassModalEnd.trim());

// Now append the user Modal UI correctly
// I need to find the `role` select inside the User modal and insert the new UI after it.
const userModalRoleSelectRegex = /<option value="teacher">Giáo viên<\/option>\n\s*<option value="admin">Ban Giám Hiệu \(Admin\)<\/option>\n\s*<\/select>\n\s*<\/div>\n\s*<\/div>\n\s*<div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">/;

const userModalUI = `
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Ban Giám Hiệu (Admin)</option>
                </select>
              </div>
              {userFormData.role === 'teacher' && (
                <div className="col-span-1 border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-semibold text-slate-800">Phân công chuyên môn</h4>
                    <div className="flex-1"></div>
                    <div className="w-1/2">
                      <select
                        value={userAssignmentYear}
                        onChange={e => setUserAssignmentYear(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="">-- Tất cả năm học --</option>
                        {schoolYears.map(y => (
                          <option key={y.id} value={y.id}>{y.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl space-y-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userFormData.isHomeroom} 
                        onChange={e => setUserFormData({...userFormData, isHomeroom: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Là Giáo viên Chủ nhiệm (GVCN)</span>
                    </label>
                    {userFormData.isHomeroom && (
                      <div className="ml-6">
                        <select
                          multiple
                          value={userFormData.homeroomClasses}
                          onChange={e => {
                            const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                            setUserFormData({...userFormData, homeroomClasses: values});
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                        >
                          {classes.filter(c => !userAssignmentYear || c.schoolYearId === userAssignmentYear).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều lớp</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userFormData.isSubject} 
                        onChange={e => setUserFormData({...userFormData, isSubject: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Là Giáo viên Bộ môn (GVBM)</span>
                    </label>
                    {userFormData.isSubject && (
                      <div className="ml-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                          <div className="flex flex-wrap gap-2">
                            {['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'GDCD', 'Tin Học', 'Thể Dục', 'Công Nghệ'].map(subject => (
                              <label key={subject} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                                <input 
                                  type="checkbox"
                                  checked={userFormData.subjects.includes(subject)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setUserFormData({...userFormData, subjects: [...userFormData.subjects, subject]});
                                    } else {
                                      setUserFormData({...userFormData, subjects: userFormData.subjects.filter(s => s !== subject)});
                                    }
                                  }}
                                  className="text-indigo-600 focus:ring-indigo-500 rounded-sm w-3.5 h-3.5"
                                />
                                <span className="text-sm font-medium text-slate-700">{subject}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Lớp giảng dạy</label>
                          <select
                            multiple
                            value={userFormData.subjectClasses}
                            onChange={e => {
                              const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                              setUserFormData({...userFormData, subjectClasses: values});
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                          >
                            {classes.filter(c => !userAssignmentYear || c.schoolYearId === userAssignmentYear).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều lớp</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
`;

code = code.replace(userModalRoleSelectRegex, userModalUI.trim());

fs.writeFileSync('src/components/AdminView.tsx', code);
