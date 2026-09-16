const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(/onChange=\{\(e\) => handleDishChange\(dayIdx, dishIdx, e.target.value\)\}/g, `onChange={(e) => {
                          const newMenus = [...menus];
                          newMenus[dayIdx].dishes[dishIdx] = e.target.value;
                          setMenus(newMenus);
                        }}
                        onBlur={() => saveToFirebase(selectedWeek, { menus })}`);
                        
c = c.replace(/onClick=\{\(\) => handleRemoveDish\(dayIdx, dishIdx\)\}/g, `onClick={() => {
                        const newMenus = [...menus];
                        newMenus[dayIdx].dishes.splice(dishIdx, 1);
                        setMenus(newMenus);
                        saveToFirebase(selectedWeek, { menus: newMenus });
                      }}`);
                      
c = c.replace(/onClick=\{\(\) => handleAddDish\(dayIdx\)\}/g, `onClick={() => {
                      const newMenus = [...menus];
                      newMenus[dayIdx].dishes.push('');
                      setMenus(newMenus);
                      saveToFirebase(selectedWeek, { menus: newMenus });
                    }}`);
                    
fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
