const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

// 1. Add back scrollRef and scroll functions
const addScrolls = `  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };`;

c = c.replace(
  "  const fileInputRef = useRef<HTMLInputElement>(null);",
  addScrolls + "\n  const fileInputRef = useRef<HTMLInputElement>(null);"
);

// 2. Remove the old `menus` and old handlers
const duplicateRegex = /  const \[menus, setMenus\] = useState\(\[[\s\S]*?\]\);\n\n  const handleAddDish = \(dayIdx: number\) => \{[\s\S]*?\};\n\n  const handleDishChange = \(dayIdx: number, dishIdx: number, value: string\) => \{[\s\S]*?\};\n  \n  const handleRemoveDish = \(dayIdx: number, dishIdx: number\) => \{[\s\S]*?\};\n/m;
c = c.replace(duplicateRegex, "");

// 3. Fix the add dish, remove dish in render to not use old functions if any.
// We already replaced it with inline functions earlier. Let's make sure.
c = c.replace(/onClick=\{handleRemoveDish\}/g, "");
c = c.replace(/onClick=\{handleAddDish\}/g, "");
c = c.replace(/onChange=\{\(e\) => handleDishChange\(/g, "");

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
