const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "const handleDeleteSelectedUsers = async () => {",
  "const handleDeleteSelectedUsers = async () => {\n    showAlert('Test Delete Bulk Clicked', 'info');\n"
);

c = c.replace(
  "const handleDeleteUser = async (userId: string) => {",
  "const handleDeleteUser = async (userId: string) => {\n    showAlert('Test Delete Single Clicked', 'info');\n"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
