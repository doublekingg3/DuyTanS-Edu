import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');
const lines = code.split('\n');

// We want to delete from line 932 to 1012 (inclusive)
// Array is 0-indexed, so line 932 is index 931.
lines.splice(931, 1012 - 932 + 1);

fs.writeFileSync('src/components/AdminView.tsx', lines.join('\n'));
