const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /return count > 0 \? \(total \/ count\)\.toFixed\(2\) : '0\.00';/g,
    "return count > 0 ? (Math.round((total / count) * 10) / 10).toFixed(1) : '0.0';"
  );
  fs.writeFileSync(file, content);
}

fixFile('src/components/TeacherGrades.tsx');
