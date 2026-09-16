const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(
  "const [weeks, setWeeks] = useState<{id: number, name: string, status: string}[]>([]);",
  "const [weeks, setWeeks] = useState<{id: number, name: string, status: string, startDate?: string, endDate?: string}[]>([]);"
);

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
