import fs from 'fs';
let code = fs.readFileSync('src/components/TeacherGrades.tsx', 'utf8');

// The block:
/*
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const studentId = row[0]?.toString();
        if (!studentId) continue;
        
        }
        Object.entries(fieldsMap).forEach(([colIndex, field]) => {
*/

code = code.replace(
  "        const studentId = row[0]?.toString();\n        if (!studentId) continue;\n        \n        }\n        Object.entries(fieldsMap).forEach",
  "        const studentId = row[0]?.toString();\n        if (!studentId) continue;\n        \n        Object.entries(fieldsMap).forEach"
);

// The block:
/*
      }
      
      }
      if (updates.length > 0) {
*/

code = code.replace(
  "      }\n      \n      }\n      if (updates.length > 0) {",
  "      }\n      }\n      \n      if (updates.length > 0) {"
);

fs.writeFileSync('src/components/TeacherGrades.tsx', code);
