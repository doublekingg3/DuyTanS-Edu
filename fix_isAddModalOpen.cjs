const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/setIsAddClassModalOpen/g, "setIsAddModalOpen");
fs.writeFileSync('src/components/AdminView.tsx', c);
