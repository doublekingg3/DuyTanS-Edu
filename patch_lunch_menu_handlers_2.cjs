const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(/onChange=\{e => handleDishChange\(dayIdx, dishIdx, e\.target\.value\)\}/g, `onChange={(e) => {
                          const newMenus = [...menus];
                          newMenus[dayIdx].dishes[dishIdx] = e.target.value;
                          setMenus(newMenus);
                        }}
                        onBlur={() => saveToFirebase(selectedWeek, { menus })}`);
                        
fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
