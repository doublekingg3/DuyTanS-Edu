const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

const handlers = `
  const handleDeleteSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    const isConfirmed = await showConfirm(\`Bạn có chắc chắn muốn xóa vĩnh viễn \${selectedStudentIds.length} học sinh đã chọn?\`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedStudentIds.forEach(id => {
          batch.delete(doc(db, 'students', id));
        });
        await batch.commit();
        setSelectedStudentIds([]);
        showAlert('Xóa học sinh thành công', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  const handleDeleteSingle = async (id: string) => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa vĩnh viễn học sinh này?');
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, 'students', id));
        if (selectedStudentIds.includes(id)) {
          setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
        }
        showAlert('Xóa học sinh thành công', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };
`;

c = c.replace(
  "  const handleAddNewStudent = () => {",
  handlers + "\n  const handleAddNewStudent = () => {"
);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
