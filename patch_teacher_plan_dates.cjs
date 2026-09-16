const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

const oldState = `  const [weeks, setWeeks] = useState(() => Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    name: \`Tuần \${i + 1}\`,
    status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty',
    startDate: (i < 2 || i === 4) ? '2024-09-30' : '',
    endDate: (i < 2 || i === 4) ? '2024-10-05' : ''
  })));`;

const newState = `  const [weeks, setWeeks] = useState(() => {
    const startYearStr = schoolYearName ? schoolYearName.match(/\\d{4}/)?.[0] : null;
    const startYear = startYearStr ? parseInt(startYearStr) : new Date().getFullYear();
    const baseDate = new Date(startYear, 8, 5); // 5th Sept

    return Array.from({ length: 42 }, (_, i) => {
      const sDate = new Date(baseDate);
      sDate.setDate(sDate.getDate() + (i * 7));
      
      const eDate = new Date(sDate);
      eDate.setDate(eDate.getDate() + 5); 

      const isMocked = (i < 2 || i === 4);
      
      return {
        id: i + 1,
        name: \`Tuần \${i + 1}\`,
        status: i < 2 ? 'approved' : i === 4 ? 'draft' : 'empty',
        startDate: isMocked ? sDate.toISOString().split('T')[0] : '',
        endDate: isMocked ? eDate.toISOString().split('T')[0] : ''
      };
    });
  });

  React.useEffect(() => {
    const startYearStr = schoolYearName ? schoolYearName.match(/\\d{4}/)?.[0] : null;
    const startYear = startYearStr ? parseInt(startYearStr) : new Date().getFullYear();
    const baseDate = new Date(startYear, 8, 5); // 5th Sept

    setWeeks(prev => prev.map((w, i) => {
      const sDate = new Date(baseDate);
      sDate.setDate(sDate.getDate() + (i * 7));
      const eDate = new Date(sDate);
      eDate.setDate(eDate.getDate() + 5); 
      
      const isMocked = (i < 2 || i === 4);
      if (isMocked && (!w.startDate || w.startDate.startsWith('2024'))) {
        return { ...w, startDate: sDate.toISOString().split('T')[0], endDate: eDate.toISOString().split('T')[0] };
      }
      return w;
    }));
  }, [schoolYearName]);`;

c = c.replace(oldState, newState);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
