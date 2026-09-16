const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// 1. Remove the old handleDeleteClass
c = c.replace(
  /  const handleDeleteClass = async \(classId: string\) => {[\s\S]*?  const openEditModal/m,
  "  const openEditModal"
);

// 2. Add student check to the NEW handleDeleteClass
const newHandleDeleteClass = `
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
`;
c = c.replace(
  /  const handleDeleteClass = async \(classId: string\) => {[\s\S]*?    }\n  };/m,
  newHandleDeleteClass
);

// 3. Add student check to bulk delete
const newHandleDeleteSelectedClasses = `
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
`;
c = c.replace(
  /  const handleDeleteSelectedClasses = async \(\) => {[\s\S]*?    }\n  };/m,
  newHandleDeleteSelectedClasses
);

// 4. Remove the extra trash button in the UI
// The UI currently has:
// <button onClick={() => handleDeleteClass(c.id)} ... title="Chuyển vào thùng rác"> <Trash2 ... /> </button>
// ... promote ... edit ...
// <button onClick={() => handleDeleteClass(c.id)} ... title="Xóa lớp"> <Trash2 ... /> </button>
const extraTrashSearch = `                            <button 
                              onClick={() => handleDeleteClass(c.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa lớp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>`;
c = c.replace(extraTrashSearch, "");

fs.writeFileSync('src/components/AdminView.tsx', c);
