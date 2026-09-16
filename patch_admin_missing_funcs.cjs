const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const missingFuncs = `
  const handleSaveClass = async () => {
    if (!formData.name || !formData.homeroomTeacher) {
      showAlert('Vui lòng nhập tên lớp và giáo viên chủ nhiệm.', 'error');
      return;
    }
    try {
      if (editingClass) {
        await setDoc(doc(db, 'classes', editingClass.id), formData, { merge: true });
        showAlert('Cập nhật lớp thành công.', 'success');
      } else {
        const newClass = { ...formData, id: uuidv4() };
        await setDoc(doc(db, 'classes', newClass.id), newClass);
        showAlert('Thêm lớp mới thành công.', 'success');
      }
      setIsAddModalOpen(false);
    } catch (e) {
      showAlert('Lỗi khi lưu lớp.', 'error');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const hasStudents = students.some(s => s.classId === classId && !s.isDeleted);
    if (hasStudents) {
      showAlert('Không thể xóa lớp học này vì đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.', 'error');
      return;
    }
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
    
    // Check if any selected class has students
    const classesWithStudents = selectedClassIds.filter(id => students.some(s => s.classId === id && !s.isDeleted));
    if (classesWithStudents.length > 0) {
      showAlert('Không thể xóa: Có lớp học đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.', 'error');
      return;
    }

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

  const handleSaveYear = async () => {
    if (!yearFormData.name) {
      showAlert('Vui lòng nhập tên năm học.', 'error');
      return;
    }
    try {
      const yearId = yearFormData.name.replace(/[^0-9]/g, '');
      const data = { id: yearId, name: yearFormData.name };
      await setDoc(doc(db, 'school_years', yearId), data, { merge: true });
      showAlert('Lưu năm học thành công.', 'success');
      setIsAddYearModalOpen(false);
    } catch (e) {
      showAlert('Lỗi khi lưu năm học.', 'error');
    }
  };

  const handleDeleteYear = async (id: string) => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa năm học này?');
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, 'school_years', id));
        showAlert('Xóa năm học thành công.', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa năm học.', 'error');
      }
    }
  };

  const handlePromoteSubmit = async () => {
    if (!promoteClassData || !promoteClassData.targetClassId) {
      showAlert('Vui lòng chọn lớp đích.', 'error');
      return;
    }
    if (promoteClassData.studentsToPromote.size === 0) {
      showAlert('Vui lòng chọn ít nhất 1 học sinh.', 'error');
      return;
    }
    try {
      const batch = writeBatch(db);
      promoteClassData.studentsToPromote.forEach(studentId => {
        batch.set(doc(db, 'students', studentId), { classId: promoteClassData.targetClassId }, { merge: true });
      });
      await batch.commit();
      showAlert('Chuyển lớp thành công.', 'success');
      setIsPromoteModalOpen(false);
      setPromoteClassData(null);
    } catch (e) {
      showAlert('Lỗi khi chuyển lớp.', 'error');
    }
  };
`;

c = c.replace(
  "  const openEditModal = (c: SchoolClass) => {",
  missingFuncs + "\n  const openEditModal = (c: SchoolClass) => {"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
