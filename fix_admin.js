import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const replacement = `
  const handleSaveClass = async () => {
    if (!formData.name.trim() || !formData.homeroomTeacher.trim() || !formData.schoolYearId) {
      showAlert('Vui lòng điền đầy đủ thông tin (Năm học, Tên lớp, GVCN)', 'error');
      return;
    }

    const classId = editingClass ? editingClass.id : \`\${formData.schoolYearId}-\${formData.name.replace(/\\s+/g, '')}\`;
    
    const classData = {
      id: classId,
      name: formData.name,
      homeroomTeacher: formData.homeroomTeacher,
      specialization: formData.specialization
    };

    try {
      const docRef = doc(db, 'classes', classId);
      await setDoc(docRef, classData);
      setIsAddModalOpen(false);
      setEditingClass(null);
      setFormData({ schoolYearId: schoolYears[0]?.id || '', name: '', homeroomTeacher: '', specialization: '' });
      showAlert('Lưu lớp học thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi lưu lớp:', error);
      showAlert('Đã xảy ra lỗi khi lưu lớp học.', 'error');
    }
  };

  const handleSaveYear = async () => {
    if (!yearFormData.name.trim()) {
      showAlert('Vui lòng nhập tên năm học', 'error');
      return;
    }
    
    const yearId = editingYear ? editingYear.id : yearFormData.name.replace(/[^a-zA-Z0-9]/g, '');
    
    try {
      const docRef = doc(db, 'schoolYears', yearId);
      await setDoc(docRef, { id: yearId, name: yearFormData.name });
      setIsAddYearModalOpen(false);
      setEditingYear(null);
      setYearFormData({ name: '' });
      showAlert('Lưu năm học thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi lưu năm học:', error);
      showAlert('Đã xảy ra lỗi.', 'error');
    }
  };

  const handleDeleteYear = async (yearId) => {
    const hasClasses = classes.some(c => c.id.startsWith(yearId + '-'));
    if (hasClasses) {
      showAlert('Không thể xóa năm học vì đang có lớp học thuộc năm này.', 'error');
      return;
    }
    if (await showConfirm('Bạn có chắc chắn muốn xóa năm học này?')) {
      await deleteDoc(docRef(db, 'schoolYears', yearId));
      showAlert('Xóa năm học thành công.', 'success');
    }
  };
  
  const handlePromoteSubmit = async () => {
    if (!promoteClassData?.targetClassId) {
      showAlert('Vui lòng chọn lớp mới để chuyển học sinh đến.', 'error');
      return;
    }
    if (promoteClassData.studentsToPromote.size === 0) {
      showAlert('Vui lòng chọn ít nhất 1 học sinh.', 'error');
      return;
    }
    try {
      const batch = writeBatch(db);
      let count = 0;
      Array.from(promoteClassData.studentsToPromote).forEach(studentId => {
        const docRef = doc(db, 'students', studentId);
        batch.update(docRef, { classId: promoteClassData.targetClassId });
        count++;
      });
      await batch.commit();
      showAlert(\`Đã chuyển thành công \${count} học sinh lên lớp mới.\`, 'success');
      setIsPromoteModalOpen(false);
      setPromoteClassData(null);
    } catch (err) {
      console.error(err);
      showAlert('Đã xảy ra lỗi.', 'error');
    }
  };

  const handleDeleteClass = async (classId) => {
    const hasStudents = students.some(s => s.classId === classId);
    if (hasStudents) {
      showAlert('Không thể xóa lớp học này vì đang có học sinh. Vui lòng chuyển học sinh sang lớp khác trước.', 'error');
      return;
    }
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa lớp học này?');
    if (isConfirmed) {
      try {
        const docRef = doc(db, 'classes', classId);
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Lỗi khi xóa lớp:', error);
        showAlert('Đã xảy ra lỗi khi xóa lớp học.', 'error');
      }
    }
  };

  const openEditModal = (c) => {
    setEditingClass(c);
    setFormData({ schoolYearId: c.id.split('-')[0] || schoolYears[0]?.id || '', name: c.name, homeroomTeacher: c.homeroomTeacher, specialization: c.specialization || '' });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ schoolYearId: schoolYears[0]?.id || '', name: '', homeroomTeacher: '', specialization: '' });
    setIsAddModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userFormData.username.trim() || !userFormData.fullName.trim() || (!editingUser && !userFormData.password)) {
      showAlert('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    const userId = editingUser ? editingUser.id : uuidv4();
    const userData = {
      id: userId,
      username: userFormData.username,
      fullName: userFormData.fullName,
      role: userFormData.role
    };
    if (userFormData.password) {
      userData.password = userFormData.password;
    } else if (editingUser) {
      userData.password = editingUser.password;
    }
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, userData);
      setIsAddUserModalOpen(false);
      setEditingUser(null);
      setUserFormData({ username: '', password: '', fullName: '', role: 'teacher' });
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
      showAlert('Đã xảy ra lỗi khi lưu tài khoản.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
`;

// Find where handleSaveClass starts
const startIdx = code.indexOf('const handleSaveClass = async () => {');
// Find where handleDeleteUser starts
const endIdx = code.indexOf('const handleDeleteUser = async (userId: string) => {');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacement.trim() + " {\n" + code.substring(endIdx + 52);
  fs.writeFileSync('src/components/AdminView.tsx', code);
} else {
  console.error("Could not find bounds");
}
