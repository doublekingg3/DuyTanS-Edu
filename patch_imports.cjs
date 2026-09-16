const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/Calendar as CalendarIcon, Settings, Building2, Shield, BarChart2, Calendar/g, "Calendar as CalendarIcon, Settings, Building2, Shield, BarChart2");
c = c.replace(/icon: Calendar/g, "icon: CalendarIcon");

fs.writeFileSync('src/components/TeacherView.tsx', c);
