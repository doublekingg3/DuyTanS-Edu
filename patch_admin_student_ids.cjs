const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const targetFunctionLocation = `  const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {`;

const newFunction = `  const handleSortAndGenerateStudentIDs = async () => {
    const confirm = await showConfirm('Bạn có chắc chắn muốn sắp xếp lại toàn bộ Mã Học Sinh theo chuẩn mới không? Hành động này sẽ thay đổi mã của tất cả học sinh theo cấu trúc: [Năm học][STT].');
    if (!confirm) return;

    try {
      let prefix = "2627";
      if (schoolYears && schoolYears.length > 0) {
        const latestYear = schoolYears.reduce((latest, current) => (current.name > latest.name ? current : latest), schoolYears[0]);
        const match = latestYear.name.match(/\\d{4}/g);
        if (match && match.length >= 2) {
          prefix = match[0].slice(-2) + match[1].slice(-2);
        } else if (match && match.length === 1) {
          prefix = match[0].slice(-2) + (parseInt(match[0].slice(-2)) + 1).toString().padStart(2, '0');
        }
      }

      const sortedClasses = [...classes].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      
      const getFirstName = (fullName) => {
        const parts = fullName.trim().split(' ');
        return parts.length > 0 ? parts[parts.length - 1] : '';
      };

      let counter = 1;
      const CHUNK_SIZE = 400;
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const cls of sortedClasses) {
        const classStudents = students.filter(s => s.classId === cls.id);
        classStudents.sort((a, b) => getFirstName(a.fullName).localeCompare(getFirstName(b.fullName), 'vi'));

        for (const student of classStudents) {
          const newCode = prefix + String(counter).padStart(4, '0');
          const studentRef = doc(db, 'students', student.id);
          batch.update(studentRef, { code: newCode });
          counter++;
          batchCount++;

          if (batchCount >= CHUNK_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      showAlert('Sắp xếp mã học sinh thành công!', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Có lỗi khi sắp xếp mã học sinh', 'error');
    }
  };

  const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {`;

c = c.replace(targetFunctionLocation, newFunction);

const buttonTarget = `                <button 
                  onClick={openAddUserModal}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Thêm
                </button>`;

const buttonReplace = `                <button 
                  onClick={handleSortAndGenerateStudentIDs}
                  className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
                  title="Tự động xếp Mã Học Sinh toàn trường theo A-Z (Ví dụ: 26270001)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Sắp xếp mã học sinh
                </button>
                <button 
                  onClick={openAddUserModal}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Thêm
                </button>`;

c = c.replace(buttonTarget, buttonReplace);

fs.writeFileSync('src/components/AdminView.tsx', c);
