const fs = require('fs');
let c = fs.readFileSync('src/components/Login.tsx', 'utf8');

c = c.replace(/placeholder="VD: 20252026_0001"/g, 'placeholder="VD: 54011xxxxxx"');

fs.writeFileSync('src/components/Login.tsx', c);
