const fs = require('fs');
let c = fs.readFileSync('src/data.ts', 'utf8');

c = c.replace(
  "export interface SchoolClass {",
  "export interface SchoolClass {\n  isDeleted?: boolean;"
);

fs.writeFileSync('src/data.ts', c);
