import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetOpenAddModal = `
  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ schoolYearId: schoolYears[0]?.id || '', name: '', homeroomTeacher: '', specialization: '' });
    setIsAddModalOpen(true);
  };
`;

const replacementOpenAddModal = `
  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ schoolYearId: classFilterYear || schoolYears[0]?.id || '', name: '', homeroomTeacher: '', specialization: '' });
    setIsAddModalOpen(true);
  };
`;

code = code.replace(targetOpenAddModal.trim(), replacementOpenAddModal.trim());
fs.writeFileSync('src/components/AdminView.tsx', code);
