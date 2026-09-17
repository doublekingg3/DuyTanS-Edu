const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

c = c.replace(/const \[activeTab, setActiveTab\] = useState\<'grades' \| 'schedule' \| 'notifications' \| 'attendance' \| 'history' \| 'lunch_menu'\>\('grades'\);/g, 
  "const [activeTab, setActiveTab] = useState<'attendance' | 'schedule' | 'lunch_menu' | 'overview'>('attendance');");

// Remove the grid (Học lực, Hạnh kiểm, CP, KP)
const gridRegex = /<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 bg-white">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
// Wait, the grid ends with </div></div>. Let's just do a specific string replace or a careful regex.
