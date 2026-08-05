import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// Undo the injection into Class modal
const badClassBlockRegex = /<\/div>\s*\{userFormData\.role === 'teacher' && \([\s\S]*?\}\s*\)\s*\}/;
code = code.replace(badClassBlockRegex, '</div>');
fs.writeFileSync('src/components/AdminView.tsx', code);
