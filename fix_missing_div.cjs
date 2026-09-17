const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/<\/table>\n\s*\)\}/g, '</table>\n                </div>\n              )}');

fs.writeFileSync('src/components/AdminView.tsx', c);
