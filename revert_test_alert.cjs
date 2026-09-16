const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "const handleDeleteSelectedUsers = async () => {\n    showAlert('Test Delete Bulk Clicked', 'info');\n",
  "const handleDeleteSelectedUsers = async () => {\n"
);

c = c.replace(
  "const handleDeleteUser = async (userId: string) => {\n    showAlert('Test Delete Single Clicked', 'info');\n",
  "const handleDeleteUser = async (userId: string) => {\n"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
