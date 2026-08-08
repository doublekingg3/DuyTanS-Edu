const fs = require('fs');
const file = 'src/components/ParentView.tsx';
let content = fs.readFileSync(file, 'utf8');

const rankFunc = `
  const getRank = (avgStr: string, currentGrades: Grades, isExcellent?: boolean) => {
    const avg = parseFloat(avgStr);
    
    let hasBelow65 = false;
    let hasBelow50 = false;
    let hasBelow35 = false;
    let hasFail = false;

    (Object.entries(currentGrades) as [keyof Grades, string | number][]).forEach(([key, val]) => {
      if (val === 'CĐ') {
        hasFail = true;
      } else if (typeof val === 'number') {
        if (val < 6.5) hasBelow65 = true;
        if (val < 5.0) hasBelow50 = true;
        if (val < 3.5) hasBelow35 = true;
      }
    });

    const math = typeof currentGrades.math === 'number' ? currentGrades.math : 0;
    const literature = typeof currentGrades.literature === 'number' ? currentGrades.literature : 0;

    if (hasFail) return 'Yếu';

    if (avg >= 8.0 && !hasBelow65 && (math >= 8.0 || literature >= 8.0)) {
      return isExcellent ? 'Xuất sắc' : 'Giỏi';
    }
    if (avg >= 6.5 && !hasBelow50) {
      return 'Khá';
    }
    if (avg >= 5.0 && !hasBelow35) {
      return 'Trung bình';
    }
    
    return 'Yếu';
  };
`;

const insertPoint = `  // Calculate average for the simulated period`;
content = content.replace(insertPoint, rankFunc + "\n" + insertPoint);

const oldAvgRender = `                    <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                      Trung bình: <span className="text-lg">{currentAvg}</span>
                    </div>`;

const newAvgRender = `                    <div className="flex gap-2">
                      <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                        Trung bình: <span className="text-lg">{currentAvg}</span>
                      </div>
                      <div className={\`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 \${
                        periodRank === 'Xuất sắc' ? 'bg-purple-100 text-purple-700' :
                        periodRank === 'Giỏi' ? 'bg-green-100 text-green-700' : 
                        periodRank === 'Khá' ? 'bg-blue-100 text-blue-700' : 
                        periodRank === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }\`}>
                        Xếp loại: <span className="text-lg uppercase">{periodRank}</span>
                      </div>
                    </div>`;

content = content.replace(oldAvgRender, newAvgRender);

const rankCalc = `  const periodRank = useMemo(() => {
    if (periodType !== 'term1' && periodType !== 'term2' && periodType !== 'year') return '';
    
    const isExcellent = periodType === 'term2' ? student.term2IsExcellent : periodType === 'term1' ? student.term1IsExcellent : student.yearIsExcellent;
    const rankOverride = periodType === 'term2' ? student.term2RankOverride : periodType === 'term1' ? student.term1RankOverride : student.yearRankOverride;
    
    const calculatedRank = getRank(currentAvg.toString(), currentGrades, isExcellent);
    return rankOverride ? rankOverride : calculatedRank;
  }, [currentAvg, currentGrades, periodType, student]);`;

const insertCalcPoint = `  // Prepare data for Chart`;
content = content.replace(insertCalcPoint, rankCalc + "\n\n" + insertCalcPoint);

fs.writeFileSync(file, content);
