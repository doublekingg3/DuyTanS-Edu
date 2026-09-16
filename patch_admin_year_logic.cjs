const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const newYearLogic = `
  const handleDeleteYear = async (id: string) => {
    const hasClasses = classes.some(c => c.schoolYearId === id && !c.isDeleted);
    if (hasClasses) {
      showAlert('Không thể xóa năm học này vì đang có lớp học. Vui lòng xóa hoặc chuyển các lớp trước.', 'error');
      return;
    }
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn chuyển năm học này vào thùng rác?');
    if (isConfirmed) {
      try {
        await setDoc(doc(db, 'school_years', id), { isDeleted: true }, { merge: true });
        showAlert('Đã chuyển năm học vào thùng rác.', 'success');
      } catch (e) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };

  const handleDeleteSelectedYears = async () => {
    if (selectedYearIds.length === 0) return;
    const yearsWithClasses = selectedYearIds.filter(id => classes.some(c => c.schoolYearId === id && !c.isDeleted));
    if (yearsWithClasses.length > 0) {
      showAlert('Không thể xóa: Có năm học đang chứa lớp học.', 'error');
      return;
    }
    const isConfirmed = await showConfirm(\`Bạn có chắc chắn muốn chuyển \${selectedYearIds.length} năm học đã chọn vào thùng rác?\`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedYearIds.forEach(id => {
          batch.set(doc(db, 'school_years', id), { isDeleted: true }, { merge: true });
        });
        await batch.commit();
        setSelectedYearIds([]);
        showAlert('Đã chuyển các năm học vào thùng rác.', 'success');
      } catch (error) {
        showAlert('Lỗi khi chuyển vào thùng rác.', 'error');
      }
    }
  };
`;

c = c.replace(
  /  const handleDeleteYear = async \(id: string\) => {[\s\S]*?  };\n/m,
  newYearLogic + "\n"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
