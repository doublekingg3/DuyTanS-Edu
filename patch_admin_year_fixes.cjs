const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "  const [yearFormData, setYearFormData] = useState({ name: '' });",
  "  const [yearFormData, setYearFormData] = useState({ name: '' });\n  const activeYears = schoolYears.filter(y => !y.isDeleted);\n  const deletedYears = schoolYears.filter(y => y.isDeleted);"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
