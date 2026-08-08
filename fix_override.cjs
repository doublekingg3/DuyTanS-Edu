const fs = require('fs');
const file = 'src/components/TeacherGrades.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCompute = `      const isExcellent = periodType === 'term2' ? s.term2IsExcellent : periodType === 'term1' ? s.term1IsExcellent : s.yearIsExcellent;
      
      const baseRank = getRank(avg, currentGrades, visibleSubjects, false);
      const finalRank = getRank(avg, currentGrades, visibleSubjects, isExcellent);

      return {
        ...s,
        displayGrades: currentGrades,
        calculatedAvg: avg,
        rank: finalRank,
        baseRank: baseRank
      };`;

const newCompute = `      const isExcellent = periodType === 'term2' ? s.term2IsExcellent : periodType === 'term1' ? s.term1IsExcellent : s.yearIsExcellent;
      const rankOverride = periodType === 'term2' ? s.term2RankOverride : periodType === 'term1' ? s.term1RankOverride : s.yearRankOverride;
      
      const baseRank = getRank(avg, currentGrades, visibleSubjects, false);
      const calculatedFinalRank = getRank(avg, currentGrades, visibleSubjects, isExcellent);
      
      const finalRank = rankOverride ? rankOverride : calculatedFinalRank;

      return {
        ...s,
        displayGrades: currentGrades,
        calculatedAvg: avg,
        rank: finalRank,
        baseRank: baseRank,
        rankOverride: rankOverride
      };`;

content = content.replace(oldCompute, newCompute);

const oldRenderRank = `<td className="px-4 py-3 text-center bg-indigo-50/30 flex justify-center items-center gap-1 min-w-[120px]">
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

const newRenderRank = `<td className="px-4 py-3 text-center bg-indigo-50/30 min-w-[140px]">
                          <div className="flex justify-center items-center gap-1">
                            <span className={\`px-2 py-1 text-[10px] font-black rounded uppercase \${student.rank === 'Xuất sắc' ? 'bg-purple-100 text-purple-700' : student.rank === 'Giỏi' ? 'bg-green-100 text-green-700' : student.rank === 'Khá' ? 'bg-blue-100 text-blue-700' : student.rank === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}\`}>
                              {student.rank}
                            </span>
                            
                            {student.baseRank === 'Giỏi' && !student.rankOverride && (
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

                            <div className="relative group ml-1" title="Tuỳ chỉnh xếp loại">
                              <select
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                value={student.rankOverride || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const field = periodType === 'term2' ? 'term2RankOverride' : periodType === 'term1' ? 'term1RankOverride' : 'yearRankOverride';
                                  onUpdateGrade(student.id, field, val);
                                }}
                              >
                                <option value="">Tự động</option>
                                <option value="Giỏi">Giỏi</option>
                                <option value="Khá">Khá</option>
                                <option value="Trung bình">Trung bình</option>
                                <option value="Yếu">Yếu</option>
                              </select>
                              <button className={\`p-1 rounded-full transition-colors \${student.rankOverride ? 'text-indigo-600 bg-indigo-100' : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'}\`}>
                                <Settings2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>`;

content = content.replace(oldRenderRank, newRenderRank);

const oldImports = `import { FileDown, FileUp, Save, Search, UserCircle, Calculator, Info, Filter, ArrowUpDown, ChevronDown, Check, Star } from 'lucide-react';`;
const newImports = `import { FileDown, FileUp, Save, Search, UserCircle, Calculator, Info, Filter, ArrowUpDown, ChevronDown, Check, Star, Settings2 } from 'lucide-react';`;

content = content.replace(oldImports, newImports);

fs.writeFileSync(file, content);
