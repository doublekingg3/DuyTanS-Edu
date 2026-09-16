const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/          \/>                          <div className="flex flex-col h-\[calc\(100vh-64px\)\]">/, \`          />
        ) : (
          <div className="flex flex-col h-[calc(100vh-64px)]">\`);

fs.writeFileSync('src/App.tsx', c);
