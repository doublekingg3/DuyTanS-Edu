const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/          \/>\s*<div className="flex flex-col h-\[calc\(100vh-64px\)\]">/, '          />\n        ) : (\n          <div className="flex flex-col h-[calc(100vh-64px)]">');
fs.writeFileSync('src/App.tsx', c);
