import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const tableHeader = `
                        <th className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/50">Phân quyền</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/50">Lớp phân công</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 bg-slate-50/50 text-right rounded-tr-xl">Thao tác</th>
`;
code = code.replace(
  /<th className="px-6 py-4 font-semibold text-slate-600 bg-slate-50\/50">Phân quyền<\/th>\n\s*<th className="px-6 py-4 font-semibold text-slate-600 bg-slate-50\/50 text-right rounded-tr-xl">Thao tác<\/th>/,
  tableHeader.trim()
);

const tdRole = `
                          <td className="px-6 py-4 border-b border-slate-50">
                            <span className={\`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-semibold text-sm \${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}\`}>
                              {u.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-50">
                            {u.role === 'teacher' && (
                              <div className="text-sm text-slate-600">
                                {u.homeroomClasses && u.homeroomClasses.length > 0 && (
                                  <div className="mb-1"><span className="font-semibold text-indigo-600">GVCN:</span> {u.homeroomClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ')}</div>
                                )}
                                {u.subjectClasses && u.subjectClasses.length > 0 && (
                                  <div><span className="font-semibold text-emerald-600">GVBM:</span> {u.subjectClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ')}</div>
                                )}
                                {(!u.homeroomClasses?.length && !u.subjectClasses?.length) && <span className="text-slate-400 italic">Chưa phân công</span>}
                              </div>
                            )}
                          </td>
`;
code = code.replace(
  /<td className="px-6 py-4 border-b border-slate-50">\n\s*<span className=\{`inline-flex items-center justify-center px-2\.5 py-1 rounded-full font-semibold text-sm \$\{u\.role === 'admin' \? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'\}`\}>\n\s*\{u\.role === 'admin' \? 'Ban Giám Hiệu' : 'Giáo viên'\}\n\s*<\/span>\n\s*<\/td>/,
  tdRole.trim()
);

// We need to also add an empty col in the empty state
code = code.replace(
  '<td colSpan={4} className="px-6 py-8 text-center text-slate-500">',
  '<td colSpan={5} className="px-6 py-8 text-center text-slate-500">'
);

fs.writeFileSync('src/components/AdminView.tsx', code);
