const fs = require('fs');
const file = 'src/components/TeacherGrades.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldGetRank = `  const getRank = (avgStr: string, currentGrades: Grades, visibleSubjs: Set<keyof Grades>, isExcellent?: boolean) => {
    const avg = parseFloat(avgStr);
    
    let hasBelow65 = false;
    let hasBelow50 = false;
    let hasBelow35 = false;
    let hasFail = false;

    (Object.entries(currentGrades) as [keyof Grades, string | number][]).forEach(([key, val]) => {
      if (!visibleSubjs.has(key)) return;
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
    if (avg >= 6.5 && !hasBelow50 && (math >= 6.5 || literature >= 6.5)) {
      return 'Khá';
    }
    if (avg >= 5.0 && !hasBelow35 && (math >= 5.0 || literature >= 5.0)) {
      return 'Trung bình';
    }
    
    return 'Yếu';
  };`;

const newGetRank = `  const getRank = (avgStr: string, currentGrades: Grades, visibleSubjs: Set<keyof Grades>, isExcellent?: boolean) => {
    const avg = parseFloat(avgStr);
    
    let hasBelow65 = false;
    let hasBelow50 = false;
    let hasBelow35 = false;
    let hasFail = false;

    (Object.entries(currentGrades) as [keyof Grades, string | number][]).forEach(([key, val]) => {
      if (!visibleSubjs.has(key)) return;
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
  };`;

content = content.replace(oldGetRank, newGetRank);
fs.writeFileSync(file, content);
