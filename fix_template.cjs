const fs = require('fs');
const file = 'src/components/TeacherStudents.tsx';
let code = fs.readFileSync(file, 'utf8');

const exportReplacement = `  const handleExportTemplate = async () => {
    try {
      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      const yearStr = currentYear?.id || '20242027';

      const XLSX = await import('xlsx');
      const headers = ['Họ và Tên', 'Giới tính', 'Dân tộc', 'Ngày sinh', 'Nơi sinh', 'Niên khoá'];
      const data = [
        ['Nguyễn Văn A', 'Nam', 'Kinh', '01/01/2008', 'TP.HCM', yearStr],
        ['Trần Thị B', 'Nữ', 'Kinh', '15/02/2008', 'Hà Nội', yearStr]
      ];
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hoc_Sinh');
      XLSX.writeFile(wb, 'Mau_Nhap_Danh_Sach_Hoc_Sinh.xlsx');
    } catch (error) {
      console.error('Lỗi khi tạo file mẫu:', error);
      showAlert('Có lỗi khi tạo file Excel.', 'error');
    }
  };`;

const importReplacement = `  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!classId) {
      showAlert('Vui lòng chọn lớp trước khi import học sinh.', 'error');
      if (e.target) e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      if (!rows || rows.length <= 1) {
        showAlert('File không có dữ liệu.', 'error');
        return;
      }
      
      const headersRow = rows[0] as string[];
      const nameIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Họ và Tên'));
      const genderIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Giới tính'));
      const ethnicityIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Dân tộc'));
      const dobIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Ngày sinh'));
      const pobIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Nơi sinh'));
      const cohortIdx = headersRow.findIndex(h => h && typeof h === 'string' && h.includes('Niên khoá'));
      
      if (nameIdx === -1) {
        showAlert('File không đúng mẫu. Thiếu cột "Họ và Tên".', 'error');
        return;
      }
      
      const validRows = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const fullName = row[nameIdx]?.toString();
        if (!fullName) continue;
        validRows.push(row);
      }

      if (validRows.length === 0) {
        showAlert('Không tìm thấy dữ liệu hợp lệ trong file.', 'info');
        return;
      }

      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      
      let cohort = validRows[0][cohortIdx]?.toString();
      if (!cohort) {
        cohort = currentYear?.id || '20242027';
      }

      let nextStartId = 1;
      try {
        const counterRef = doc(db, 'counters', \`studentCode_\${cohort}\`);
        nextStartId = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          let lastId = 0;
          if (counterDoc.exists()) {
            lastId = counterDoc.data().lastId || 0;
          }
          const nextId = lastId + 1;
          transaction.set(counterRef, { lastId: lastId + validRows.length }, { merge: true });
          return nextId;
        });
      } catch (err) {
        console.error("Error generating student code:", err);
        showAlert('Có lỗi khi tạo mã học sinh tự động. Vui lòng thử lại.', 'error');
        return;
      }

      const newStudents: Student[] = [];
      validRows.forEach((row, idx) => {
        const fullName = row[nameIdx]?.toString();
        const id = uuidv4();
        const stt = nextStartId + idx;
        const code = \`\${cohort}_\${stt.toString().padStart(4, '0')}\`;
        
        newStudents.push({
          id,
          code,
          classId: classId,
          stt: students.length + idx + 1,
          fullName: fullName as string,
          gender: row[genderIdx]?.toString() === 'Nữ' ? 'Nữ' : 'Nam',
          ethnicity: row[ethnicityIdx]?.toString() || 'Kinh',
          dob: row[dobIdx]?.toString() || '01/01/2008',
          pob: row[pobIdx]?.toString() || '',
          grades: {} as Grades,
          academicPerformance: '',
          conduct: '',
          cp: 0,
          kp: 0,
          award: '',
          status: 'Đang học',
          notifications: [],
          comments: []
        });
      });
      
      if (newStudents.length > 0) {
        if (onAddMultipleStudents) {
          onAddMultipleStudents(newStudents);
          showAlert(\`Đã import thành công \${newStudents.length} học sinh.\`, 'success');
        } else {
          for (const s of newStudents) {
            onAddStudent(s);
          }
          showAlert(\`Đã import thành công \${newStudents.length} học sinh.\`, 'success');
        }
      }
    } catch (error) {
      console.error('Lỗi khi import Excel:', error);
      showAlert('Có lỗi khi đọc file Excel.', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };`;

const saveReplacement = `  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const currentClass = classes.find(c => c.id === classId);
      const currentYear = schoolYears.find(y => y.id === currentClass?.schoolYearId);
      const defaultCohort = currentYear?.id || '20242027';
      
      let cohort = window.prompt("Nhập niên khoá cho học sinh này (ví dụ: 20242027):", defaultCohort);
      if (!cohort || cohort.trim() === '') {
        showAlert('Cần có niên khoá để tạo mã học sinh.', 'error');
        return;
      }
      
      let nextId = 1;
      try {
        const counterRef = doc(db, 'counters', \`studentCode_\${cohort}\`);
        nextId = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          let lastId = 0;
          if (counterDoc.exists()) {
            lastId = counterDoc.data().lastId || 0;
          }
          const next = lastId + 1;
          transaction.set(counterRef, { lastId: next }, { merge: true });
          return next;
        });
      } catch (err) {
        console.error("Error generating student code:", err);
        showAlert('Có lỗi khi tạo mã học sinh. Thử lại sau.', 'error');
        return;
      }

      const newStudent: Student = {
        ...(editForm as Student),
        id: uuidv4(),
        code: \`\${cohort}_\${nextId.toString().padStart(4, '0')}\`,
        classId: classId,
        stt: students.length + 1
      };
      onAddStudent(newStudent);
      setSelectedStudent(newStudent);
    } else {
      onEditStudent(editForm as Student);
      setSelectedStudent(editForm as Student);
    }
    setIsModalOpen(false);
  };`;

code = code.replace(/const handleExportTemplate = async \(\) => \{[\s\S]*?showAlert\('Có lỗi khi tạo file Excel\.', 'error'\);\n    \}\n  \};/, exportReplacement);
code = code.replace(/const handleImportExcel = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(e\.target\) e\.target\.value = '';\n    \}\n  \};/, importReplacement);
code = code.replace(/const handleSaveModal = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsModalOpen\(false\);\n  \};/, saveReplacement);

fs.writeFileSync(file, code);
