const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

// 1. Remove the label
c = c.replace(/<div className="flex items-center gap-3 mb-2">\s*<span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">Bán trú 2024 - 2025<\/span>\s*<\/div>/g, "");

// 2. Modify the weeks data fetching to include startDate and endDate based on schoolYearName
const fetchingRegex = /const newWeeks = Array\.from\(\{ length: 42 \}, \(_, i\) => \{[\s\S]*?return \{[\s\S]*?id: weekId,[\s\S]*?name: `Tuần \$\{weekId\}`,[\s\S]*?status: weekData\?\.status \|\| 'empty'[\s\S]*?\};\n\s*\}\);/;

const fetchingReplacement = `const startYearStr = schoolYearName ? schoolYearName.match(/\\d{4}/)?.[0] : null;
      const startYear = startYearStr ? parseInt(startYearStr) : new Date().getFullYear();
      const baseDate = new Date(startYear, 8, 5); // 5th Sept

      const newWeeks = Array.from({ length: 42 }, (_, i) => {
        const weekId = i + 1;
        const weekData = data?.weeks?.[weekId];
        
        const sDate = new Date(baseDate);
        sDate.setDate(sDate.getDate() + (i * 7));
        const eDate = new Date(sDate);
        eDate.setDate(eDate.getDate() + 5);
        
        return {
          id: weekId,
          name: \`Tuần \${weekId}\`,
          status: weekData?.status || 'empty',
          startDate: weekData?.startDate || sDate.toISOString().split('T')[0],
          endDate: weekData?.endDate || eDate.toISOString().split('T')[0]
        };
      });`;

c = c.replace(fetchingRegex, fetchingReplacement);

// 3. Update the HTML inputs
const htmlInputRegex = /<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">\s*<div>\s*<label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày \(Bắt đầu\)<\/label>\s*<input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" defaultValue="[^"]*" \/>[\s\S]*?<label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày \(Kết thúc\)<\/label>\s*<input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" defaultValue="[^"]*" \/>[\s\S]*?<\/div>/;

const htmlInputReplacement = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Từ ngày (Bắt đầu)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.startDate || ''}
                onChange={(e) => saveToFirebase(selectedWeek, { startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Đến ngày (Kết thúc)</label>
              <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" 
                value={weeks.find(w => w.id === selectedWeek)?.endDate || ''}
                onChange={(e) => saveToFirebase(selectedWeek, { endDate: e.target.value })}
              />
            </div>
            <div>`;

c = c.replace(htmlInputRegex, htmlInputReplacement);

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
