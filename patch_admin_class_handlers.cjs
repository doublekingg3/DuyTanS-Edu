const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const handlers = `
  const handleDeleteClass = async (classId: string) => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn chuyển lớp này vào thùng rác?');
    if (isConfirmed) {
      try {
        await setDoc(doc(db, 'classes', classId), { isDeleted: true }, { merge: true });
        showAlert('Đã chuyển lớp vào thùng rác.', 'success');
      } catch (error) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };

  const handleDeleteSelectedClasses = async () => {
    if (selectedClassIds.length === 0) return;
    const isConfirmed = await showConfirm(\`Bạn có chắc chắn muốn chuyển \${selectedClassIds.length} lớp đã chọn vào thùng rác?\`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedClassIds.forEach(id => {
          batch.set(doc(db, 'classes', id), { isDeleted: true }, { merge: true });
        });
        await batch.commit();
        setSelectedClassIds([]);
        showAlert('Đã chuyển các lớp vào thùng rác.', 'success');
      } catch (error) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };
`;

c = c.replace(
  "  const handleSaveClass = async () => {",
  handlers + "\n  const handleSaveClass = async () => {"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
