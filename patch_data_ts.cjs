const fs = require('fs');
let c = fs.readFileSync('src/data.ts', 'utf8');

c = c.replace(
  "export interface UserAccount {",
  "export interface UserAccount {\n  isDeleted?: boolean;"
);

fs.writeFileSync('src/data.ts', c);
